import os
import time
import json
import asyncio
from typing import Any
import httpx
from backend.app.providers.base import BaseLLMProvider, LLMRequest, LLMResponse
from backend.app.config import settings

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key if api_key is not None else (os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY)
        target_model = model or os.getenv("GEMINI_MODEL") or settings.GEMINI_MODEL or "gemini-3.1-flash-lite"
        if target_model in ("gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"):
            target_model = settings.GEMINI_MODEL or "gemini-3.1-flash-lite"
        self.model = target_model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def ping(self) -> dict[str, Any]:
        key = self.api_key if self.api_key is not None else (os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY)
        if not key:
            return {"success": False, "latency_ms": 0, "message": "Gemini API key not configured in .env"}
        start = time.perf_counter()
        try:
            url = f"{self.base_url}/models/{self.model}?key={key}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                latency_ms = int((time.perf_counter() - start) * 1000)
                if res.status_code == 200:
                    return {"success": True, "latency_ms": latency_ms, "message": f"Connected to Google Gemini ({self.model})"}
                return {"success": False, "latency_ms": latency_ms, "message": f"Gemini error {res.status_code}: {res.text[:120]}"}
        except Exception as e:
            return {"success": False, "latency_ms": 0, "message": f"Gemini connection failed: {str(e)}"}

    async def query(self, request: LLMRequest) -> LLMResponse:
        key = self.api_key if self.api_key is not None else (os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY)
        if not key:
            raise ValueError("GEMINI_API_KEY is missing")

        start = time.perf_counter()
        url = f"{self.base_url}/models/{self.model}:generateContent?key={key}"

        user_content = request.user_prompt
        if request.project_context:
            user_content = f"Context:\n{request.project_context}\n\nTask:\n{request.user_prompt}"

        payload = {
            "systemInstruction": {
                "parts": [{"text": request.system_prompt}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_content}]
                }
            ],
            "generationConfig": {
                "temperature": request.temperature,
                "maxOutputTokens": request.max_tokens,
                "responseMimeType": "application/json"
            }
        }

        max_http_retries = 3
        res = None
        for attempt in range(max_http_retries):
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    break
                if res.status_code in (429, 503) and attempt < max_http_retries - 1:
                    wait_time = (attempt + 1) * 3
                    await asyncio.sleep(wait_time)
                    continue
                raise RuntimeError(f"Gemini API HTTP {res.status_code}: {res.text}")

        if not res or res.status_code != 200:
            raise RuntimeError(f"Gemini API query failed: {res.text if res else 'No response'}")

        data = res.json()
        latency_ms = int((time.perf_counter() - start) * 1000)

        raw_text = ""
        candidates = data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts:
                raw_text = parts[0].get("text", "")

        tokens_used = data.get("usageMetadata", {}).get("totalTokenCount", 0)

        structured = None
        try:
            structured = json.loads(raw_text)
        except Exception:
            pass

        return LLMResponse(
            content=raw_text,
            provider="gemini",
            model=self.model,
            latency_ms=latency_ms,
            tokens_used=tokens_used,
            structured_output=structured
        )
