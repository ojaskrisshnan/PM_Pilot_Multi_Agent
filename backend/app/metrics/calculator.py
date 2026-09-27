from datetime import timezone
from sqlalchemy.orm import Session
from backend.app.models.run import AgentRun
from backend.app.models.execution import AgentExecution
from backend.app.models.metric import Metric
from backend.app.models.deliverable import Deliverable
from backend.app.schemas.metrics import RunMetricsResponse, ProjectMetricsResponse, MetricItem

class MetricsCalculator:
    @staticmethod
    def calculate_and_store_metrics(db: Session, run_id: str) -> RunMetricsResponse:
        run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
        if not run:
            raise ValueError(f"Run {run_id} not found")

        executions = db.query(AgentExecution).filter(AgentExecution.run_id == run_id).all()
        deliverables = db.query(Deliverable).filter(Deliverable.run_id == run_id).all()

        total_agents = len(executions) or 17
        successful = sum(1 for e in executions if e.status == "COMPLETED")
        failed = sum(1 for e in executions if e.status == "FAILED")
        total_retries = sum(e.retry_count for e in executions)
        total_tokens = sum(e.tokens_used for e in executions)

        latencies = [e.execution_time_ms for e in executions if e.execution_time_ms > 0]
        avg_exec_time = sum(latencies) / len(latencies) if latencies else 0.0

        if run.started_at and run.completed_at:
            total_duration_ms = int((run.completed_at - run.started_at).total_seconds() * 1000)
        else:
            total_duration_ms = sum(latencies)

        completion_rate = round((successful / total_agents) * 100, 2)
        failure_rate = round((failed / total_agents) * 100, 2)

        # Output completeness: checks if deliverables contain findings, recommendations, and artifacts
        complete_outputs = 0
        for e in executions:
            out = e.output or {}
            if out.get("summary") and out.get("findings") and out.get("deliverables"):
                complete_outputs += 1
        output_completeness = round((complete_outputs / total_agents) * 100, 2)

        # Persist individual metric rows for historical/academic tracking
        db.query(Metric).filter(Metric.run_id == run_id).delete()

        metrics_to_save = [
            ("completion_rate", completion_rate, "%"),
            ("failure_rate", failure_rate, "%"),
            ("average_execution_time_ms", avg_exec_time, "ms"),
            ("total_execution_time_ms", float(total_duration_ms), "ms"),
            ("total_retries", float(total_retries), "count"),
            ("total_tokens_used", float(total_tokens), "tokens"),
            ("output_completeness", output_completeness, "%"),
            ("successful_agents", float(successful), "agents"),
            ("failed_agents", float(failed), "agents"),
        ]

        saved_metric_items = []
        for name, val, unit in metrics_to_save:
            m = Metric(
                run_id=run_id,
                metric_name=name,
                metric_value=float(val),
                unit=unit
            )
            db.add(m)
            db.flush()
            saved_metric_items.append(MetricItem(
                id=m.id,
                run_id=run_id,
                metric_name=name,
                metric_value=float(val),
                unit=unit,
                created_at=m.created_at
            ))

        db.commit()

        agent_latencies = {e.agent_id: e.execution_time_ms for e in executions}

        return RunMetricsResponse(
            run_id=run_id,
            total_agents=total_agents,
            successful_agents=successful,
            failed_agents=failed,
            completion_rate=completion_rate,
            failure_rate=failure_rate,
            average_execution_time_ms=round(avg_exec_time, 2),
            total_execution_time_ms=total_duration_ms,
            total_retries=total_retries,
            total_tokens_used=total_tokens,
            output_completeness=output_completeness,
            agent_latencies=agent_latencies,
            metrics_list=saved_metric_items
        )

    @staticmethod
    def get_run_metrics(db: Session, run_id: str) -> RunMetricsResponse:
        # If metrics already stored, return or recompute
        return MetricsCalculator.calculate_and_store_metrics(db, run_id)

    @staticmethod
    def get_project_metrics(db: Session, project_id: str) -> ProjectMetricsResponse:
        runs = db.query(AgentRun).filter(AgentRun.project_id == project_id).all()
        deliverables_count = db.query(Deliverable).filter(Deliverable.project_id == project_id).count()

        if not runs:
            return ProjectMetricsResponse(
                project_id=project_id,
                total_runs=0,
                successful_runs=0,
                overall_completion_rate=0.0,
                average_run_duration_ms=0.0,
                average_agent_latency_ms=0.0,
                total_deliverables_count=deliverables_count,
                runs_summary=[]
            )

        runs_summary = []
        total_successful_runs = 0
        durations = []
        all_agent_latencies = []

        for r in runs:
            if r.status == "COMPLETED":
                total_successful_runs += 1
            metrics = MetricsCalculator.get_run_metrics(db, r.id)
            runs_summary.append(metrics)
            durations.append(metrics.total_execution_time_ms)
            all_agent_latencies.extend(metrics.agent_latencies.values())

        avg_duration = sum(durations) / len(durations) if durations else 0.0
        avg_agent_lat = sum(all_agent_latencies) / len(all_agent_latencies) if all_agent_latencies else 0.0
        overall_comp = round((total_successful_runs / len(runs)) * 100, 2)

        return ProjectMetricsResponse(
            project_id=project_id,
            total_runs=len(runs),
            successful_runs=total_successful_runs,
            overall_completion_rate=overall_comp,
            average_run_duration_ms=round(avg_duration, 2),
            average_agent_latency_ms=round(avg_agent_lat, 2),
            total_deliverables_count=deliverables_count,
            runs_summary=runs_summary
        )
