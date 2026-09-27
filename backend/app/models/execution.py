import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class AgentExecution(Base):
    __tablename__ = "agent_executions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("agent_runs.id"), nullable=False, index=True)
    agent_id = Column(String(60), nullable=False, index=True)
    agent_name = Column(String(120), nullable=False)
    phase_order = Column(Integer, default=1)
    status = Column(String(50), default="PENDING", index=True)  # PENDING, READY, RUNNING, COMPLETED, FAILED, RETRYING, CANCELLED, AWAITING_APPROVAL
    input = Column(JSON, default=dict)
    output = Column(JSON, default=dict)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    execution_time_ms = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    retry_count = Column(Integer, default=0)
    actual_provider = Column(String(50), nullable=True)
    fallback_reason = Column(Text, nullable=True)
    error = Column(Text, nullable=True)

    run = relationship("AgentRun", back_populates="executions")
