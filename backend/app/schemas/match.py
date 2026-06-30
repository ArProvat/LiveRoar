from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class MatchCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    sport_category: str
    start_time: datetime
    end_time: Optional[datetime] = None
    team_a: Optional[str] = None
    team_b: Optional[str] = None
    league: Optional[str] = None
    thumbnail_url: Optional[str] = None
    rtmp_stream_key: Optional[str] = None
    hls_url: Optional[str] = None
    channel_id: Optional[UUID] = None
    is_featured: bool = False
    metadata_json: Optional[dict] = None


class MatchUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    team_a: Optional[str] = None
    team_b: Optional[str] = None
    hls_url: Optional[str] = None
    is_featured: Optional[bool] = None


class MatchOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    sport_category: str
    status: str
    start_time: datetime
    end_time: Optional[datetime]
    team_a: Optional[str]
    team_b: Optional[str]
    league: Optional[str]
    thumbnail_url: Optional[str]
    hls_url: Optional[str]
    viewers: int
    is_featured: bool
    channel: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MatchListResponse(BaseModel):
    data: List[MatchOut]
    total: int
    page: int
    per_page: int
    total_pages: int
