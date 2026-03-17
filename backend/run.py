"""
Run the FastAPI backend server.

Usage:
    python run.py
    
Or with uvicorn directly:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("Starting E-Commerce Backend Server")
    print("=" * 60)
    print("API Docs: http://localhost:8000/api/docs")
    print("Root:     http://localhost:8000/")
    print("Health:   http://localhost:8000/api/health")
    print("=" * 60)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",  # Listen on all network interfaces
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
