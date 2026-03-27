from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db
from ..models.user import User

# HTTP Bearer token security
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Handle case where hashed_password might be empty or None
        if not hashed_password:
            return False
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except (ValueError, AttributeError) as e:
        print(f"Password verification error: {e}")
        # If hash is invalid, return False instead of crashing
        return False


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.

    Raises HTTPException if:
    - Token is missing or invalid
    - Token has expired
    - User not found or inactive
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            os.getenv("SECRET_KEY", settings.SECRET_KEY),
            algorithms=[os.getenv("ALGORITHM", settings.ALGORITHM)]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalid hai"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expire ho gaya ya invalid hai"
        )

    try:
        user = db.query(User).filter(
            User.id == int(user_id),
            User.is_active == True
        ).first()
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token"
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User nahi mila"
        )

    return user


def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user and verify they are an admin.

    Raises HTTPException 403 if user is not a superuser.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
