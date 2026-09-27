import time
import json
from typing import Any
import httpx
from backend.app.providers.base import BaseLLMProvider, LLMRequest, LLMResponse
from backend.app.config import settings

class OpenAICompatibleProvider(BaseLLMProvider):
    def __init__(self, api_key: str = None, base_url: str = None, model: str = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.base_url = (base_url or settings.OPENAI_BASE_URL).rstrip("/")
        self.model = model or settings.OPENAI_MODEL or "gpt-4o-mini"

    async def ping(self) -> dict[str, Any]:
        if not self.api_key:
            return {"success": False, "latency_ms": 0, "message": "API key not configured"}
        start = time.perf_counter()
        try:
            url = f"{self.base_url}/models"
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get(url, headers=headers)
                latency_ms = int((time.perf_counter() - start) * 1000)
                if res.status_code == 200:
                    return {"success": True, "latency_ms": latency_ms, "message": f"Connected to OpenAI-compatible provider ({self.model})"}
                return {"success": False, "latency_ms": latency_ms, "message": f"HTTP {res.status_code}"}
        except Exception as e:
            return {"success": False, "latency_ms": 0, "message": str(e)}

    async def query(self, request: LLMRequest) -> LLMResponse:
        if not self.api_key:
            raise ValueError("API key missing for OpenAI-compatible provider")

        start = time.perf_counter()
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        user_content = request.user_prompt
        if request.project_context:
            user_content = f"Context:\n{request.project_context}\n\nTask:\n{request.user_prompt}"

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": request.system_prompt + "\nOutput strictly valid JSON."},
                {"role": "user", "content": user_content}
            ],
            "temperature": request.temperature,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"OpenAI Compatible API HTTP {res.status_code}: {res.text}")

            data = res.json()
            latency_ms = int((time.perf_counter() - start) * 1000)
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            tokens_used = data.get("usage", {}).get("total_tokens", 350)

            structured = None
            try:
                structured = json.loads(content)
            except Exception:
                pass

            return LLMResponse(
                content=content,
                provider="openai_compat",
                model=self.model,
                latency_ms=latency_ms,
                tokens_used=tokens_used,
                structured_output=structured
            )
