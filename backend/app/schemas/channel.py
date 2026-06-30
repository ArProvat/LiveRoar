from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ChannelCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    logo_url: Optional[str] = None
    category: str


class ChannelOut(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    logo_url: Optional[str]
    category: str
    is_live: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ChannelListResponse(BaseModel):
    data: List[ChannelOut]
    total: int
    page: int
    per_page: int
