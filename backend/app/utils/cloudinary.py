import cloudinary
import cloudinary.uploader
import os
import base64
import uuid
from dotenv import load_dotenv
from fastapi import HTTPException

# Load environment variables
load_dotenv()

# Get Cloudinary credentials
cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
api_key = os.getenv("CLOUDINARY_API_KEY")
api_secret = os.getenv("CLOUDINARY_API_SECRET")

# Validate credentials
if not cloud_name or not api_key or not api_secret:
    print("⚠️ Warning: Cloudinary credentials not fully configured")
    print(f"Cloud name: {cloud_name or 'MISSING'}")
    print(f"API Key: {api_key or 'MISSING'}")
    print(f"API Secret: {'*' * 8 if api_secret else 'MISSING'}")

# Configure Cloudinary
cloudinary.config(
    cloud_name=cloud_name,
    api_key=api_key,
    api_secret=api_secret
)

def upload_base64_image(base64_string: str) -> str:
    """
    Upload a base64 encoded image to Cloudinary and return the URL.
    
    Args:
        base64_string: Base64 encoded image string (with or without data:image prefix)
    
    Returns:
        Secure URL of the uploaded image
    """
    try:
        # Remove data:image prefix if present
        if base64_string.startswith("data:image"):
            # Extract the base64 part after the comma
            base64_string = base64_string.split(",")[1]
        
        # Generate unique public ID
        public_id = f"product_{uuid.uuid4().hex[:12]}"
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            f"data:image/jpeg;base64,{base64_string}",
            folder="ecommerce/products",
            public_id=public_id,
            overwrite=False,
            resource_type="image"
        )
        
        return result["secure_url"]
    
    except Exception as e:
        print(f"Error uploading image to Cloudinary: {e}")
        # Return a placeholder URL or raise exception
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {str(e)}"
        )

def upload_multiple_base64_images(base64_strings: list) -> list:
    """
    Upload multiple base64 encoded images to Cloudinary.
    
    Args:
        base64_strings: List of base64 encoded image strings
    
    Returns:
        List of secure URLs
    """
    urls = []
    for base64_string in base64_strings:
        if base64_string:  # Skip empty strings
            url = upload_base64_image(base64_string)
            urls.append(url)
    return urls

def delete_image(public_id: str) -> bool:
    """
    Delete an image from Cloudinary.
    
    Args:
        public_id: The public ID of the image to delete
    
    Returns:
        True if successful, False otherwise
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        print(f"Error deleting image: {e}")
        return False
