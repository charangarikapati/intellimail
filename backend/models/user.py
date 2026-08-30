from pydantic import BaseModel, Field
from typing import Optional

class UserProfile(BaseModel):
    userId: str
    name: str
    email: str
    googleId: Optional[str] = None
    createdAt: Optional[str] = None

class UserPreferences(BaseModel):
    userId: str
    defaultTone: str = Field(default="Professional", description="Professional, Friendly, Formal, Concise")
    language: str = Field(default="English")
    summaryLength: str = Field(default="Concise", description="Concise, Detailed, BulletPoints")
