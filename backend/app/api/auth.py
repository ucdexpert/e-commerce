from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session
from typing import Any, Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..core.database import get_db
from ..core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from ..models import User, Cart, Wishlist
from ..schemas import (
    UserCreate,
    UserResponse,
    LoginRequest,
    Token,
    TokenWithUser,
    TokenRefresh,
    UserUpdate,
)
from datetime import datetime, timedelta
from ..core.config import settings
from ..utils.email import send_reset_email, send_verification_email
from pydantic import BaseModel, EmailStr
import re
from jose import jwt
import os

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Initialize rate limiter for auth endpoints
limiter = Limiter(key_func=get_remote_address)


def create_verification_token(email: str) -> str:
    """
    Create email verification token.
    Expires in 24 hours.
    """
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(
        {"sub": email, "exp": expire, "type": "verify"},
        os.getenv("SECRET_KEY"),
        algorithm="HS256"
    )


def validate_password(password: str) -> bool:
    """
    Validate password strength.
    
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    
    Raises HTTPException if password doesn't meet requirements.
    """
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter"
        )
    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter"
        )
    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number"
        )
    return True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

def get_current_user_optional(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[User]:
    """Get current user if authenticated, return None otherwise"""
    if not authorization:
        return None

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        return None

    payload = decode_token(token)
    if not payload:
        return None

    try:
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        return user
    except (ValueError, TypeError):
        return None

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """Get current user (requires authentication)"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme"
        )

    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    try:
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return user
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")  # Max 3 registration attempts per minute
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    # Validate password strength
    validate_password(user_data.password)

    # Check if user exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )

    # Create new user
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        phone=user_data.phone,
        hashed_password=get_password_hash(user_data.password),
        is_verified=False  # Not verified yet
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create empty cart for user
    cart = Cart(user_id=user.id)
    db.add(cart)

    # Create empty wishlist for user
    wishlist = Wishlist(user_id=user.id)
    db.add(wishlist)

    db.commit()

    # Send verification email
    try:
        token = create_verification_token(user.email)
        send_verification_email(user.email, token)
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        # Don't fail registration if email fails

    return user

@router.get("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """
    Verify user's email address using token from email.
    """
    try:
        # Decode token
        payload = jwt.decode(
            token,
            os.getenv("SECRET_KEY"),
            algorithms=["HS256"]
        )
        
        # Check token type
        if payload.get("type") != "verify":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )
        
        # Get email from token
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token"
            )
        
        # Find user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.is_verified:
            return {
                "message": "Email already verified",
                "already_verified": True
            }
        
        # Mark user as verified
        user.is_verified = True
        db.commit()
        
        return {
            "message": "Email verified successfully! You can now login.",
            "already_verified": False
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Email verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")  # Max 5 login attempts per minute
async def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    # Ensure user has a cart
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()

    # Ensure user has a wishlist
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == user.id).first()
    if not wishlist:
        wishlist = Wishlist(user_id=user.id)
        db.add(wishlist)
        db.commit()

    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "email": user.email}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
def refresh_token_endpoint(token_data: TokenRefresh, db: Session = Depends(get_db)):
    payload = decode_token(token_data.refresh_token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    try:
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        # Create new tokens
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user.id), "email": user.email}
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = user_data.model_dump(exclude_unset=True)

    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(
    request: Request,
    password_data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Send password reset email to user.
    For security, always return success message even if email doesn't exist.
    """
    # Find user by email
    user = db.query(User).filter(User.email == password_data.email).first()
    
    if user:
        # Generate reset token (1 hour expiry)
        reset_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "type": "password_reset"},
            expires_delta=timedelta(minutes=60)
        )
        
        # Send reset email
        try:
            send_reset_email(user.email, reset_token)
        except Exception as e:
            print(f"Failed to send reset email: {e}")
            # Don't expose email sending failure to client
    
    # Always return success to prevent email enumeration
    return {
        "message": "If an account with that email exists, a password reset link has been sent."
    }


@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    reset_data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password using the token from email.
    """
    try:
        # Verify reset token
        payload = decode_token(reset_data.token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Check token type
        if payload.get("type") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )
        
        # Get user from token
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()

        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )

        # Update password
        user.hashed_password = get_password_hash(reset_data.new_password)
        db.commit()

        return {"message": "Password has been reset successfully"}

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )


# =============================================================================
# SOCIAL LOGIN (Google OAuth)
# =============================================================================

class SocialLoginRequest(BaseModel):
    email: EmailStr
    name: str
    provider: str
    provider_id: str
    picture: Optional[str] = None


@router.post("/social-login", response_model=TokenWithUser)
async def social_login(
    login_data: SocialLoginRequest,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Handle social login from Google OAuth (NextAuth).
    Creates user if doesn't exist, or returns existing user token.
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()

    if not user:
        # Create new user
        # Extract username from email (before @)
        username_base = login_data.email.split('@')[0]
        username = username_base

        # Ensure username is unique
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{username_base}_{counter}"
            counter += 1

        user = User(
            email=login_data.email,
            username=username,
            full_name=login_data.name,
            avatar=login_data.picture,
            hashed_password="",  # No password for OAuth users
            is_active=True,
            is_superuser=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update user info if changed
        if login_data.picture and user.avatar != login_data.picture:
            user.avatar = login_data.picture
        if login_data.name and user.full_name != login_data.name:
            user.full_name = login_data.name
        db.commit()

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been disabled"
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    # Create refresh token (no expires_delta parameter)
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)}
    )

    # Return both tokens and user data
    return TokenWithUser(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            phone=user.phone,
            avatar=user.avatar,
            is_active=user.is_active,
            created_at=user.created_at
        )
    )
