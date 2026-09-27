from fastapi import APIRouter
from backend.app.providers.router import ProviderRouter

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("/llm")
async def get_llm_settings():
    return await ProviderRouter.get_all_provider_statuses()

@router.post("/llm/ping")
async def ping_provider(provider: str = "mock"):
    p = ProviderRouter.get_provider(provider)
    return await p.ping()
