"""Script pour importer les donnees depuis Emergent Agent"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import json

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'academie_levinet_db')

async def import_collection(db, collection_name, data):
    """Importer une collection dans MongoDB"""
    if not data:
        print(f"  [!] {collection_name}: Pas de donnees")
        return 0
    
    # Supprimer l'ancienne collection si elle existe
    await db[collection_name].delete_many({})
    
    # Convertir _id string en supprimant pour eviter les conflits
    for doc in data:
        if '_id' in doc:
            del doc['_id']
    
    # Inserer les documents
    result = await db[collection_name].insert_many(data)
    count = len(result.inserted_ids)
    print(f"  [OK] {collection_name}: {count} documents importes")
    return count

async def main():
    print("[*] Connexion a MongoDB Atlas...")
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        await client.admin.command('ping')
        print("[OK] Connexion reussie !")
    except Exception as e:
        print(f"[ERREUR] {e}")
        return
    
    print(f"\n[*] Import dans: {DB_NAME}\n")
    
    # USERS
    users_data = [
  {
    "_id": "693f04f52725dfe7e7965d66",
    "id": "7b1345cb-9698-4878-a83d-6a58ccf05974",
    "email": "admin@academie-levinet.com",
    "password_hash": "$2b$12$q.UjqXAfjcdzsx5spBpFiue8oYk28ZmhdzeT18cfPGbBcO1d9LPGq",
    "full_name": "Admin Levinet",
    "role": "admin",
    "created_at": "2025-12-14T18:41:57.783032+00:00",
    "status": "active"
  },
  {
    "_id": "6943e3c8cfc7ab5f5dbf3d04",
    "id": "3b15df30-654f-4ad5-8a73-9c4c8f5f8109",
    "email": "jean.dupont@academie-levinet.com",
    "password_hash": "$2b$12$NaWvJjHg17ttWfvd6BWV0uXjQQbZj296fIZYvWKQ81Q0OWwMeLNym",
    "full_name": "Jean Dupont",
    "role": "member"
  },
  {
    "_id": "6943f49d7ee03332c6284641",
    "id": "0a007636-f5c3-4339-bd2c-6c2436622cd5",
    "email": "membre@academie-levinet.com",
    "full_name": "Membre Test",
    "role": "member",
    "password_hash": "$2b$12$re2jiAV.x3h1K0IOFiMGh.t/BTJvwJpJM6uGHva2.0c6m5HBq7QWe"
  },
  {
    "_id": "69443d0d686b3df8e61865f0",
    "id": "6cdee070-ee2c-4a58-b751-bd37ab365bf0",
    "email": "test_user_174237@test.com",
    "password_hash": "$2b$12$/h8fgPxnPuKdTdJVILcq2.r5nSYSWVm/.yRzsNp3XeWbVGgfARU7C",
    "full_name": "Test User",
    "role": "member",
    "has_paid_license": False,
    "is_premium": False,
    "stripe_customer_id": None,
    "created_at": "2025-12-18T17:42:37.507331+00:00"
  },
  {
    "_id": "69443d33686b3df8e61865f5",
    "id": "3f6327f7-ebc6-43e0-8c98-7daebd594ccc",
    "email": "onboarding_test_174315@test.com",
    "password_hash": "$2b$12$rOjWiwK76BtFUhZf7Ml5Kecvi5BS8EJWZhgcxnGEeTNUMle5Q2TDq",
    "full_name": "Test Onboarding User",
    "role": "member",
    "has_paid_license": False,
    "is_premium": False,
    "stripe_customer_id": None,
    "created_at": "2025-12-18T17:43:15.868222+00:00"
  },
  {
    "_id": "69443e85686b3df8e61865fb",
    "id": "fefc031b-5cf8-4c64-a69c-cfd49506437d",
    "email": "coachdigitalparis@gmail.com",
    "password_hash": "$2b$12$tkBofUAl.1sboYSPeQ8Zeu7xzO41cR2.LF32aGbeYg4PWI5EodRQO",
    "full_name": "Gilles KORZEC",
    "role": "super_admin",
    "has_paid_license": False,
    "is_premium": False,
    "stripe_customer_id": None,
    "created_at": "2025-12-18T17:48:53.905014+00:00",
    "belt_grade": "Directeur Technique",
    "club_id": "a418cd35-55e6-4568-a2af-d9cc92023e65",
    "roles": [
      "super_admin",
      "admin"
    ],
    "updated_at": "2025-12-22T18:26:17.249445+00:00",
    "status": "active",
    "city": "PARIS",
    "phone": "0652345180"
  },
  {
    "_id": "6944fd2cc8687b0a94de24dd",
    "id": "d1395c6f-27d6-410e-9847-7f8dea941cf7",
    "email": "test.membre@test.com",
    "password_hash": "$2b$12$2a10WRpzo3VAxRjXqlhugeQqbSXPVpgt.kjTMmpIfCwCfEqwog3Ui",
    "full_name": "Test Membre",
    "role": "member",
    "has_paid_license": True,
    "is_premium": False,
    "stripe_customer_id": None,
    "created_at": "2025-12-19T07:22:20.932140+00:00",
    "belt_grade": "Ceinture Noire 1er Dan",
    "city": "Lyon",
    "club_name": "Club SPK Lyon",
    "instructor_name": "Jacques Levinet",
    "phone": "+33123456789",
    "motivations": [
      "Securite personnelle",
      "Confiance en soi"
    ],
    "person_type": "Homme",
    "training_mode": "club"
  },
  {
    "_id": "694519fcc69a72189e5129a5",
    "id": "bf699ee9-1ada-4f12-b318-a47bfd0ffa7a",
    "email": "edith.levinet@gmail.com",
    "password_hash": "$2b$12$qhG52CPSagnrY7n.sKjGnOn4ta7aDnYa.uWjAap0LcSPf685.I5Se",
    "full_name": "EDITH LEVINET",
    "role": "admin",
    "has_paid_license": True,
    "is_premium": False,
    "stripe_customer_id": None,
    "photo_url": None,
    "phone": "0617987295",
    "city": "Montpellier",
    "country": "France",
    "date_of_birth": None,
    "belt_grade": None,
    "club_name": None,
    "instructor_name": None,
    "bio": None,
    "created_at": "2025-12-19T09:25:16.116902+00:00",
    "status": "active"
  },
  {
    "_id": "69491c45fe26e71314f0fc51",
    "id": "cc8aaa1c-c0b1-4d08-9af8-a3a29ab7841f",
    "email": "ajl.wkmo.ipc@gmail.com",
    "password_hash": "$2b$12$lUunagNb9YnxCNR./tX5YOUWhvTM/nOV.WSjB.r3FzefmEFJN/6hC",
    "name": "Administrateur AJL",
    "role": "admin",
    "status": "active",
    "created_at": "2025-12-22T10:24:05.494424+00:00",
    "updated_at": "2025-12-22T10:24:05.494435+00:00",
    "photo_url": None,
    "full_name": "JACQUES LEVINET",
    "belt_grade": "Ceinture Noire 5eme Dan",
    "roles": [
      "admin"
    ]
  }
]
    
    await import_collection(db, "users", users_data)
    
    # Compter le total
    total = await db.users.count_documents({})
    print(f"\n[OK] Import termine ! {total} utilisateurs dans la base.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

