from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from ..core.database import get_db
from ..models import Product
from ..core.security import decode_token
from ..utils.cloudinary import upload_base64_image
import base64

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_DIR = "uploads/products"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[int]:
    """Get current user ID from token"""
    if not authorization:
        return None

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        return None

    payload = decode_token(token)
    if not payload:
        return None

    try:
        return int(payload.get("sub"))
    except (ValueError, TypeError):
        return None

@router.post("/images")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    """Upload multiple product images to Cloudinary"""

    uploaded_urls = []

    for file in files:
        # Check file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            continue

        try:
            # Read file content first (FastAPI UploadFile doesn't support seek(0, 2))
            file_content = await file.read()
            file_size = len(file_content)

            # Validate size (5MB limit)
            if file_size > MAX_FILE_SIZE:
                print(f"Skipped {file.filename}: File too large ({file_size} bytes)")
                continue

            # Validate type
            allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
            if file.content_type not in allowed_types:
                print(f"Skipped {file.filename}: Invalid content type ({file.content_type})")
                continue

            # Convert to base64
            base64_string = base64.b64encode(file_content).decode('utf-8')

            # Determine MIME type
            mime_type = f"image/{file_ext.replace('.', '')}"
            if mime_type == "image/jpg":
                mime_type = "image/jpeg"

            # Create data URL
            data_url = f"data:{mime_type};base64,{base64_string}"

            # Upload to Cloudinary
            cloudinary_url = upload_base64_image(data_url)
            uploaded_urls.append(cloudinary_url)
        except Exception as e:
            print(f"Failed to upload {file.filename}: {e}")
            continue

    return {
        "success": True,
        "uploaded_count": len(uploaded_urls),
        "urls": uploaded_urls
    }
