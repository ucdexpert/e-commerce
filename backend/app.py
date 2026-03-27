"""
Hugging Face Spaces Entry Point
This file is required for Hugging Face Spaces to run the FastAPI app
"""

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
