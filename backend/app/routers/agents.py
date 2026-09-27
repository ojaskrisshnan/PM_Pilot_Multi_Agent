from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.execution import AgentExecution
from backend.app.schemas.execution import AgentExecutionResponse
from backend.app.agents.registry import agent_registry

router = APIRouter(tags=["Agents"])

@router.get("/api/agent-registry")
def get_agent_registry():
    """Returns static metadata for all 17 registered agents and dependency graph."""
    agents = agent_registry.list_agents()
    return [
        {
            "id": a.id,
            "name": a.name,
            "role": a.role,
            "phase_order": a.phase_order,
            "system_prompt": a.system_prompt,
            "dependencies": a.dependencies,
            "input_artifacts": a.input_artifacts,
            "output_artifacts": a.output_artifacts,
            "tools": a.tools,
            "approval_required": a.approval_required,
            "typical_duration_days": a.typical_duration_days
        }
        for a in agents
    ]

from typing import Optional
from backend.app.models.run import AgentRun
from backend.app.models.user import User
from backend.app.auth.dependencies import get_optional_user, verify_project_access

@router.get("/api/runs/{run_id}/agents", response_model=list[AgentExecutionResponse])
def get_run_agents(
    run_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    verify_project_access(run.project, user)

    executions = db.query(AgentExecution).filter(
        AgentExecution.run_id == run_id
    ).order_by(AgentExecution.phase_order).all()
    if not executions:
        raise HTTPException(status_code=404, detail="No executions found for this run")
    return [AgentExecutionResponse.model_validate(e) for e in executions]

@router.get("/api/runs/{run_id}/agents/{agent_id}", response_model=AgentExecutionResponse)
def get_run_agent_detail(
    run_id: str,
    agent_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    verify_project_access(run.project, user)

    execution = db.query(AgentExecution).filter(
        AgentExecution.run_id == run_id,
        AgentExecution.agent_id == agent_id
    ).first()
    if not execution:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} execution not found in run {run_id}")
    return AgentExecutionResponse.model_validate(execution)
