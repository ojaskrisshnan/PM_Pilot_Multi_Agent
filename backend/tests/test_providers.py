import pytest
from backend.app.providers.mock import MockProvider
from backend.app.providers.base import LLMRequest
from backend.app.providers.router import ProviderRouter

@pytest.mark.asyncio
async def test_mock_provider_ping():
    provider = MockProvider()
    res = await provider.ping()
    assert res["success"] is True
    assert "MOCK MODE" in res["message"]

@pytest.mark.asyncio
async def test_mock_provider_returns_valid_structured_json():
    provider = MockProvider()
    req = LLMRequest(
        agent_id="ArchitectureAgent",
        system_prompt="You are an architect.",
        user_prompt="Project: Fast Trading Engine"
    )
    res = await provider.query(req)
    assert res.provider == "mock"
    assert res.structured_output is not None
    assert res.structured_output["agent_id"] == "ArchitectureAgent"
    assert "summary" in res.structured_output
    assert len(res.structured_output["deliverables"]) > 0

@pytest.mark.asyncio
async def test_router_fallback():
    # If fallback is explicitly requested for unknown provider, fallback to MockProvider
    req = LLMRequest(
        agent_id="SecurityAgent",
        system_prompt="Security auditor",
        user_prompt="Audit system"
    )
    res = await ProviderRouter.query_with_fallback(req, provider_name="nonexistent_provider")
    assert res.provider == "mock"
    assert res.structured_output["agent_id"] == "SecurityAgent"

@pytest.mark.asyncio
async def test_gemini_provider_fails_clearly_without_key(monkeypatch):
    # Verify Phase 5: If Gemini is selected and fails (e.g. key missing), execution raises an error and does NOT silently produce mock results
    from backend.app.config import settings
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    from backend.app.providers.gemini import GeminiProvider
    provider = GeminiProvider(api_key="")
    req = LLMRequest(
        agent_id="ArchitectureAgent",
        system_prompt="Design system",
        user_prompt="Evaluate topology"
    )
    with pytest.raises(ValueError, match="GEMINI_API_KEY is missing"):
        await provider.query(req)

@pytest.mark.asyncio
async def test_query_provider_gemini_without_fallback_raises_error(monkeypatch):
    from backend.app.config import settings
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    req = LLMRequest(
        agent_id="ArchitectureAgent",
        system_prompt="Design system",
        user_prompt="Evaluate topology"
    )
    # When allow_fallback=False (default), Gemini failure raises [GEMINI_FAILURE]
    with pytest.raises(RuntimeError, match=r"\[GEMINI_FAILURE\]"):
        await ProviderRouter.query_provider(req, provider_name="gemini", allow_fallback=False)
