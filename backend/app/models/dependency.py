import uuid
from sqlalchemy import Column, String
from backend.app.database import Base

class AgentDependency(Base):
    __tablename__ = "agent_dependencies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_agent = Column(String(60), nullable=False, index=True)
    target_agent = Column(String(60), nullable=False, index=True)
    dependency_type = Column(String(20), default="hard")  # hard, soft
