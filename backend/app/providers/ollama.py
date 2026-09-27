import time
import json
from typing import Any
import httpx
from backend.app.providers.base import BaseLLMProvider, LLMRequest, LLMResponse
from backend.app.config import settings

class OllamaProvider(BaseLLMProvider):
    def __init__(self, base_url: str = None, model: str = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL or "llama3.2"

    async def ping(self) -> dict[str, Any]:
        start = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                latency_ms = int((time.perf_counter() - start) * 1000)
                if res.status_code == 200:
                    models = [m.get("name") for m in res.json().get("models", [])]
                    return {
                        "success": True,
                        "latency_ms": latency_ms,
                        "message": f"Connected to Ollama ({len(models)} models available)",
                        "models": models
                    }
                return {"success": False, "latency_ms": latency_ms, "message": f"Ollama HTTP {res.status_code}"}
        except Exception as e:
            return {"success": False, "latency_ms": 0, "message": f"Ollama offline at {self.base_url}: {str(e)}"}

    async def query(self, request: LLMRequest) -> LLMResponse:
        start = time.perf_counter()
        url = f"{self.base_url}/v1/chat/completions"

        user_content = request.user_prompt
        if request.project_context:
            user_content = f"Context:\n{request.project_context}\n\nTask:\n{request.user_prompt}"

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": request.system_prompt + "\nOutput MUST be valid JSON adhering to the required schema."},
                {"role": "user", "content": user_content}
            ],
            "temperature": request.temperature,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"Ollama error {res.status_code}: {res.text}")

            data = res.json()
            latency_ms = int((time.perf_counter() - start) * 1000)
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            tokens_used = data.get("usage", {}).get("total_tokens", 300)

            structured = None
            try:
                structured = json.loads(content)
            except Exception:
                pass

            return LLMResponse(
                content=content,
                provider="ollama",
                model=self.model,
                latency_ms=latency_ms,
                tokens_used=tokens_used,
                structured_output=structured
            )
