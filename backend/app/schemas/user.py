from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ============ User Schemas ============
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    sms_notifications_enabled: Optional[bool] = True


class UserCreate(UserBase):
    password: str
    referral_code: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    password: Optional[str] = None
    sms_notifications_enabled: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    avatar: Optional[str] = None
    is_active: bool
    is_verified: bool = False
    is_superuser: bool = False
    two_factor_enabled: bool = False
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
