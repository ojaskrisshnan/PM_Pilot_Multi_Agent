import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Deliverable(Base):
    __tablename__ = "deliverables"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    run_id = Column(String(36), ForeignKey("agent_runs.id"), nullable=True, index=True)
    agent_id = Column(String(60), nullable=False, index=True)
    type = Column(String(60), default="code")  # code, specification, diagram, report, configuration
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="deliverables")
    run = relationship("AgentRun", back_populates="deliverables")
