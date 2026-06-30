from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class ChatMessageIn(BaseModel):
    message: str


class ChatMessageOut(BaseModel):
    id: str
    user_id: Optional[str]
    username: str
    message: str
    match_id: Optional[str]
    created_at: str
