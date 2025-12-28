"""Import clubs"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'academie_levinet_db')

async def main():
    print("[*] Connexion a MongoDB Atlas...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    clubs_data = [
  {
    "id": "14f52012-9c9f-40eb-a6f7-c3d5528bce12",
    "name": "Club SPK Lyon",
    "address": "45 Avenue de la Self-Defense",
    "city": "Lyon",
    "country": "France",
    "phone": "+33 4 72 00 00 00",
    "email": "lyon@academie-levinet.com",
    "logo_url": "",
    "technical_director_id": "fefc031b-5cf8-4c64-a69c-cfd49506437d",
    "technical_director_name": "Gilles KORZEC",
    "instructor_ids": [],
    "disciplines": [
      "Self-Pro Krav (SPK)",
      "Krav Maga"
    ],
    "schedule": "Lun-Ven: 18h-21h\nSam: 10h-12h",
    "status": "Actif",
    "created_at": "2025-12-19T14:55:14.946824+00:00",
    "updated_at": None
  },
  {
    "id": "81991efb-6926-45e5-bccd-207f57509f4b",
    "name": "Club SPK Test 145758",
    "address": "123 Rue de Test",
    "city": "Paris",
    "country": "France",
    "phone": "+33123456789",
    "email": "test@club.com",
    "logo_url": None,
    "technical_director_id": "fefc031b-5cf8-4c64-a69c-cfd49506437d",
    "technical_director_name": "Gilles KORZEC",
    "instructor_ids": [],
    "disciplines": [
      "Self-Pro Krav (SPK)",
      "WKMO"
    ],
    "schedule": "Lun-Ven: 18h-21h\nSam: 10h-12h",
    "status": "Actif",
    "created_at": "2025-12-19T14:57:58.655533+00:00",
    "updated_at": None
  },
  {
    "id": "1307f267-24cf-4d61-b0d9-98c679fa46ec",
    "name": "Updated Club SPK Test 145825",
    "address": "123 Rue de Test",
    "city": "Lyon",
    "country": "France",
    "phone": "+33987654321",
    "email": "test@club.com",
    "logo_url": None,
    "technical_director_id": "fefc031b-5cf8-4c64-a69c-cfd49506437d",
    "technical_director_name": "Gilles KORZEC",
    "instructor_ids": [],
    "disciplines": [
      "Self-Pro Krav (SPK)",
      "WKMO"
    ],
    "schedule": "Lun-Ven: 18h-21h\nSam: 10h-12h",
    "status": "Actif",
    "created_at": "2025-12-19T14:58:25.659881+00:00",
    "updated_at": "2025-12-19T14:58:25.854435+00:00"
  },
  {
    "id": "8ca5b783-578b-4a43-8b0b-ad14a525d4aa",
    "name": "Updated Club SPK Test 145850",
    "address": "123 Rue de Test",
    "city": "Lyon",
    "country": "France",
    "phone": "+33987654321",
    "email": "test@club.com",
    "logo_url": None,
    "technical_director_id": "fefc031b-5cf8-4c64-a69c-cfd49506437d",
    "technical_director_name": "Gilles KORZEC",
    "instructor_ids": [],
    "disciplines": [
      "Self-Pro Krav (SPK)",
      "WKMO"
    ],
    "schedule": "Lun-Ven: 18h-21h\nSam: 10h-12h",
    "status": "Actif",
    "created_at": "2025-12-19T14:58:50.569006+00:00",
    "updated_at": "2025-12-19T14:58:50.680668+00:00"
  },
  {
    "id": "b10bc998-ebc4-46d2-9e5e-42336dafb142",
    "name": "Updated Club SPK Test 220650",
    "address": "123 Rue de Test",
    "city": "Lyon",
    "country": "France",
    "phone": "+33987654321",
    "email": "test@club.com",
    "logo_url": None,
    "technical_director_id": "fefc031b-5cf8-4c64-a69c-cfd49506437d",
    "technical_director_name": "Gilles KORZEC",
    "instructor_ids": [],
    "disciplines": [
      "Self-Pro Krav (SPK)",
      "WKMO"
    ],
    "schedule": "Lun-Ven: 18h-21h\nSam: 10h-12h",
    "status": "Actif",
    "created_at": "2025-12-19T22:06:50.281763+00:00",
    "updated_at": "2025-12-19T22:06:50.443123+00:00"
  },
  {
    "id": "280da7bb-e5f1-42da-adf5-8f10a3c83ab4",
    "name": "Updated Club SPK Test 220735",
    "address": "123 Rue de Test",
    "city": "Lyon",
    "country": "France",
    "phone": "+33987654321",
    "email": "test@club.com",
    "logo_url": None,
    "technical_director_id": "fefc031b-5cf8-4c64-a69c-cfd49506437d",
    "technical_director_name": "Gilles KORZEC",
    "instructor_ids": [],
    "disciplines": [
      "Self-Pro Krav (SPK)",
      "WKMO"
    ],
    "schedule": "Lun-Ven: 18h-21h\nSam: 10h-12h",
    "status": "Actif",
    "created_at": "2025-12-19T22:07:35.093276+00:00",
    "updated_at": "2025-12-19T22:07:35.210738+00:00"
  },
  {
    "id": "c571a7f4-b6b2-4880-8911-ea0962ee0eac",
    "name": "Updated Club SPK Test 221238",
    "address": "123 Rue de Test",
    "city": "Lyon",
    "country": "France",
    "phone": "+33987654321",
    "email": "test@club.com",
    "logo_url": None,
    "technical_director_id": "fefc031b-5cf8-4c64-a69c-cfd49506437d",
    "technical_director_name": "Gilles KORZEC",
    "instructor_ids": [],
    "disciplines": [
      "Self-Pro Krav (SPK)",
      "WKMO"
    ],
    "schedule": "Lun-Ven: 18h-21h\nSam: 10h-12h",
    "status": "Actif",
    "created_at": "2025-12-19T22:12:38.592448+00:00",
    "updated_at": "2025-12-19T22:12:38.754198+00:00"
  },
  {
    "id": "a418cd35-55e6-4568-a2af-d9cc92023e65",
    "name": "Updated Club SPK Test 222234",
    "address": "123 Rue de Test",
    "city": "Lyon",
    "country": "France",
    "phone": "+33987654321",
    "email": "test@club.com",
    "logo_url": None,
    "technical_director_id": "fefc031b-5cf8-4c64-a69c-cfd49506437d",
    "technical_director_name": "Gilles KORZEC",
    "instructor_ids": [],
    "disciplines": [
      "Self-Pro Krav (SPK)",
      "WKMO"
    ],
    "schedule": "Lun-Ven: 18h-21h\nSam: 10h-12h",
    "status": "Actif",
    "created_at": "2025-12-19T22:22:34.763201+00:00",
    "updated_at": "2025-12-19T22:22:34.879265+00:00"
  }
]
    
    await db.clubs.delete_many({})
    result = await db.clubs.insert_many(clubs_data)
    print(f"[OK] clubs: {len(result.inserted_ids)} documents importes")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

