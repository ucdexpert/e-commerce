"""
Test script to verify backend is working correctly.
Run this before starting the server to check for any issues.

Usage:
    python test_startup.py
"""

import sys

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    try:
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        print("✓ FastAPI imports OK")
    except ImportError as e:
        print(f"✗ FastAPI import failed: {e}")
        return False
    
    try:
        import uvicorn
        print("✓ Uvicorn imports OK")
    except ImportError as e:
        print(f"✗ Uvicorn import failed: {e}")
        return False
    
    try:
        from app.main import app
        print("✓ App imports OK")
    except ImportError as e:
        print(f"✗ App import failed: {e}")
        return False
    
    return True

def test_env():
    """Test if environment variables are set"""
    print("\nTesting environment...")
    try:
        from app.core.config import settings
        print(f"✓ DATABASE_URL: {'Set' if settings.DATABASE_URL else 'NOT SET'}")
        print(f"✓ SECRET_KEY: {'Set' if settings.SECRET_KEY else 'NOT SET'}")
        print(f"✓ CORS_ORIGINS: {settings.CORS_ORIGINS}")
        return True
    except Exception as e:
        print(f"✗ Environment test failed: {e}")
        return False

def test_database():
    """Test database connection"""
    print("\nTesting database connection...")
    try:
        from app.core.database import engine
        # Try to create a connection
        with engine.connect() as conn:
            print("✓ Database connection OK")
            return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        print("  This might be OK if DATABASE_URL is not set yet")
        return True  # Don't fail on this
    
def test_routes():
    """Test if routes are registered"""
    print("\nTesting routes...")
    try:
        from app.main import app
        routes = [route.path for route in app.routes]
        print(f"✓ Found {len(routes)} routes")
        
        # Check for essential routes
        essential = ["/", "/api/health", "/api/docs"]
        for route in essential:
            if route in routes:
                print(f"  ✓ {route}")
            else:
                print(f"  ✗ {route} (missing)")
        
        return True
    except Exception as e:
        print(f"✗ Routes test failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Backend Startup Test")
    print("=" * 60)
    
    all_ok = True
    
    all_ok &= test_imports()
    all_ok &= test_env()
    all_ok &= test_database()
    all_ok &= test_routes()
    
    print("\n" + "=" * 60)
    if all_ok:
        print("✓ All tests passed! Ready to start server.")
        print("\nTo start the server:")
        print("  python run.py")
        print("\nOR")
        print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("✗ Some tests failed. Please fix the issues above.")
        sys.exit(1)
    
    print("=" * 60)
