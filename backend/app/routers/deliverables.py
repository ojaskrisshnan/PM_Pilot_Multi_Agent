from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.deliverable import Deliverable
from backend.app.models.project import Project
from backend.app.models.user import User
from backend.app.schemas.deliverable import DeliverableResponse
from backend.app.auth.dependencies import get_optional_user, verify_project_access

router = APIRouter(tags=["Deliverables"])

@router.get("/api/projects/{project_id}/deliverables", response_model=list[DeliverableResponse])
def get_project_deliverables(
    project_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    verify_project_access(project, user)

    deliverables = db.query(Deliverable).filter(
        Deliverable.project_id == project_id
    ).order_by(Deliverable.created_at.desc()).all()
    return [DeliverableResponse.model_validate(d) for d in deliverables]

@router.get("/api/deliverables/{deliverable_id}", response_model=DeliverableResponse)
def get_deliverable_detail(
    deliverable_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    deliverable = db.query(Deliverable).filter(Deliverable.id == deliverable_id).first()
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    verify_project_access(deliverable.project, user)
    return DeliverableResponse.model_validate(deliverable)
