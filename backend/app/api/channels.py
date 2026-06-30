from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.core.models import Channel
from app.schemas.channel import ChannelCreate, ChannelOut, ChannelListResponse

router = APIRouter()


@router.get("", response_model=ChannelListResponse)
async def list_channels(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Channel)
    count_query = select(func.count(Channel.id))

    if category:
        query = query.where(Channel.category == category)
        count_query = count_query.where(Channel.category == category)

    query = query.order_by(Channel.name)
    query = query.offset((page - 1) * per_page).limit(per_page)

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    result = await db.execute(query)
    channels = result.scalars().all()

    total_pages = (total + per_page - 1) // per_page

    channel_outs = []
    for c in channels:
        data = {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "logo_url": c.logo_url,
            "category": c.category,
            "is_live": c.is_live,
            "created_at": c.created_at,
        }
        channel_outs.append(ChannelOut(**data))

    return ChannelListResponse(
        data=channel_outs,
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{slug}", response_model=ChannelOut)
async def get_channel(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Channel).where(Channel.slug == slug))
    channel = result.scalar_one_or_none()

    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    data = {
        "id": channel.id,
        "name": channel.name,
        "slug": channel.slug,
        "description": channel.description,
        "logo_url": channel.logo_url,
        "category": channel.category,
        "is_live": channel.is_live,
        "created_at": channel.created_at,
    }

    return ChannelOut(**data)
