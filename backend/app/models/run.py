import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.app.database import Base

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    status = Column(String(50), default="PENDING", index=True)  # PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, AWAITING_APPROVAL
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    total_agents = Column(Integer, default=17)
    successful_agents = Column(Integer, default=0)
    failed_agents = Column(Integer, default=0)
    provider = Column(String(50), default="mock")
    requested_provider = Column(String(50), default="mock")
    actual_provider = Column(String(50), default="mock")
    fallback_reason = Column(String(255), nullable=True)
    error_message = Column(String(500), nullable=True)
    model = Column(String(100), default="deterministic-mock")
    auto_approve = Column(Boolean, default=False)

    project = relationship("Project", back_populates="runs")
    executions = relationship("AgentExecution", back_populates="run", cascade="all, delete-orphan", order_by="AgentExecution.phase_order")
    deliverables = relationship("Deliverable", back_populates="run", cascade="all, delete-orphan")
    metrics = relationship("Metric", back_populates="run", cascade="all, delete-orphan")
