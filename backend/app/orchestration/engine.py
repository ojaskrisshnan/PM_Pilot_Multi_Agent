import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.database import SessionLocal
from backend.app.models.run import AgentRun
from backend.app.models.execution import AgentExecution
from backend.app.models.deliverable import Deliverable
from backend.app.models.project import Project
from backend.app.agents.registry import agent_registry
from backend.app.agents.runtime import AgentRuntime
from backend.app.metrics.calculator import MetricsCalculator
from backend.app.config import settings

logger = logging.getLogger(__name__)

# Active background tasks keyed by run_id
active_run_tasks: dict[str, asyncio.Task] = {}
paused_checkpoints: dict[str, str] = {}  # run_id -> waiting_agent_id

class OrchestrationEngine:
    @staticmethod
    def create_run(
        db: Session,
        project_id: str,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        auto_approve: bool = False
    ) -> AgentRun:
        agents = agent_registry.list_agents()
        chosen_provider = provider or "mock"
        run = AgentRun(
            project_id=project_id,
            status="PENDING",
            total_agents=len(agents),
            successful_agents=0,
            failed_agents=0,
            provider=chosen_provider,
            requested_provider=chosen_provider,
            actual_provider=chosen_provider,
            model=model or ("deterministic-mock" if chosen_provider == "mock" else settings.GEMINI_MODEL),
            auto_approve=auto_approve
        )
        db.add(run)
        db.flush()

        # Initialize all 17 agent execution records in PENDING status
        for idx, agent in enumerate(agents):
            execution = AgentExecution(
                run_id=run.id,
                agent_id=agent.id,
                agent_name=agent.name,
                phase_order=agent.phase_order,
                status="READY" if len(agent.dependencies) == 0 else "PENDING",
                input={
                    "dependencies": agent.dependencies,
                    "input_artifacts": agent.input_artifacts,
                    "tools": agent.tools,
                    "approval_required": agent.approval_required
                },
                output={},
                execution_time_ms=0,
                tokens_used=0,
                retry_count=0
            )
            db.add(execution)

        db.commit()
        db.refresh(run)
        return run

    @staticmethod
    async def start_run_async(run_id: str):
        """Dispatches run execution in an asynchronous background task."""
        task = asyncio.create_task(OrchestrationEngine.execute_run(run_id))
        active_run_tasks[run_id] = task
        return task

    @staticmethod
    async def execute_run(run_id: str, db: Optional[Session] = None):
        """
        Executes all 17 agents following the dependency graph.
        Passes upstream outputs to downstream agents.
        Supports pausing at Human-in-the-Loop checkpoints and resuming.
        Updates real database status at each state transition.
        """
        should_close = False
        if db is None:
            db = SessionLocal()
            should_close = True
        try:
            run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
            if not run or run.status in ["CANCELLED", "FAILED"]:
                return

            project = db.query(Project).filter(Project.id == run.project_id).first()
            project_name = project.name if project else "Enterprise Project"
            project_desc = project.description if project else ""

            run.status = "RUNNING"
            if not run.started_at:
                run.started_at = datetime.now(timezone.utc)
            db.commit()

            agents = agent_registry.list_agents()
            upstream_outputs: dict[str, dict] = {}
            completed_agent_ids: set[str] = set()
            failed_agent_ids: set[str] = set()

            # Load previously completed executions to support resumption after approval
            existing_executions = db.query(AgentExecution).filter(AgentExecution.run_id == run_id).all()
            for ex in existing_executions:
                if ex.status == "COMPLETED":
                    completed_agent_ids.add(ex.agent_id)
                    if ex.output:
                        upstream_outputs[ex.agent_id] = ex.output
                elif ex.status in ["FAILED", "REJECTED"]:
                    failed_agent_ids.add(ex.agent_id)

            for agent_def in agents:
                # Check if run was cancelled or stopped mid-flight
                db.refresh(run)
                if run.status in ["CANCELLED", "FAILED", "PAUSED"]:
                    logger.info(f"Run {run_id} execution aborted (status: {run.status}).")
                    break

                # If already completed in this or previous resume, skip
                if agent_def.id in completed_agent_ids:
                    continue

                # Resolve dependencies
                unmet_deps = [dep for dep in agent_def.dependencies if dep not in completed_agent_ids]
                failed_deps = [dep for dep in agent_def.dependencies if dep in failed_agent_ids]

                exec_record = db.query(AgentExecution).filter(
                    AgentExecution.run_id == run_id,
                    AgentExecution.agent_id == agent_def.id
                ).first()

                if failed_deps:
                    if exec_record:
                        exec_record.status = "FAILED"
                        exec_record.error = f"Blocked: upstream dependency {', '.join(failed_deps)} failed"
                        db.commit()
                    failed_agent_ids.add(agent_def.id)
                    continue

                if unmet_deps:
                    if exec_record:
                        exec_record.status = "BLOCKED"
                        exec_record.error = f"Missing dependencies: {', '.join(unmet_deps)}"
                        db.commit()
                    failed_agent_ids.add(agent_def.id)
                    continue

                # Transition to RUNNING
                if exec_record:
                    exec_record.status = "RUNNING"
                    exec_record.started_at = datetime.now(timezone.utc)
                    db.commit()

                try:
                    output_schema, exec_ms, tokens, retries, actual_prov, fb_reason = await AgentRuntime.execute_agent(
                        definition=agent_def,
                        project_name=project_name,
                        project_description=project_desc,
                        upstream_outputs=upstream_outputs,
                        provider_name=run.provider,
                        model_name=run.model
                    )

                    out_dict = output_schema.model_dump()
                    upstream_outputs[agent_def.id] = out_dict

                    if exec_record:
                        exec_record.execution_time_ms = exec_ms
                        exec_record.tokens_used = tokens
                        exec_record.retry_count = retries
                        exec_record.actual_provider = actual_prov
                        exec_record.fallback_reason = fb_reason
                        exec_record.output = out_dict
                        inp = dict(exec_record.input or {})
                        inp["upstream_context"] = {
                            dep: {
                                "summary": upstream_outputs.get(dep, {}).get("summary"),
                                "findings": upstream_outputs.get(dep, {}).get("findings", [])
                            }
                            for dep in agent_def.dependencies if dep in upstream_outputs
                        }
                        exec_record.input = inp

                    # Save generated deliverables
                    for deliv in output_schema.deliverables:
                        raw_content = deliv.get("content", "")
                        if isinstance(raw_content, (dict, list)):
                            raw_content = json.dumps(raw_content, indent=2)
                        elif not isinstance(raw_content, str):
                            raw_content = str(raw_content)

                        d_record = Deliverable(
                            project_id=run.project_id,
                            run_id=run.id,
                            agent_id=agent_def.id,
                            type=str(deliv.get("type", "specification")),
                            title=str(deliv.get("title", f"{agent_def.id} Deliverable")),
                            content=raw_content
                        )
                        db.add(d_record)
                    db.commit()

                    # Human-In-The-Loop Checkpoint Gate
                    if agent_def.approval_required and not run.auto_approve:
                        # Check if already approved via previous checkpoint action
                        is_already_approved = (
                            exec_record.output.get("approved") is True if exec_record and exec_record.output else False
                        )
                        if not is_already_approved:
                            if exec_record:
                                exec_record.status = "AWAITING_APPROVAL"
                            run.status = "AWAITING_APPROVAL"
                            db.commit()
                            logger.info(f"Run {run_id} paused at {agent_def.name} awaiting human approval.")
                            # Execution pauses here; resumes via approve_checkpoint
                            return

                    # Normal completion
                    completed_agent_ids.add(agent_def.id)
                    if exec_record:
                        exec_record.status = "COMPLETED"
                        exec_record.completed_at = datetime.now(timezone.utc)
                        db.commit()
                    await asyncio.sleep(1.0)

                except Exception as e:
                    db.rollback()
                    logger.error(f"Agent {agent_def.id} execution failed: {e}")
                    failed_agent_ids.add(agent_def.id)
                    exec_record = db.query(AgentExecution).filter(
                        AgentExecution.run_id == run_id,
                        AgentExecution.agent_id == agent_def.id
                    ).first()
                    if exec_record:
                        exec_record.status = "FAILED"
                        exec_record.completed_at = datetime.now(timezone.utc)
                        exec_record.error = str(e)
                    run.status = "FAILED"
                    run.error_message = f"Agent {agent_def.name} failed: {e}"
                    db.commit()
                    break

            # Finalize run if not paused awaiting approval or user paused
            db.refresh(run)
            if run.status not in ["CANCELLED", "AWAITING_APPROVAL", "PAUSED"]:
                run.completed_at = datetime.now(timezone.utc)
                run.successful_agents = len(completed_agent_ids)
                run.failed_agents = len(failed_agent_ids)
                run.status = "COMPLETED" if len(failed_agent_ids) == 0 else "FAILED"
                db.commit()

            # Compute and persist real metrics
            MetricsCalculator.calculate_and_store_metrics(db, run_id)

        except Exception as e:
            logger.error(f"Error executing run {run_id}: {e}", exc_info=True)
            run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
            if run:
                run.status = "FAILED"
                run.completed_at = datetime.now(timezone.utc)
                run.error_message = str(e)
                db.commit()
        finally:
            active_run_tasks.pop(run_id, None)
            if should_close:
                db.close()

    @staticmethod
    def approve_checkpoint(db: Session, run_id: str, feedback: Optional[str] = None) -> bool:
        """Approves a paused HITL checkpoint and resumes downstream execution."""
        run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
        if not run or run.status != "AWAITING_APPROVAL":
            return False

        # Find the execution that is currently awaiting approval
        exec_record = db.query(AgentExecution).filter(
            AgentExecution.run_id == run_id,
            AgentExecution.status == "AWAITING_APPROVAL"
        ).first()

        if exec_record:
            exec_record.status = "COMPLETED"
            exec_record.completed_at = datetime.now(timezone.utc)
            out = dict(exec_record.output or {})
            out["approved"] = True
            out["approval_feedback"] = feedback or "Approved by human operator"
            out["approved_at"] = datetime.now(timezone.utc).isoformat()
            exec_record.output = out
            db.commit()

        run.status = "RUNNING"
        db.commit()

        # Resume downstream orchestration in background
        task = asyncio.create_task(OrchestrationEngine.execute_run(run_id))
        active_run_tasks[run_id] = task
        return True

    @staticmethod
    def reject_checkpoint(db: Session, run_id: str, feedback: Optional[str] = None) -> bool:
        """Rejects a paused HITL checkpoint, stopping the run cleanly."""
        run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
        if not run or run.status != "AWAITING_APPROVAL":
            return False

        exec_record = db.query(AgentExecution).filter(
            AgentExecution.run_id == run_id,
            AgentExecution.status == "AWAITING_APPROVAL"
        ).first()

        if exec_record:
            exec_record.status = "FAILED"
            exec_record.completed_at = datetime.now(timezone.utc)
            exec_record.error = f"Checkpoint rejected by operator: {feedback or 'No feedback provided'}"
            db.commit()

        run.status = "FAILED"
        run.completed_at = datetime.now(timezone.utc)
        run.error_message = f"Run rejected at checkpoint: {exec_record.agent_name if exec_record else 'Unknown'}"
        db.commit()

        MetricsCalculator.calculate_and_store_metrics(db, run_id)
        return True

    @staticmethod
    def cancel_run(db: Session, run_id: str) -> bool:
        run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
        if not run:
            return False

        run.status = "CANCELLED"
        run.completed_at = datetime.now(timezone.utc)

        # Mark any remaining running/pending executions as CANCELLED
        executions = db.query(AgentExecution).filter(
            AgentExecution.run_id == run_id,
            AgentExecution.status.in_(["PENDING", "READY", "RUNNING", "AWAITING_APPROVAL"])
        ).all()
        for ex in executions:
            ex.status = "CANCELLED"

        db.commit()

        # Cancel background task if active
        task = active_run_tasks.get(run_id)
        if task and not task.done():
            task.cancel()

        return True

    @staticmethod
    def pause_run(db: Session, run_id: str) -> bool:
        """Pauses a running or pending workflow run."""
        run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
        if not run or run.status not in ["RUNNING", "PENDING"]:
            return False

        run.status = "PAUSED"
        db.commit()

        task = active_run_tasks.get(run_id)
        if task and not task.done():
            task.cancel()

        return True

    @staticmethod
    def resume_run(db: Session, run_id: str) -> bool:
        """Resumes a paused workflow run from the last incomplete agent."""
        run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
        if not run or run.status not in ["PAUSED", "PENDING", "FAILED"]:
            return False

        # Reset failed error message when resuming
        run.status = "RUNNING"
        run.error_message = None
        db.commit()

        task = asyncio.create_task(OrchestrationEngine.execute_run(run_id))
        active_run_tasks[run_id] = task
        return True
