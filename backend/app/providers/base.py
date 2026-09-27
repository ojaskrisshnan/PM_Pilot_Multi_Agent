from abc import ABC, abstractmethod
from typing import Optional, Any
from pydantic import BaseModel, Field

class LLMRequest(BaseModel):
    agent_id: str
    system_prompt: str
    user_prompt: str
    project_context: Optional[str] = None
    temperature: float = 0.2
    max_tokens: int = 2048

class LLMResponse(BaseModel):
    content: str
    provider: str
    model: str
    latency_ms: int = 0
    tokens_used: int = 0
    structured_output: Optional[dict[str, Any]] = None
    requested_provider: Optional[str] = None
    actual_provider: Optional[str] = None
    fallback_reason: Optional[str] = None

class BaseLLMProvider(ABC):
    @abstractmethod
    async def query(self, request: LLMRequest) -> LLMResponse:
        pass

    @abstractmethod
    async def ping(self) -> dict[str, Any]:
        pass
