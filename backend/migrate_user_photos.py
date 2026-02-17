import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import logging
import re
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME')

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')

if not all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET]):
    logger.error("Cloudinary credentials missing in .env")
    exit(1)

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)

async def migrate_user_photos():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    logger.info(f"Starting migration of user photos to Cloudinary in DB: {db_name}")

    # Process users with base64 photos
    # We look for 'photo' field (legacy) or 'photo_url' that starts with 'data:image'
    query = {
        "$or": [
            {"photo": {"$regex": "^data:image"}},
            {"photo_url": {"$regex": "^data:image"}}
        ]
    }

    total_to_migrate = await db.users.count_documents(query)
    logger.info(f"Found {total_to_migrate} users with base64 photos to migrate")

    migrated_count = 0
    error_count = 0

    async for user in db.users.find(query):
        user_id = user.get('id')
        email = user.get('email', 'unknown')

        # Determine which field has the base64 data
        base64_data = user.get('photo_url') or user.get('photo')

        if not base64_data or not base64_data.startswith('data:image'):
            continue

        try:
            logger.info(f"Uploading photo for user {email} ({user_id})...")

            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                base64_data,
                folder="academie-levinet/profiles",
                public_id=f"profile_{user_id}",
                overwrite=True,
                transformation=[
                    {"width": 400, "height": 400, "crop": "fill", "gravity": "face", "quality": "auto", "fetch_format": "auto"}
                ]
            )

            cloudinary_url = result.get('secure_url')

            # Update user in DB: set photo_url and unset the old photo field
            await db.users.update_one(
                {"id": user_id},
                {
                    "$set": {"photo_url": cloudinary_url},
                    "$unset": {"photo": ""}
                }
            )

            migrated_count += 1
            logger.info(f"Successfully migrated user {email}: {cloudinary_url}")

        except Exception as e:
            logger.error(f"Failed to migrate user {email}: {e}")
            error_count += 1

    logger.info(f"Migration complete: {migrated_count} successful, {error_count} errors")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_user_photos())
