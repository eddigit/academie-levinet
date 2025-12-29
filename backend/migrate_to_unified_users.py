"""
Script de migration - Unification des collections vers users
============================================================
Migre les données de members, technical_directors, instructors vers la table users unique.
Chaque personne = 1 compte user avec un rôle.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid

# Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "academie_levinet")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def migrate():
    print("=" * 60)
    print("MIGRATION VERS TABLE USERS UNIFIÉE")
    print("=" * 60)

    # Connexion MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    stats = {
        "members_migrated": 0,
        "instructors_migrated": 0,
        "directors_migrated": 0,
        "skipped_duplicates": 0,
        "errors": 0
    }

    # 1. Migrer les MEMBRES
    print("\n[1/3] Migration des MEMBRES...")
    members = await db.members.find({}).to_list(10000)
    print(f"   Trouvé {len(members)} membres à migrer")

    for member in members:
        try:
            email = member.get("email", "").lower().strip()
            if not email:
                print(f"   ⚠ Membre sans email ignoré: {member.get('first_name', 'inconnu')}")
                continue

            # Vérifier si l'utilisateur existe déjà
            existing = await db.users.find_one({"email": email})
            if existing:
                print(f"   ⚠ Email déjà existant, mise à jour: {email}")
                # Mettre à jour avec les infos du membre si role est membre
                if existing.get("role") == "membre":
                    update_data = {
                        "first_name": member.get("first_name"),
                        "last_name": member.get("last_name"),
                        "full_name": f"{member.get('first_name', '')} {member.get('last_name', '')}".strip(),
                        "phone": member.get("phone"),
                        "city": member.get("city"),
                        "country": member.get("country", "France"),
                        "country_code": member.get("country_code", "FR"),
                        "date_of_birth": member.get("date_of_birth"),
                        "belt_grade": member.get("belt_grade"),
                        "photo_url": member.get("photo_url") or member.get("photo"),
                        "membership_status": member.get("membership_status", "Actif"),
                        "membership_type": member.get("membership_type", "Standard"),
                        "membership_start_date": member.get("membership_start_date"),
                        "membership_end_date": member.get("membership_end_date"),
                        "technical_director_id": member.get("technical_director_id"),
                        "club_id": member.get("club_id"),
                    }
                    await db.users.update_one({"email": email}, {"$set": update_data})
                stats["skipped_duplicates"] += 1
                continue

            # Créer le nouvel utilisateur
            user_doc = {
                "id": member.get("id") or str(uuid.uuid4()),
                "email": email,
                "password_hash": hash_password("Membre2024!"),  # Mot de passe par défaut
                "full_name": f"{member.get('first_name', '')} {member.get('last_name', '')}".strip(),
                "first_name": member.get("first_name"),
                "last_name": member.get("last_name"),
                "role": "membre",
                "roles": [],
                "phone": member.get("phone"),
                "city": member.get("city"),
                "country": member.get("country", "France"),
                "country_code": member.get("country_code", "FR"),
                "date_of_birth": member.get("date_of_birth"),
                "belt_grade": member.get("belt_grade"),
                "photo_url": member.get("photo_url") or member.get("photo"),
                "membership_status": member.get("membership_status", "Actif"),
                "membership_type": member.get("membership_type", "Standard"),
                "membership_start_date": member.get("membership_start_date"),
                "membership_end_date": member.get("membership_end_date"),
                "technical_director_id": member.get("technical_director_id"),
                "club_id": member.get("club_id"),
                "has_paid_license": False,
                "is_premium": False,
                "created_at": member.get("created_at") or datetime.now(timezone.utc).isoformat()
            }

            await db.users.insert_one(user_doc)
            stats["members_migrated"] += 1
            print(f"   ✓ Membre migré: {email}")

        except Exception as e:
            print(f"   ✗ Erreur membre {member.get('email', 'inconnu')}: {e}")
            stats["errors"] += 1

    # 2. Migrer les INSTRUCTEURS
    print("\n[2/3] Migration des INSTRUCTEURS...")
    instructors = await db.instructors.find({}).to_list(10000)
    print(f"   Trouvé {len(instructors)} instructeurs à migrer")

    for instructor in instructors:
        try:
            email = instructor.get("email", "").lower().strip()
            if not email:
                # Générer un email si absent
                name = instructor.get("name", "instructeur").lower().replace(" ", ".")
                email = f"{name}@academie-levinet.com"

            existing = await db.users.find_one({"email": email})
            if existing:
                print(f"   ⚠ Email déjà existant, upgrade role: {email}")
                # Upgrade le rôle si c'est un membre
                if existing.get("role") == "membre":
                    await db.users.update_one(
                        {"email": email},
                        {"$set": {
                            "role": "instructeur",
                            "bio": instructor.get("bio"),
                            "specialties": instructor.get("specialties", []),
                            "photo_url": instructor.get("photo_url") or existing.get("photo_url"),
                            "club_id": instructor.get("club_id"),
                            "club_ids": instructor.get("club_ids", []),
                        }}
                    )
                    stats["instructors_migrated"] += 1
                else:
                    stats["skipped_duplicates"] += 1
                continue

            # Parser le nom
            name_parts = (instructor.get("name") or "Instructeur Inconnu").split(" ", 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            user_doc = {
                "id": instructor.get("id") or str(uuid.uuid4()),
                "email": email,
                "password_hash": hash_password("Instructeur2024!"),
                "full_name": instructor.get("name", ""),
                "first_name": first_name,
                "last_name": last_name,
                "role": "instructeur",
                "roles": [],
                "phone": instructor.get("phone"),
                "city": instructor.get("city"),
                "country": instructor.get("country", "France"),
                "country_code": instructor.get("country_code", "FR"),
                "belt_grade": instructor.get("belt_grade"),
                "dan_grade": instructor.get("dan_grade"),
                "photo_url": instructor.get("photo_url"),
                "bio": instructor.get("bio"),
                "specialties": instructor.get("specialties", []),
                "club_id": instructor.get("club_id"),
                "club_ids": instructor.get("club_ids", []),
                "has_paid_license": True,
                "is_premium": True,
                "membership_status": "Actif",
                "created_at": instructor.get("created_at") or datetime.now(timezone.utc).isoformat()
            }

            await db.users.insert_one(user_doc)
            stats["instructors_migrated"] += 1
            print(f"   ✓ Instructeur migré: {email}")

        except Exception as e:
            print(f"   ✗ Erreur instructeur {instructor.get('name', 'inconnu')}: {e}")
            stats["errors"] += 1

    # 3. Migrer les DIRECTEURS TECHNIQUES
    print("\n[3/3] Migration des DIRECTEURS TECHNIQUES...")
    directors = await db.technical_directors.find({}).to_list(10000)
    print(f"   Trouvé {len(directors)} directeurs techniques à migrer")

    for director in directors:
        try:
            email = director.get("email", "").lower().strip()
            if not email:
                name = director.get("name", "directeur").lower().replace(" ", ".")
                email = f"{name}@academie-levinet.com"

            existing = await db.users.find_one({"email": email})
            if existing:
                print(f"   ⚠ Email déjà existant, upgrade role: {email}")
                # Upgrade le rôle
                if existing.get("role") in ["membre", "instructeur"]:
                    await db.users.update_one(
                        {"email": email},
                        {"$set": {
                            "role": "directeur_technique",
                            "bio": director.get("bio"),
                            "region": director.get("region"),
                            "photo_url": director.get("photo_url") or existing.get("photo_url"),
                        }}
                    )
                    stats["directors_migrated"] += 1
                else:
                    stats["skipped_duplicates"] += 1
                continue

            name_parts = (director.get("name") or "Directeur Inconnu").split(" ", 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            user_doc = {
                "id": director.get("id") or str(uuid.uuid4()),
                "email": email,
                "password_hash": hash_password("Directeur2024!"),
                "full_name": director.get("name", ""),
                "first_name": first_name,
                "last_name": last_name,
                "role": "directeur_technique",
                "roles": [],
                "phone": director.get("phone"),
                "city": director.get("city"),
                "country": director.get("country", "France"),
                "country_code": director.get("country_code", "FR"),
                "region": director.get("region"),
                "belt_grade": director.get("belt_grade") or "Ceinture Noire",
                "dan_grade": director.get("dan_grade"),
                "photo_url": director.get("photo_url"),
                "bio": director.get("bio"),
                "has_paid_license": True,
                "is_premium": True,
                "membership_status": "Actif",
                "created_at": director.get("created_at") or datetime.now(timezone.utc).isoformat()
            }

            await db.users.insert_one(user_doc)
            stats["directors_migrated"] += 1
            print(f"   ✓ Directeur technique migré: {email}")

        except Exception as e:
            print(f"   ✗ Erreur directeur {director.get('name', 'inconnu')}: {e}")
            stats["errors"] += 1

    # Résumé
    print("\n" + "=" * 60)
    print("RÉSUMÉ DE LA MIGRATION")
    print("=" * 60)
    print(f"  Membres migrés:              {stats['members_migrated']}")
    print(f"  Instructeurs migrés:         {stats['instructors_migrated']}")
    print(f"  Directeurs techniques migrés: {stats['directors_migrated']}")
    print(f"  Doublons ignorés/mis à jour: {stats['skipped_duplicates']}")
    print(f"  Erreurs:                     {stats['errors']}")

    # Compter les utilisateurs par rôle
    print("\n" + "-" * 40)
    print("UTILISATEURS PAR RÔLE APRÈS MIGRATION:")
    for role in ["admin", "fondateur", "directeur_national", "directeur_technique", "instructeur", "membre"]:
        count = await db.users.count_documents({"role": role})
        print(f"  {role}: {count}")

    total = await db.users.count_documents({})
    print(f"\n  TOTAL UTILISATEURS: {total}")
    print("=" * 60)

    client.close()

if __name__ == "__main__":
    asyncio.run(migrate())
