from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict

class AgentOutputSchema(BaseModel):
    agent_id: str
    status: str = "completed"
    summary: str
    findings: list[Any] = Field(default_factory=list)
    recommendations: list[Any] = Field(default_factory=list)
    deliverables: list[dict[str, Any]] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

class AgentExecutionResponse(BaseModel):
    id: str
    run_id: str
    agent_id: str
    agent_name: str
    phase_order: int
    status: str
    input: dict[str, Any] = {}
    output: dict[str, Any] = {}
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    execution_time_ms: int = 0
    tokens_used: int = 0
    retry_count: int = 0
    actual_provider: Optional[str] = None
    fallback_reason: Optional[str] = None
    error: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
