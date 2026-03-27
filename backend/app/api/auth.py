from fastapi import APIRouter, Depends, HTTPException, status, Header, Request, Query
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
from ..models import User, Cart, Wishlist, Referral
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
from ..utils.email import send_reset_email, send_verification_email, send_email
from pydantic import BaseModel, EmailStr
import re
from jose import jwt
import os
import pyotp
import qrcode
import io
import base64

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

    # Handle referral code if provided
    if user_data.referral_code:
        referrer = db.query(User).filter(User.referral_code == user_data.referral_code).first()
        if referrer and referrer.id != user.id:
            # Check if user already has a referral
            existing_referral = db.query(Referral).filter(Referral.referred_id == user.id).first()
            if not existing_referral:
                new_referral = Referral(
                    referrer_id=referrer.id,
                    referred_id=user.id,
                    referral_code=user_data.referral_code,
                    status="completed",
                    completed_at=datetime.utcnow()
                )
                db.add(new_referral)
                print(f"Referral recorded: User {referrer.username} referred {user.username}")

    db.commit()

    # Send verification email
    try:
        token = create_verification_token(user.email)
        send_verification_email(user.email, token)
        print(f"Verification email sent to {user.email}")
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        # Don't fail registration if email fails

    return user

@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    return current_user

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

        # Send welcome email after successful verification
        try:
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            welcome_html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2563EB; font-size: 32px; margin-bottom: 20px;">
                    🎉 Welcome to E-Shop!
                </h1>
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                    Hi {user.full_name or user.username},
                </p>
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                    Your email has been verified successfully! Your account is now active and ready to use.
                </p>
                <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #6B7280;">
                        <strong>Your Account:</strong><br>
                        Email: {user.email}<br>
                        Username: {user.username}
                    </p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{frontend_url}/products"
                       style="background-color: #2563EB; color: white;
                              padding: 14px 28px; text-decoration: none;
                              border-radius: 8px; display: inline-block;
                              font-weight: bold; font-size: 16px;">
                        🛍️ Start Shopping →
                    </a>
                </div>
                <p style="font-size: 14px; color: #6B7280; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px;">
                    Thank you for joining E-Shop! We're excited to have you as part of our community.
                </p>
                <p style="font-size: 14px; color: #9CA3AF;">
                    Need help? Contact us at hassankhilji26@gmail.com
                </p>
            </div>
            """
            send_email(
                to_email=user.email,
                subject="Welcome to E-Shop! Let's Start Shopping 🎊",
                html=welcome_html
            )
            print(f"Welcome email sent to {user.email}")
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
            # Don't fail verification if welcome email fails

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

    # Return tokens AND user info
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "phone": user.phone,
            "avatar": user.avatar,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
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


# =============================================================================
# TWO-FACTOR AUTHENTICATION (2FA)
# =============================================================================

class TwoFactorSetupResponse(BaseModel):
    secret: str
    qr_code: str
    manual_entry: str
    uri: str

class TwoFactorVerifyRequest(BaseModel):
    code: str

class TwoFactorVerifySetupRequest(BaseModel):
    code: str

class TwoFactorDisableRequest(BaseModel):
    code: str

@router.post("/2fa/setup", response_model=TwoFactorSetupResponse)
async def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Setup 2FA for current user - generates secret and QR code"""
    # Generate secret
    secret = pyotp.random_base32()
    current_user.totp_secret = secret
    db.commit()

    # Create TOTP URI
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="E-Shop"
    )

    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode()

    return {
        "secret": secret,
        "qr_code": f"data:image/png;base64,{qr_base64}",
        "manual_entry": secret,
        "uri": uri
    }


@router.post("/2fa/verify-setup")
async def verify_2fa_setup(
    request: TwoFactorVerifySetupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify 2FA setup code and enable 2FA"""
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA not set up. Please call /2fa/setup first.")

    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(request.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")

    current_user.two_factor_enabled = True
    db.commit()
    
    return {"message": "2FA enabled successfully!"}


@router.post("/2fa/verify")
async def verify_2fa(
    request: TwoFactorVerifyRequest,
    temp_token: str,
    db: Session = Depends(get_db)
):
    """
    Verify 2FA code during login.
    Called after initial login when user has 2FA enabled.
    """
    try:
        # Verify temp token and get user
        payload = jwt.decode(temp_token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == int(user_id)).first()

        if not user or not user.totp_secret:
            raise HTTPException(status_code=400, detail="Invalid request")

        # Verify 2FA code
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(request.code, valid_window=1):
            raise HTTPException(status_code=400, detail="Invalid 2FA code")

        # Generate real tokens
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "two_factor_enabled": user.two_factor_enabled
            }
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Temp token expired. Please login again.")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid temp token")


@router.post("/2fa/disable")
async def disable_2fa(
    request: TwoFactorDisableRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable 2FA for current user"""
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA not enabled")

    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(request.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid code")

    current_user.two_factor_enabled = False
    current_user.totp_secret = None
    db.commit()
    
    return {"message": "2FA disabled successfully"}


@router.get("/2fa/status")
async def get_2fa_status(
    current_user: User = Depends(get_current_user)
):
    """Get current user's 2FA status"""
    return {
        "enabled": current_user.two_factor_enabled and current_user.totp_secret is not None,
        "setup_required": current_user.totp_secret is None and not current_user.two_factor_enabled
    }
