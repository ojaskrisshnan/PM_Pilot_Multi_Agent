from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class DeliverableResponse(BaseModel):
    id: str
    project_id: str
    run_id: Optional[str] = None
    agent_id: str
    type: str
    title: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
