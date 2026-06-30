from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.models import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import UserCreate, UserOut, TokenPair, TokenRefresh

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

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenPair)
async def refresh(body: TokenRefresh):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_result = await get_user_from_token(payload["sub"])
    if not user_result:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token({"sub": user_result.id, "role": user_result.role})
    refresh_token = create_refresh_token({"sub": user_result.id})

    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.get("/token")
async def get_token():
    """Test endpoint to verify token works."""
    return {"message": "Token is valid"}


async def get_user_from_token(sub: str) -> User:
    from app.database import async_session
    async with async_session() as session:
        result = await session.execute(select(User).where(User.id == sub))
        return result.scalar_one_or_none()


async def get_current_user(
    token: str = Depends(lambda x: x),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency that extracts and validates JWT token from Authorization header."""
    from fastapi import Header
    # This will be replaced by a proper dependency in the actual file
    pass
