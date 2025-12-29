"""Test de connexion"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'academie_levinet_db')

async def test_login(email, password):
    print(f"[*] Test de connexion pour: {email}")
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Trouver l'utilisateur
    user = await db.users.find_one({"email": email})
    
    if not user:
        print(f"[ERREUR] Utilisateur non trouve: {email}")
        client.close()
        return False
    
    print(f"[OK] Utilisateur trouve: {user.get('full_name', user.get('name'))}")
    print(f"    Role: {user.get('role')}")
    print(f"    Status: {user.get('status', 'N/A')}")
    
    # Verifier le mot de passe
    stored_hash = user.get('password_hash', '')
    if not stored_hash:
        print("[ERREUR] Pas de hash de mot de passe stocke")
        client.close()
        return False
    
    try:
        is_valid = bcrypt.checkpw(password.encode(), stored_hash.encode())
        if is_valid:
            print(f"[OK] Mot de passe VALIDE!")
            client.close()
            return True
        else:
            print(f"[ERREUR] Mot de passe INVALIDE")
            client.close()
            return False
    except Exception as e:
        print(f"[ERREUR] Erreur verification: {e}")
        client.close()
        return False

if __name__ == "__main__":
    # Test avec le compte super admin
    email = "coachdigitalparis@gmail.com"
    password = "$$Reussite888!!"
    
    print("="*50)
    result = asyncio.run(test_login(email, password))
    print("="*50)
    
    if not result:
        print("\n[INFO] Le mot de passe original ne fonctionne pas.")
        print("[INFO] Creation d'un nouveau mot de passe...")
        
        async def reset_password():
            client = AsyncIOMotorClient(MONGO_URL)
            db = client[DB_NAME]
            
            new_hash = bcrypt.hashpw("$$Reussite888!!".encode(), bcrypt.gensalt()).decode()
            
            result = await db.users.update_one(
                {"email": "coachdigitalparis@gmail.com"},
                {"$set": {"password_hash": new_hash}}
            )
            
            if result.modified_count > 0:
                print("[OK] Mot de passe mis a jour!")
            
            client.close()
        
        asyncio.run(reset_password())
        
        # Re-test
        print("\n[*] Nouveau test apres mise a jour...")
        asyncio.run(test_login(email, password))

