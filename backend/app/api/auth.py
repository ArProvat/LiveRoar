from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.core.models import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.auth import get_current_user
from app.schemas.auth import UserCreate, UserUpdate, UserOut, TokenPair, TokenRefresh

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenPair)
async def login(body: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    access_token = create_access_token({"sub": user.id, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.id})

    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenPair)
async def refresh(body: TokenRefresh):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    from app.database import async_session
    async with async_session() as session:
        result = await session.execute(select(User).where(User.id == payload["sub"]))
        user_result = result.scalar_one_or_none()

    if not user_result:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token({"sub": user_result.id, "role": user_result.role})
    refresh_token = create_refresh_token({"sub": user_result.id})

    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserOut)
async def update_me(body: UserUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if body.name is not None:
        user.name = body.name
    if body.avatar_url is not None:
        user.avatar_url = body.avatar_url
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user
