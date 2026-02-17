import os
import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import logging
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

async def upload_if_base64(data_str, folder, public_id):
    if not isinstance(data_str, str) or not data_str.startswith('data:image'):
        return data_str
    
    try:
        logger.info(f"Uploading image {public_id} to Cloudinary...")
        result = cloudinary.uploader.upload(
            data_str,
            folder=folder,
            public_id=public_id,
            overwrite=True,
            transformation=[{"quality": "auto", "fetch_format": "auto"}]
        )
        return result.get('secure_url')
    except Exception as e:
        logger.error(f"Failed to upload {public_id}: {e}")
        return data_str

async def migrate_site_images():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    logger.info(f"Starting migration of site content images to Cloudinary")
    
    content = await db.settings.find_one({"id": "site_content"})
    if not content:
        logger.error("No site_content found in DB")
        return

    # Helper to recursively find and upload base64 images
    async def process_dict(d, path=""):
        for k, v in d.items():
            current_path = f"{path}_{k}" if path else k
            if isinstance(v, dict):
                await process_dict(v, current_path)
            elif isinstance(v, list):
                for i, item in enumerate(v):
                    if isinstance(item, dict):
                        await process_dict(item, f"{current_path}_{i}")
                    elif isinstance(item, str) and item.startswith('data:image'):
                        v[i] = await upload_if_base64(item, "academie-levinet/site", f"{current_path}_{i}")
            elif isinstance(v, str) and v.startswith('data:image'):
                d[k] = await upload_if_base64(v, "academie-levinet/site", current_path)

    # Process branding
    if "branding" in content:
        await process_dict(content["branding"], "branding")
    
    # Process hero
    if "hero" in content:
        await process_dict(content["hero"], "hero")
        
    # Process login
    if "login" in content:
        await process_dict(content["login"], "login")

    # Process founder
    if "founder" in content:
        await process_dict(content["founder"], "founder")

    # Process about
    if "about" in content:
        await process_dict(content["about"], "about")

    # Process disciplines
    if "disciplines" in content:
        await process_dict(content["disciplines"], "disciplines")

    # Process pages
    if "pages" in content:
        await process_dict(content["pages"], "pages")

    # Save back to DB
    await db.settings.update_one(
        {"id": "site_content"},
        {"$set": content}
    )

    logger.info("Site content migration complete")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_site_images())
