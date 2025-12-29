#!/usr/bin/env python3
"""
Script pour corriger les roles des utilisateurs.
Ce script permet d'assigner des roles aux utilisateurs existants.
"""

import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "academie_levinet")

# Roles valides
VALID_ROLES = ['admin', 'fondateur', 'directeur_national', 'directeur_technique', 'instructeur', 'membre']

async def fix_roles():
    print("Connexion a MongoDB...")
    print(f"URL: {MONGODB_URL[:50]}...")
    print(f"Database: {DATABASE_NAME}")

    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # 1. Afficher tous les utilisateurs
    print("\n--- Utilisateurs actuels ---")
    users = await db.users.find({}, {"_id": 0, "id": 1, "full_name": 1, "email": 1, "role": 1}).to_list(100)

    if not users:
        print("Aucun utilisateur trouve!")
        client.close()
        return

    for i, u in enumerate(users):
        role = u.get('role', 'NON DEFINI')
        print(f"  {i+1}. {u.get('full_name', 'N/A')} ({u.get('email', 'N/A')}) - role: {role}")

    # 2. Compter par role
    print("\n--- Repartition des roles ---")
    for role in VALID_ROLES:
        count = await db.users.count_documents({"role": role})
        print(f"  {role}: {count}")

    # 3. Options
    print("\n--- Options ---")
    print("1. Assigner un role a un utilisateur specifique")
    print("2. Assigner un role a tous les utilisateurs sans role valide")
    print("3. Supprimer l'utilisateur 'Gilles Webmaster' (obsolete)")
    print("4. Quitter")

    choice = input("\nVotre choix (1-4): ").strip()

    if choice == '1':
        # Assigner un role specifique
        user_id = input("Entrez l'ID de l'utilisateur (ou son email): ").strip()

        # Chercher l'utilisateur
        user = await db.users.find_one({"$or": [{"id": user_id}, {"email": user_id}]})
        if not user:
            print("Utilisateur non trouve!")
            client.close()
            return

        print(f"\nUtilisateur trouve: {user.get('full_name')}")
        print(f"Role actuel: {user.get('role', 'NON DEFINI')}")

        print("\nRoles disponibles:")
        for i, role in enumerate(VALID_ROLES):
            print(f"  {i+1}. {role}")

        role_choice = input("Choisissez le nouveau role (1-6): ").strip()
        try:
            new_role = VALID_ROLES[int(role_choice) - 1]
            await db.users.update_one({"id": user.get("id")}, {"$set": {"role": new_role}})
            print(f"Role mis a jour: {new_role}")
        except (ValueError, IndexError):
            print("Choix invalide!")

    elif choice == '2':
        # Assigner le role 'membre' a tous sans role valide
        result = await db.users.update_many(
            {"role": {"$nin": VALID_ROLES}},
            {"$set": {"role": "membre"}}
        )
        print(f"Mis a jour {result.modified_count} utilisateurs avec le role 'membre'")

    elif choice == '3':
        # Supprimer Gilles Webmaster
        user = await db.users.find_one({"full_name": {"$regex": "Gilles.*Webmaster", "$options": "i"}})
        if user:
            print(f"\nUtilisateur trouve: {user.get('full_name')} ({user.get('email')})")
            confirm = input("Confirmer la suppression? (oui/non): ").strip()
            if confirm.lower() == 'oui':
                await db.users.delete_one({"id": user.get("id")})
                print("Utilisateur supprime!")
            else:
                print("Suppression annulee.")
        else:
            print("Utilisateur 'Gilles Webmaster' non trouve.")

    elif choice == '4':
        print("Au revoir!")

    client.close()

if __name__ == "__main__":
    asyncio.run(fix_roles())
