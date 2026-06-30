from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.core.models import Match, Channel
from app.schemas.match import MatchCreate, MatchUpdate, MatchOut, MatchListResponse

router = APIRouter()


@router.get("", response_model=MatchListResponse)
async def list_matches(
    sport_category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Match)
    count_query = select(func.count(Match.id))

    if sport_category:
        query = query.where(Match.sport_category == sport_category)
        count_query = count_query.where(Match.sport_category == sport_category)

    if status:
        query = query.where(Match.status == status)
        count_query = count_query.where(Match.status == status)

    query = query.order_by(Match.start_time.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    result = await db.execute(query)
    matches = result.scalars().all()

    total_pages = (total + per_page - 1) // per_page

    match_outs = []
    for m in matches:
        data = {
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
        if m.channel:
            data["channel"] = {
                "name": m.channel.name,
                "slug": m.channel.slug,
            }
        match_outs.append(MatchOut(**data))

    return MatchListResponse(
        data=match_outs,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.get("/{match_id}", response_model=MatchOut)
async def get_match(match_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Match).where(Match.id == str(match_id)))
    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    data = {
        "id": match.id,
        "title": match.title,
        "description": match.description,
        "sport_category": match.sport_category,
        "status": match.status,
        "start_time": match.start_time,
        "end_time": match.end_time,
        "team_a": match.team_a,
        "team_b": match.team_b,
        "league": match.league,
        "thumbnail_url": match.thumbnail_url,
        "hls_url": match.hls_url,
        "viewers": match.viewers,
        "is_featured": match.is_featured,
        "created_at": match.created_at,
    }

    if match.channel:
        data["channel"] = {
            "name": match.channel.name,
            "slug": match.channel.slug,
        }

    return MatchOut(**data)
