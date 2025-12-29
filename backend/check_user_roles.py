#!/usr/bin/env python3
"""
Script pour verifier les roles des utilisateurs dans la base de donnees.
"""

import os
from pymongo import MongoClient

# Charger les variables d'environnement manuellement
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value.strip('"').strip("'")
    return env_vars

env = load_env()
MONGODB_URL = env.get("MONGODB_URL", os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
DATABASE_NAME = env.get("DATABASE_NAME", os.getenv("DATABASE_NAME", "academie_levinet"))

def check_roles():
    print(f"Connexion a MongoDB: {MONGODB_URL[:50]}...")
    client = MongoClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # 1. Lister toutes les collections
    collections = db.list_collection_names()
    print(f"\nCollections existantes: {collections}")

    # 2. Compter tous les utilisateurs
    total_users = db.users.count_documents({})
    print(f"\nTotal utilisateurs dans 'users': {total_users}")

    # 3. Lister tous les utilisateurs avec leurs roles
    print("\n--- Liste de tous les utilisateurs ---")
    users = list(db.users.find({}, {"_id": 0, "id": 1, "full_name": 1, "email": 1, "role": 1, "roles": 1}))

    for u in users:
        print(f"  - {u.get('full_name', 'N/A')} ({u.get('email', 'N/A')})")
        print(f"    role: {u.get('role', 'NON DEFINI')}")
        print(f"    roles: {u.get('roles', 'NON DEFINI')}")
        print()

    # 4. Compter par role
    print("\n--- Comptage par role ---")
    roles_to_check = ['admin', 'fondateur', 'directeur_national', 'directeur_technique', 'instructeur', 'membre',
                      'national_director', 'technical_director', 'instructor', 'member']

    for role in roles_to_check:
        count = db.users.count_documents({"role": role})
        if count > 0:
            print(f"  role='{role}': {count}")

    # 5. Verifier les utilisateurs sans role
    no_role = db.users.count_documents({"role": {"$exists": False}})
    null_role = db.users.count_documents({"role": None})
    empty_role = db.users.count_documents({"role": ""})
    print(f"\n  Sans champ 'role': {no_role}")
    print(f"  role=null: {null_role}")
    print(f"  role='': {empty_role}")

    # 6. Verifier les anciennes collections
    print("\n--- Anciennes collections ---")
    for coll in ['members', 'instructors', 'technical_directors']:
        if coll in collections:
            count = db[coll].count_documents({})
            print(f"  Collection '{coll}': {count} documents")
            if count > 0:
                sample = db[coll].find_one()
                print(f"    Exemple: {sample.get('full_name', sample.get('name', 'N/A'))}")

    client.close()

if __name__ == "__main__":
    check_roles()
