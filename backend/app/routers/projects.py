from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.project import Project
from backend.app.models.user import User
from backend.app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from backend.app.auth.dependencies import get_optional_user, verify_project_access

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    project = Project(
        user_id=user.id if user else None,
        name=payload.name,
        description=payload.description or "",
        domain=payload.domain or "Enterprise Software",
        status="Draft",
        config=payload.config or {}
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)

@router.get("", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    query = db.query(Project)
    if user:
        query = query.filter((Project.user_id == user.id) | (Project.user_id == None))
    projects = query.order_by(Project.created_at.desc()).all()
    return [ProjectResponse.model_validate(p) for p in projects]

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    verify_project_access(project, user)
    return ProjectResponse.model_validate(project)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    verify_project_access(project, user)

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(project, field, val)

    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    verify_project_access(project, user)

    db.delete(project)
    db.commit()
    return None

@router.get("/{project_id}/assignments")
def get_project_assignments(
    project_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    cfg = dict(project.config or {})
    assignments_raw = cfg.get("assignments", {})

    # Map user ids to user details
    user_ids = list(assignments_raw.values())
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: {"id": u.id, "name": u.name, "email": u.email, "title": u.title, "agent_role": u.agent_role} for u in users}

    result = {}
    for agent_id, uid in assignments_raw.items():
        if uid in user_map:
            result[agent_id] = user_map[uid]

    return {"assignments": result}

@router.post("/{project_id}/assign")
def assign_employee(
    project_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    agent_id = payload.get("agent_id")
    user_id = payload.get("user_id")
    if not agent_id or not user_id:
        raise HTTPException(status_code=400, detail="agent_id and user_id are required")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Employee not found")

    cfg = dict(project.config or {})
    assignments = dict(cfg.get("assignments", {}))
    assignments[agent_id] = user_id
    cfg["assignments"] = assignments
    project.config = cfg

    db.commit()
    return {
        "status": "success",
        "agent_id": agent_id,
        "assigned_user": {
            "id": target_user.id,
            "name": target_user.name,
            "email": target_user.email,
            "title": target_user.title
        }
    }
