from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6)
    role: str = "employee"
    agent_role: Optional[str] = None
    title: Optional[str] = None

class UserLogin(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str = "employee"
    agent_role: Optional[str] = None
    title: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
