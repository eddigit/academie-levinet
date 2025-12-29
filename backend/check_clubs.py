"""Vérifier les clubs dans la base de données"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_clubs():
    client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
    db = client[os.getenv('DB_NAME')]
    
    clubs = await db.clubs.find({}, {'name': 1, 'id': 1, '_id': 0}).to_list(100)
    
    print(f'\n✅ Nombre de clubs: {len(clubs)}\n')
    
    if clubs:
        for club in clubs:
            print(f"  - {club.get('name', 'Sans nom')} (id: {club.get('id', 'N/A')})")
    else:
        print("  ⚠️ Aucun club trouvé dans la base de données")
        print("  📝 Créez d'abord des clubs dans la section Clubs de l'application")
    
    print()

asyncio.run(check_clubs())
