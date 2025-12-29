#!/usr/bin/env python3
"""
Script pour nettoyer les donnees obsoletes de la base de donnees.
Supprime les anciennes collections et les utilisateurs fantomes.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "academie_levinet")

async def cleanup():
    print("Connexion a MongoDB...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # 1. Lister toutes les collections
    collections = await db.list_collection_names()
    print(f"\nCollections existantes: {collections}")

    # Collections obsoletes a supprimer (anciennes tables separees)
    obsolete_collections = [
        "members",           # Remplace par users avec role=membre
        "instructors",       # Remplace par users avec role=instructeur
        "technical_directors",  # Remplace par users avec role=directeur_technique
    ]

    for coll in obsolete_collections:
        if coll in collections:
            count = await db[coll].count_documents({})
            print(f"\n[OBSOLETE] Collection '{coll}': {count} documents")
            confirm = input(f"  Supprimer la collection '{coll}'? (oui/non): ")
            if confirm.lower() == 'oui':
                await db[coll].drop()
                print(f"  -> Collection '{coll}' supprimee")
            else:
                print(f"  -> Collection '{coll}' conservee")

    # 2. Chercher les utilisateurs avec des noms suspects
    print("\n\n--- Recherche d'utilisateurs suspects ---")
    suspicious_patterns = ["webmaster", "test", "admin123", "demo"]

    for pattern in suspicious_patterns:
        users = await db.users.find({
            "$or": [
                {"full_name": {"$regex": pattern, "$options": "i"}},
                {"email": {"$regex": pattern, "$options": "i"}}
            ]
        }).to_list(100)

        if users:
            print(f"\nUtilisateurs correspondant a '{pattern}':")
            for u in users:
                print(f"  - ID: {u.get('id')}")
                print(f"    Nom: {u.get('full_name')}")
                print(f"    Email: {u.get('email')}")
                print(f"    Role: {u.get('role')}")
                confirm = input(f"    Supprimer cet utilisateur? (oui/non): ")
                if confirm.lower() == 'oui':
                    await db.users.delete_one({"id": u.get('id')})
                    print(f"    -> Utilisateur supprime")

    # 3. Chercher les utilisateurs sans role valide
    print("\n\n--- Verification des roles ---")
    valid_roles = ['admin', 'fondateur', 'directeur_national', 'directeur_technique', 'instructeur', 'membre']

    invalid_users = await db.users.find({
        "role": {"$nin": valid_roles}
    }).to_list(100)

    if invalid_users:
        print(f"Utilisateurs avec roles invalides: {len(invalid_users)}")
        for u in invalid_users:
            print(f"  - {u.get('full_name')} ({u.get('email')}) - Role: {u.get('role')}")
            new_role = input(f"    Nouveau role (ou 'supprimer'): ")
            if new_role == 'supprimer':
                await db.users.delete_one({"id": u.get('id')})
                print(f"    -> Utilisateur supprime")
            elif new_role in valid_roles:
                await db.users.update_one({"id": u.get('id')}, {"$set": {"role": new_role}})
                print(f"    -> Role mis a jour: {new_role}")
    else:
        print("Tous les utilisateurs ont des roles valides.")

    # 4. Statistiques finales
    print("\n\n--- Statistiques finales ---")
    total_users = await db.users.count_documents({})
    print(f"Total utilisateurs: {total_users}")

    for role in valid_roles:
        count = await db.users.count_documents({"role": role})
        print(f"  - {role}: {count}")

    print("\nNettoyage termine!")
    client.close()

if __name__ == "__main__":
    asyncio.run(cleanup())
