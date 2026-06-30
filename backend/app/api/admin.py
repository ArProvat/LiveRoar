from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.core.models import Match, Channel, StreamConfig, User, ChatMessage
from app.core.auth import require_admin, get_current_user
from app.schemas.match import MatchCreate, MatchUpdate

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total_matches = await db.execute(select(func.count(Match.id)))
    live_matches = await db.execute(select(func.count(Match.id)).where(Match.status == "LIVE"))
    total_users = await db.execute(select(func.count(User.id)))

    recent_matches = await db.execute(
        select(Match).order_by(Match.created_at.desc()).limit(10)
    )

    return {
        "total_matches": total_matches.scalar(),
        "live_matches": live_matches.scalar(),
        "total_users": total_users.scalar(),
        "recent_matches": [
            {
                "id": m.id,
                "title": m.title,
                "status": m.status,
                "viewers": m.viewers,
                "start_time": m.start_time.isoformat() if m.start_time else None,
            }
            for m in recent_matches.scalars().all()
        ],
    }


@router.post("/matches", response_model=Match)
async def create_match(
    body: MatchCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    match = Match(**body.model_dump())
    db.add(match)
    await db.flush()
    await db.refresh(match)
    return match


@router.put("/matches/{match_id}")
async def update_match(
    match_id: str,
    body: MatchUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Match).where(Match.id == match_id))
    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(match, key, value)

    db.add(match)
    await db.flush()
    await db.refresh(match)
    return match


@router.post("/streams/generate-key")
async def generate_stream_key(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    import secrets
    key = secrets.token_urlsafe(32)

    config = StreamConfig(
        stream_key=key,
        is_active=False,
    )
    db.add(config)
    await db.flush()
    await db.refresh(config)

    return {
        "stream_key": key,
        "config_id": config.id,
    }


@router.get("/streams/status")
async def get_stream_status(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StreamConfig).order_by(StreamConfig.created_at.desc()).limit(50)
    )
    configs = result.scalars().all()

    return [
        {
            "id": c.id,
            "match_id": c.match_id,
            "stream_key": c.stream_key,
            "is_active": c.is_active,
            "started_at": c.started_at.isoformat() if c.started_at else None,
            "stopped_at": c.stopped_at.isoformat() if c.stopped_at else None,
            "hls_url": c.hls_url,
            "bitrate": c.bitrate,
            "resolution": c.resolution,
            "error_message": c.error_message,
        }
        for c in configs
    ]


@router.get("/users")
async def list_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    from app.database import async_session
    async with async_session() as session:
        result = await session.execute(
            select(User).order_by(User.created_at.desc()).limit(100)
        )
        users = result.scalars().all()

        return [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]


@router.get("/chat/moderation")
async def chat_moderation(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.is_deleted == False)
        .order_by(ChatMessage.created_at.desc())
        .limit(100)
    )
    messages = result.scalars().all()

    return [
        {
            "id": m.id,
            "username": m.username,
            "message": m.message,
            "match_id": m.match_id,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]
