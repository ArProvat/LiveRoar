from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import json
import redis.asyncio as aioredis

from app.database import get_db
from app.core.models import ChatMessage, Match
from app.core.auth import get_optional_user
from app.config import settings

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.connections: dict[str, set[WebSocket]] = {}

    async def connect(self, match_id: str, websocket: WebSocket):
        await websocket.accept()
        if match_id not in self.connections:
            self.connections[match_id] = set()
        self.connections[match_id].add(websocket)

    def disconnect(self, match_id: str, websocket: WebSocket):
        if match_id in self.connections:
            self.connections[match_id].discard(websocket)
            if not self.connections[match_id]:
                del self.connections[match_id]

    async def broadcast(self, match_id: str, message: dict):
        if match_id in self.connections:
            disconnected = set()
            for connection in self.connections[match_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)
            for conn in disconnected:
                self.disconnect(match_id, conn)


manager = ConnectionManager()


@router.websocket("/{match_id}")
async def websocket_chat(
    websocket: WebSocket,
    match_id: str,
    token: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    # Validate optional auth token
    username = "Anonymous"
    user_id = None

    if token:
        from app.core.security import decode_token
        payload = decode_token(token)
        if payload and payload.get("sub"):
            user_result = await db.execute(
                select(ChatMessage).where(
                    ChatMessage.user_id == payload["sub"]
                )
            )
            # Use token subject as username
            username = f"User_{payload['sub'][:8]}"
            user_id = payload["sub"]

    await manager.connect(match_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            msg_data = json.loads(data)
            message_text = msg_data.get("message", "").strip()

            if not message_text:
                continue

            # Save to database
            chat_msg = ChatMessage(
                user_id=user_id,
                username=username,
                message=message_text,
                match_id=match_id,
            )
            from app.database import async_session
            async with async_session() as save_db:
                save_db.add(chat_msg)
                await save_db.commit()
                await save_db.refresh(chat_msg)

                # Broadcast to room
                broadcast_data = {
                    "id": str(chat_msg.id),
                    "user_id": user_id,
                    "username": username,
                    "message": message_text,
                    "match_id": match_id,
                    "created_at": chat_msg.created_at.isoformat() if chat_msg.created_at else "",
                }
                await manager.broadcast(match_id, broadcast_data)

    except WebSocketDisconnect:
        manager.disconnect(match_id, websocket)
    except Exception:
        manager.disconnect(match_id, websocket)
