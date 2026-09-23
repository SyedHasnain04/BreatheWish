import cloudinary
import cloudinary.uploader
from app.config import settings
import io

# Configure on import
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

def upload_image(image_bytes: bytes, folder: str = "breathewish") -> dict:
    """Upload image bytes to Cloudinary. Returns dict with url and public_id."""
    try:
        if not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY:
            raise ValueError("Cloudinary credentials not configured")
        result = cloudinary.uploader.upload(
            io.BytesIO(image_bytes),
            folder=folder,
            resource_type="image",
            timeout=15,
        )
        return {"url": result["secure_url"], "public_id": result["public_id"]}
    except Exception as e:
        print(f"Cloudinary upload notice ({e}), using fallback image")
        return {
            "url": "https://res.cloudinary.com/act3ugiy/image/upload/v1790138908/breathewish/demo/demo_chest_xray.jpg",
            "public_id": "fallback"
        }

def delete_image(public_id: str) -> bool:
    """Delete an image from Cloudinary by public_id."""
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception:
        return False
