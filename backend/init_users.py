"""Script pour initialiser les utilisateurs dans MongoDB Atlas"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from uuid import uuid4
from datetime import datetime, timezone
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'academie_levinet_db')

async def create_user(db, email, password, name, role, roles):
    """Créer un utilisateur dans la base de données"""
    
    # Vérifier si l'utilisateur existe déjà
    existing = await db.users.find_one({"email": email})
    if existing:
        print(f"  [!] Utilisateur {email} existe deja")
        return False
    
    # Hasher le mot de passe
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    user = {
        "id": str(uuid4()),
        "email": email,
        "password_hash": hashed,
        "name": name,
        "full_name": name,
        "role": role,
        "roles": roles,
        "status": "active",
        "country": "France",
        "country_code": "FR",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    
    await db.users.insert_one(user)
    print(f"  [OK] Utilisateur cree : {email} ({role})")
    return True

async def init_users():
    """Initialiser tous les utilisateurs par défaut"""
    print("[*] Connexion a MongoDB Atlas...")
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Test de connexion
    try:
        await client.admin.command('ping')
        print("[OK] Connexion MongoDB Atlas reussie !")
    except Exception as e:
        print(f"[ERREUR] Erreur de connexion : {e}")
        return
    
    print(f"\n[*] Base de donnees : {DB_NAME}")
    print("\n[*] Creation des utilisateurs...")
    
    # Super Admin
    await create_user(
        db,
        email="coachdigitalparis@gmail.com",
        password="$$Reussite888!!",
        name="Super Admin",
        role="super_admin",
        roles=["super_admin", "admin"]
    )
    
    # Admin Standard
    await create_user(
        db,
        email="ajl.wkmo.ipc@gmail.com",
        password="Admin2025!",
        name="Admin AJL",
        role="admin",
        roles=["admin"]
    )
    
    # Membre Test
    await create_user(
        db,
        email="membre@academie-levinet.com",
        password="Membre2025!",
        name="Membre Test",
        role="member",
        roles=["member"]
    )
    
    # Verifier le nombre d'utilisateurs
    count = await db.users.count_documents({})
    print(f"\n[*] Total utilisateurs dans la base : {count}")
    
    # Lister les utilisateurs
    print("\n[*] Liste des utilisateurs :")
    async for user in db.users.find({}, {"email": 1, "role": 1, "name": 1, "_id": 0}):
        print(f"   - {user.get('email')} ({user.get('role')}) - {user.get('name')}")
    
    client.close()
    print("\n[OK] Initialisation terminee !")

if __name__ == "__main__":
    asyncio.run(init_users())

