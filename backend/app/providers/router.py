import os
from typing import Optional
from backend.app.config import settings
from backend.app.providers.base import BaseLLMProvider, LLMRequest, LLMResponse
from backend.app.providers.gemini import GeminiProvider
from backend.app.providers.ollama import OllamaProvider
from backend.app.providers.openai_compat import OpenAICompatibleProvider
from backend.app.providers.mock import MockProvider

class ProviderRouter:
    @staticmethod
    def get_provider(provider_name: Optional[str] = None, model: Optional[str] = None, model_name: Optional[str] = None) -> BaseLLMProvider:
        selected = (provider_name or os.getenv("LLM_PROVIDER") or settings.LLM_PROVIDER or "mock").lower()
        effective_model = model or model_name

        if selected == "gemini":
            key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
            gemini_mod = effective_model or os.getenv("GEMINI_MODEL") or settings.GEMINI_MODEL
            return GeminiProvider(api_key=key, model=gemini_mod)

        elif selected == "ollama":
            return OllamaProvider(base_url=settings.OLLAMA_BASE_URL, model=effective_model or settings.OLLAMA_MODEL)

        elif selected in ("openai", "openai_compat", "groq", "openrouter"):
            return OpenAICompatibleProvider(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL,
                model=effective_model or settings.OPENAI_MODEL
            )

        return MockProvider()

    @staticmethod
    async def query_provider(
        request: LLMRequest,
        provider_name: Optional[str] = None,
        model: Optional[str] = None,
        model_name: Optional[str] = None,
        allow_fallback: bool = False
    ) -> LLMResponse:
        effective_model = model or model_name
        req_provider = (provider_name or settings.LLM_PROVIDER or "mock").lower()
        primary = ProviderRouter.get_provider(req_provider, model=effective_model)

        try:
            resp = await primary.query(request)
            resp.requested_provider = req_provider
            resp.actual_provider = resp.provider
            return resp
        except Exception as e:
            if not allow_fallback and req_provider not in ("mock", "offline"):
                # Real provider failure must NOT silently convert to mock
                raise RuntimeError(
                    f"[{req_provider.upper()}_FAILURE] Error executing {request.agent_id} via {req_provider}: {str(e)}"
                ) from e

            # Fallback allowed (e.g. offline testing)
            mock = MockProvider()
            resp = await mock.query(request)
            resp.requested_provider = req_provider
            resp.actual_provider = "mock"
            resp.fallback_reason = f"Fallback from {req_provider}: {str(e)[:120]}"
            resp.model = f"{resp.model} (fallback from {req_provider})"
            return resp

    @staticmethod
    async def query_with_fallback(
        request: LLMRequest,
        provider_name: Optional[str] = None,
        model: Optional[str] = None,
        model_name: Optional[str] = None
    ) -> LLMResponse:
        return await ProviderRouter.query_provider(request, provider_name, model, model_name, allow_fallback=True)

    @staticmethod
    async def get_all_provider_statuses() -> dict:
        mock_status = await MockProvider().ping()
        gemini_status = await GeminiProvider().ping() if settings.GEMINI_API_KEY else {"success": False, "message": "API key not configured in .env"}
        ollama_status = await OllamaProvider().ping()

        return {
            "active_default": settings.LLM_PROVIDER,
            "providers": {
                "mock": mock_status,
                "gemini": gemini_status,
                "ollama": ollama_status,
                "openai_compat": {"success": bool(settings.OPENAI_API_KEY), "configured": bool(settings.OPENAI_API_KEY)}
            }
        }
