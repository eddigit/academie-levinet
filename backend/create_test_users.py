"""
Script de création des utilisateurs de test
============================================
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid

# Configuration - Charger depuis .env
from dotenv import load_dotenv
load_dotenv()

MONGODB_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DB_NAME", "academie_levinet_db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def create_test_users():
    print("=" * 60)
    print("CREATION DES UTILISATEURS DE TEST")
    print("=" * 60)

    # Connexion MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # Liste des utilisateurs de test
    test_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "membre.test@academie-levinet.com",
            "password_hash": hash_password("Test1234!"),
            "full_name": "Jean Dupont",
            "first_name": "Jean",
            "last_name": "Dupont",
            "role": "membre",
            "roles": [],
            "belt_grade": "Ceinture Bleue",
            "phone": "+33 6 12 34 56 78",
            "city": "Paris",
            "country": "France",
            "country_code": "FR",
            "membership_status": "Actif",
            "membership_type": "Standard",
            "has_paid_license": True,
            "is_premium": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "instructeur.test@academie-levinet.com",
            "password_hash": hash_password("Test1234!"),
            "full_name": "Marie Martin",
            "first_name": "Marie",
            "last_name": "Martin",
            "role": "instructeur",
            "roles": [],
            "belt_grade": "Ceinture Noire 3ème Dan",
            "dan_grade": "3ème Dan",
            "phone": "+33 6 98 76 54 32",
            "city": "Lyon",
            "country": "France",
            "country_code": "FR",
            "membership_status": "Actif",
            "has_paid_license": True,
            "is_premium": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "dt.test@academie-levinet.com",
            "password_hash": hash_password("Test1234!"),
            "full_name": "Pierre Durand",
            "first_name": "Pierre",
            "last_name": "Durand",
            "role": "directeur_technique",
            "roles": [],
            "belt_grade": "Ceinture Noire 5ème Dan",
            "dan_grade": "5ème Dan",
            "phone": "+33 6 55 44 33 22",
            "city": "Marseille",
            "country": "France",
            "country_code": "FR",
            "membership_status": "Actif",
            "has_paid_license": True,
            "is_premium": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]

    for user in test_users:
        email = user["email"]

        # Supprimer l'utilisateur existant si présent
        existing = await db.users.find_one({"email": email})
        if existing:
            await db.users.delete_one({"email": email})
            print(f"  [!] Utilisateur existant supprime: {email}")

        # Créer le nouvel utilisateur
        await db.users.insert_one(user)
        print(f"  [OK] Cree: {user['full_name']} ({user['role']}) - {email}")

    # Resume
    print("\n" + "=" * 60)
    print("UTILISATEURS DE TEST CREES")
    print("=" * 60)
    print("\n1. MEMBRE:")
    print("   Email: membre.test@academie-levinet.com")
    print("   Password: Test1234!")
    print("   Role: membre")
    print("\n2. INSTRUCTEUR:")
    print("   Email: instructeur.test@academie-levinet.com")
    print("   Password: Test1234!")
    print("   Role: instructeur")
    print("\n3. DIRECTEUR TECHNIQUE:")
    print("   Email: dt.test@academie-levinet.com")
    print("   Password: Test1234!")
    print("   Role: directeur_technique")

    # Vérification des comptes par rôle
    print("\n" + "-" * 40)
    print("VERIFICATION PAR ROLE:")
    for role in ["admin", "fondateur", "directeur_national", "directeur_technique", "instructeur", "membre"]:
        count = await db.users.count_documents({"role": role})
        print(f"  {role}: {count}")

    total = await db.users.count_documents({})
    print(f"\n  TOTAL UTILISATEURS: {total}")
    print("=" * 60)

    client.close()

if __name__ == "__main__":
    asyncio.run(create_test_users())
