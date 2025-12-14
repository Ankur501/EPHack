from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    role: str
    seniority_level: str
    years_experience: int
    industry: Optional[str] = None
    company_size: Optional[str] = None
    primary_goal: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ProfileCreateRequest(BaseModel):
    role: str
    seniority_level: str
    years_experience: int
    industry: Optional[str] = None
    company_size: Optional[str] = None
    primary_goal: Optional[str] = None