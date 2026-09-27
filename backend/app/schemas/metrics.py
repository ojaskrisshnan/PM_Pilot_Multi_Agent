from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class MetricItem(BaseModel):
    id: str
    run_id: str
    metric_name: str
    metric_value: float
    unit: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RunMetricsResponse(BaseModel):
    run_id: str
    total_agents: int
    successful_agents: int
    failed_agents: int
    completion_rate: float
    failure_rate: float
    average_execution_time_ms: float
    total_execution_time_ms: int
    total_retries: int
    total_tokens_used: int
    output_completeness: float
    agent_latencies: dict[str, int]
    metrics_list: list[MetricItem] = []

class ProjectMetricsResponse(BaseModel):
    project_id: str
    total_runs: int
    successful_runs: int
    overall_completion_rate: float
    average_run_duration_ms: float
    average_agent_latency_ms: float
    total_deliverables_count: int
    runs_summary: list[RunMetricsResponse] = []
