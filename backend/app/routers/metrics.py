from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.project import Project
from backend.app.models.run import AgentRun
from backend.app.models.user import User
from backend.app.schemas.metrics import RunMetricsResponse, ProjectMetricsResponse
from backend.app.metrics.calculator import MetricsCalculator
from backend.app.auth.dependencies import get_optional_user, verify_project_access

router = APIRouter(tags=["Metrics"])

@router.get("/api/projects/{project_id}/metrics", response_model=ProjectMetricsResponse)
def get_project_metrics(
    project_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    verify_project_access(project, user)

    try:
        return MetricsCalculator.get_project_metrics(db, project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/runs/{run_id}/metrics", response_model=RunMetricsResponse)
def get_run_metrics(
    run_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    verify_project_access(run.project, user)

    try:
        return MetricsCalculator.get_run_metrics(db, run_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
