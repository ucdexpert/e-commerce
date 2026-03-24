from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.orm import Session
from .core.database import engine, Base, get_db
from .core.config import settings
from .core.security import decode_token
from .models import User
from .api import auth, products, categories, cart, orders, addresses, wishlist, search, admin, upload, contact, jazzcash, easypaisa, variants, returns, roles

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Complete E-Commerce API with Next.js frontend",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ============== GLOBAL EXCEPTION HANDLERS ==============

# Validation errors (422) - Show friendly messages
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = error["loc"][-1] if error["loc"] else "field"
        msg = error["msg"]
        
        # Make messages friendly
        if "missing" in msg.lower():
            errors.append(f"{field} zaroori hai")
        elif "string_too_short" in msg.lower():
            errors.append(f"{field} bohot chota hai")
        elif "value_error" in msg.lower() or "invalid" in msg.lower():
            errors.append(f"{field} sahi nahi hai")
        elif "greater_than" in msg.lower():
            errors.append(f"{field} sahi value se chota hai")
        elif "less_than" in msg.lower():
            errors.append(f"{field} sahi value se bada hai")
        else:
            errors.append(f"{field}: {msg}")
    
    return JSONResponse(
        status_code=422,
        content={"detail": " | ".join(errors)}
    )

# HTTP exceptions (404, 403, 401, etc.) - Friendly messages
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    messages = {
        404: "Yeh item nahi mila",
        403: "Aapko permission nahi hai",
        401: "Please login karein",
        405: "Yeh action allowed nahi hai",
        400: "Invalid request. Dobara try karein",
        429: "Bohot zyada requests. Thodi der baad try karein",
    }
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": messages.get(exc.status_code, "Kuch masla aa gaya")}
    )

# Generic 500 errors - Don't expose technical details
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log error but don't expose to user
    print(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Server mein masla aa gaya. Thodi der mein try karein."}
    )

# ============== MIDDLEWARE ==============

# CORS middleware - Restrict to specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://e-commerce-mu-wheat-87.vercel.app",
        "https://e-commerce-ekvsaiio3-ucdexperts-projects.vercel.app",
        "https://e-commerce-mxp3n24u3-ucdexperts-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Dependency to get current user
async def get_current_user(
    authorization: str = None,
    db: Session = Depends(get_db)
) -> User:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Extract token from "Bearer <token>"
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
    
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(addresses.router, prefix="/api")
app.include_router(wishlist.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(jazzcash.router, prefix="/api")
app.include_router(easypaisa.router, prefix="/api")
app.include_router(variants.router, prefix="/api")
app.include_router(returns.router, prefix="/api")
app.include_router(roles.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "E-Commerce API",
        "version": settings.APP_VERSION,
        "docs": "/api/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Example of protected route
@app.get("/api/profile")
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "avatar": current_user.avatar
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
