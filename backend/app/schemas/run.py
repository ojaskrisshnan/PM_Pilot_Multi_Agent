from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.execution import AgentExecutionResponse
from backend.app.schemas.metrics import RunMetricsResponse

class RunCreate(BaseModel):
    provider: Optional[str] = None  # None uses server default (mock, gemini, ollama, openai_compat)
    model: Optional[str] = None
    input_prompt_override: Optional[str] = None
    domain_override: Optional[str] = None
    auto_approve: Optional[bool] = False

class CheckpointAction(BaseModel):
    action: str = Field("approve", description="'approve' or 'reject'")
    feedback: Optional[str] = None

class RunResponse(BaseModel):
    id: str
    project_id: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    total_agents: int
    successful_agents: int = 0
    failed_agents: int = 0
    provider: str
    requested_provider: Optional[str] = "mock"
    actual_provider: Optional[str] = "mock"
    fallback_reason: Optional[str] = None
    error_message: Optional[str] = None
    model: str
    auto_approve: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

class RunDetailResponse(RunResponse):
    executions: list[AgentExecutionResponse] = []
    metrics: Optional[RunMetricsResponse] = None
