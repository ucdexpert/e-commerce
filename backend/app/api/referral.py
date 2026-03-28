import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.referral import Referral
from app.models.user import User
from pydantic import BaseModel
import secrets
import string
from typing import List, Optional

router = APIRouter(prefix="/referral", tags=["Referral"])


def generate_referral_code(length=8):
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))


class ReferralResponse(BaseModel):
    referral_code: str
    referral_link: str
    total_referrals: int
    completed_referrals: int
    total_earned: float
    reward_per_referral: float = 10.0


class ReferralInfo(BaseModel):
    id: int
    referrer_id: int
    referred_id: Optional[int] = None
    referral_code: str
    status: str
    reward_amount: float
    reward_given: bool
    created_at: str
    completed_at: Optional[str] = None
    
    class Config:
        from_attributes = True


@router.get("/my-referral", response_model=ReferralResponse)
async def get_my_referral(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's referral code and stats"""
    # Generate referral code if not exists
    if not current_user.referral_code:
        code = generate_referral_code()
        while db.query(User).filter(User.referral_code == code).first():
            code = generate_referral_code()
        current_user.referral_code = code
        db.commit()

    # Get referral stats
    total = db.query(Referral).filter(Referral.referrer_id == current_user.id).count()
    completed = db.query(Referral).filter(
        Referral.referrer_id == current_user.id,
        Referral.status == "completed"
    ).count()
    earned = completed * 10.0

    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')

    return {
        "referral_code": current_user.referral_code,
        "referral_link": f"{frontend_url}/register?ref={current_user.referral_code}",
        "total_referrals": total,
        "completed_referrals": completed,
        "total_earned": earned,
        "reward_per_referral": 10.0
    }


@router.get("/referrals", response_model=List[ReferralInfo])
async def get_referrals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all referrals for current user"""
    referrals = db.query(Referral).filter(
        Referral.referrer_id == current_user.id
    ).order_by(Referral.created_at.desc()).all()
    return referrals


@router.post("/apply")
async def apply_referral_code(
    referral_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply a referral code (for existing users who didn't use one during signup)"""
    # Check if user already has a referral
    existing = db.query(Referral).filter(Referral.referred_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already used a referral code")
    
    # Find the referrer
    referrer = db.query(User).filter(User.referral_code == referral_code).first()
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    
    if referrer.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot use your own referral code")
    
    # Create referral record
    new_referral = Referral(
        referrer_id=referrer.id,
        referred_id=current_user.id,
        referral_code=referral_code,
        status="completed",
        completed_at=db.query(func.now()).scalar()
    )
    db.add(new_referral)
    db.commit()
    
    return {"message": "Referral code applied successfully! Referrer will be rewarded."}
