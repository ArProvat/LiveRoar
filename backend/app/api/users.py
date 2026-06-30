from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.core.models import User, Match, Favorite, WatchHistory
from app.core.auth import get_current_user
from app.schemas.auth import UserUpdate, UserOut

router = APIRouter()


@router.get("/me", response_model=UserOut)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
async def update_profile(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.name is not None:
        current_user.name = body.name
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url

    db.add(current_user)
    await db.flush()
    await db.refresh(current_user)
    return current_user


@router.get("/me/favorites", response_model=None)
async def get_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Match)
        .join(Favorite)
        .where(Favorite.user_id == current_user.id)
        .order_by(Match.start_time.desc())
    )
    return [
        {
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "sport_category": m.sport_category,
            "status": m.status,
            "start_time": m.start_time,
            "end_time": m.end_time,
            "team_a": m.team_a,
            "team_b": m.team_b,
            "league": m.league,
            "thumbnail_url": m.thumbnail_url,
            "hls_url": m.hls_url,
            "viewers": m.viewers,
            "is_featured": m.is_featured,
            "created_at": m.created_at,
        }
        for m in result.scalars().all()
    ]


@router.post("/me/favorites/{match_id}", response_model=None)
async def add_favorite(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    fav = Favorite(user_id=current_user.id, match_id=match_id)
    try:
        db.add(fav)
        await db.flush()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Already a favorite")
    return {"success": True, "match_id": match_id}


@router.delete("/me/favorites/{match_id}", response_model=None)
async def remove_favorite(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.match_id == match_id,
        )
    )
    fav = result.scalar_one_or_none()
    if not fav:
        raise HTTPException(status_code=404, detail="Not a favorite")

    await db.delete(fav)
    await db.flush()
    return {"success": True, "match_id": match_id}


@router.get("/me/history", response_model=None)
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WatchHistory)
        .where(WatchHistory.user_id == current_user.id)
        .order_by(WatchHistory.watched_at.desc())
        .limit(50)
    )
    return [
        {
            "id": h.id,
            "match_id": h.match_id,
            "watched_at": h.watched_at,
            "progress": h.progress,
            "duration_watched": h.duration_watched,
        }
        for h in result.scalars().all()
    ]
