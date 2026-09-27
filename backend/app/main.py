import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.user import User
from backend.app.models.project import Project
from backend.app.models.run import AgentRun
from backend.app.models.execution import AgentExecution
from backend.app.models.dependency import AgentDependency
from backend.app.auth.security import hash_password
from backend.app.agents.definitions import ALL_17_AGENTS
from backend.app.routers import (
    auth_router,
    projects_router,
    runs_router,
    agents_router,
    deliverables_router,
    metrics_router,
    settings_router
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("pmpilot")

def seed_database():
    """Initializes tables, seeds demo user, default project, team employees, and agent dependencies."""
    from sqlalchemy import text
    Base.metadata.create_all(bind=engine)

    # Ensure schema has new columns in SQLite
    with engine.connect() as conn:
        for col_name, col_def in [
            ("role", "VARCHAR(50) DEFAULT 'employee'"),
            ("agent_role", "VARCHAR(50)"),
            ("title", "VARCHAR(120)")
        ]:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}"))
                conn.commit()
            except Exception:
                pass

    db = SessionLocal()
    try:
        # Seed users & employee roles
        team_seed = [
            {"name": "Administrator", "email": "admin@pmpilot.ai", "pwd": "admin123", "role": "manager", "agent": None, "title": "Head of Engineering & PM"},
            {"name": "Project Manager", "email": "manager@pmpilot.ai", "pwd": "admin123", "role": "manager", "agent": None, "title": "Senior Project Manager"},
            {"name": "Alice Vance", "email": "uiux@pmpilot.ai", "pwd": "password123", "role": "employee", "agent": "UIUXAgent", "title": "UI/UX Designer"},
            {"name": "Marcus Chen", "email": "architect@pmpilot.ai", "pwd": "password123", "role": "employee", "agent": "ArchitectureAgent", "title": "Solutions Architect"},
            {"name": "David Miller", "email": "backend@pmpilot.ai", "pwd": "password123", "role": "employee", "agent": "BackendAgent", "title": "Backend Engineer"},
            {"name": "Elena Rostova", "email": "frontend@pmpilot.ai", "pwd": "password123", "role": "employee", "agent": "FrontendAgent", "title": "Frontend Engineer"},
            {"name": "Sarah Jenkins", "email": "qa@pmpilot.ai", "pwd": "password123", "role": "employee", "agent": "QATestingAgent", "title": "QA & Test Lead"},
            {"name": "Vikram Patel", "email": "security@pmpilot.ai", "pwd": "password123", "role": "employee", "agent": "SecurityAgent", "title": "Cybersecurity Auditor"},
            {"name": "Rachel Adams", "email": "analyst@pmpilot.ai", "pwd": "password123", "role": "employee", "agent": "RequirementAgent", "title": "Requirement Analyst"},
            {"name": "Carlos Diaz", "email": "devops@pmpilot.ai", "pwd": "password123", "role": "employee", "agent": "DevOpsAgent", "title": "DevOps Engineer"},
            {"name": "Demo Lead", "email": "demo@pmpilot.ai", "pwd": "password123", "role": "manager", "agent": None, "title": "Project Lead"},
        ]

        seeded_users = {}
        for member in team_seed:
            u = db.query(User).filter(User.email == member["email"].lower()).first()
            if not u:
                u = User(
                    name=member["name"],
                    email=member["email"].lower(),
                    password_hash=hash_password(member["pwd"]),
                    role=member["role"],
                    agent_role=member["agent"],
                    title=member["title"]
                )
                db.add(u)
                db.commit()
                db.refresh(u)
            else:
                # Update role and title if needed
                u.role = member["role"]
                u.agent_role = member["agent"]
                u.title = member["title"]
                db.commit()
            seeded_users[member["email"]] = u

        # Seed default project if no projects exist
        projects = db.query(Project).all()
        if not projects:
            manager_user = seeded_users.get("admin@pmpilot.ai") or seeded_users.get("demo@pmpilot.ai")
            default_proj = Project(
                user_id=manager_user.id if manager_user else None,
                name="Campus Event Management Platform",
                description="Build a campus event management platform for organizing college events, registrations, participants, venues, schedules, and notifications.",
                domain="Education",
                status="Draft",
                config={
                    "assignments": {
                        "UIUXAgent": seeded_users["uiux@pmpilot.ai"].id,
                        "ArchitectureAgent": seeded_users["architect@pmpilot.ai"].id,
                        "BackendAgent": seeded_users["backend@pmpilot.ai"].id,
                        "FrontendAgent": seeded_users["frontend@pmpilot.ai"].id,
                        "QATestingAgent": seeded_users["qa@pmpilot.ai"].id,
                        "SecurityAgent": seeded_users["security@pmpilot.ai"].id,
                        "RequirementAgent": seeded_users["analyst@pmpilot.ai"].id,
                        "DevOpsAgent": seeded_users["devops@pmpilot.ai"].id,
                    }
                }
            )
            db.add(default_proj)
            db.commit()
            logger.info("Seeded default project with employee role assignments")
        else:
            # Ensure existing projects have employee assignments in config
            for p in projects:
                cfg = dict(p.config or {})
                if "assignments" not in cfg or not cfg["assignments"]:
                    cfg["assignments"] = {
                        "UIUXAgent": seeded_users["uiux@pmpilot.ai"].id,
                        "ArchitectureAgent": seeded_users["architect@pmpilot.ai"].id,
                        "BackendAgent": seeded_users["backend@pmpilot.ai"].id,
                        "FrontendAgent": seeded_users["frontend@pmpilot.ai"].id,
                        "QATestingAgent": seeded_users["qa@pmpilot.ai"].id,
                        "SecurityAgent": seeded_users["security@pmpilot.ai"].id,
                        "RequirementAgent": seeded_users["analyst@pmpilot.ai"].id,
                        "DevOpsAgent": seeded_users["devops@pmpilot.ai"].id,
                    }
                    p.config = cfg
            db.commit()

        # Seed agent dependencies table if empty
        if db.query(AgentDependency).count() == 0:
            for aid, agent in ALL_17_AGENTS.items():
                for dep in agent.dependencies:
                    db.add(AgentDependency(source_agent=dep, target_agent=aid, dependency_type="hard"))
            db.commit()
            logger.info("Seeded 17-agent dependency relations")

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting PMPilot Backend...")
    seed_database()
    
    # Cleanup any orphaned RUNNING runs from previous server restarts
    db = SessionLocal()
    try:
        orphaned_runs = db.query(AgentRun).filter(AgentRun.status == "RUNNING").all()
        for r in orphaned_runs:
            r.status = "PAUSED"
            logger.info(f"Cleaned up orphaned run {r.id} -> PAUSED")
        running_execs = db.query(AgentExecution).filter(AgentExecution.status == "RUNNING").all()
        for ex in running_execs:
            ex.status = "PENDING"
            logger.info(f"Cleaned up orphaned execution {ex.agent_id} in run {ex.run_id} -> PENDING")
        if orphaned_runs or running_execs:
            db.commit()
    except Exception as e:
        logger.error(f"Error checking orphaned runs: {e}")
        db.rollback()
    finally:
        db.close()

    yield
    logger.info("Shutting down PMPilot Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend orchestration engine and persistent REST API for the 17-agent PMPilot SDLC system.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local development on Vite 5173 / 4173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers ensuring clean JSON error messages without secret leakage
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please check backend logs."}
    )

# Mount API Routers
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(runs_router)
app.include_router(agents_router)
app.include_router(deliverables_router)
app.include_router(metrics_router)
app.include_router(settings_router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected",
        "llm_provider": settings.LLM_PROVIDER
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
