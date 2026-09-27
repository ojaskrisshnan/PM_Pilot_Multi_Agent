from backend.app.routers.auth import router as auth_router
from backend.app.routers.projects import router as projects_router
from backend.app.routers.runs import router as runs_router
from backend.app.routers.agents import router as agents_router
from backend.app.routers.deliverables import router as deliverables_router
from backend.app.routers.metrics import router as metrics_router
from backend.app.routers.settings import router as settings_router

__all__ = [
    "auth_router",
    "projects_router",
    "runs_router",
    "agents_router",
    "deliverables_router",
    "metrics_router",
    "settings_router",
]
