from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ============ User Schemas ============
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    avatar: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Auth Schemas ============
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenWithUser(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenRefresh(BaseModel):
    refresh_token: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
