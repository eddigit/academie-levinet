"""Import subscriptions, events, leads"""
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
    
    # SUBSCRIPTIONS
    subscriptions_data = [
  {"id": "90f56206-efea-4c79-9b80-bc6ade65b147", "member_id": "da19244d-a0d6-4275-b430-3af32c489525", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-14T18:45:11.628662+00:00"},
  {"id": "d28cb654-2f99-406e-843e-6b13d4177d5d", "member_id": "33ab8ca1-5f3d-4aed-bf67-ab55e89def86", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-18T17:42:37.759836+00:00"},
  {"id": "813a9aba-624a-4eee-b2e3-51f1d8c2e6a9", "member_id": "c432c7d6-e7aa-4927-86c2-7e9587b9e44f", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-19T07:19:46.230552+00:00"},
  {"id": "c2fb1a8c-738e-462a-91d3-c4c7713ec075", "member_id": "ebb5a6eb-a8ce-429e-b868-2185b17192ce", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-19T07:20:14.983084+00:00"},
  {"id": "45418f69-6656-4d4c-bc57-8ed49e3b2bb1", "member_id": "d3abda59-857b-4c0b-985d-4c59a1c15387", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-19T14:57:57.968371+00:00"},
  {"id": "47298127-5b97-4cab-922f-44f308350d98", "member_id": "bcd846fa-0acd-4433-85e3-cf44d40ef13b", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-19T14:58:25.038941+00:00"},
  {"id": "f796dcb1-e80a-4dc3-9c2f-d9017a7f6823", "member_id": "6ee51f1f-712e-42bc-8d97-a62772aee193", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-19T14:58:49.921861+00:00"},
  {"id": "0063ae98-ae5b-42f2-81d5-311878ce2111", "member_id": "b09632b9-202b-4e8b-825a-8d598e374bee", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-19T22:06:49.542147+00:00"},
  {"id": "38c91188-2e53-4d13-90c5-dfeeaec14427", "member_id": "03c12ba6-8f97-4841-8976-03a1ee9ae40e", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-19T22:07:34.473905+00:00"},
  {"id": "6a94bc6b-4b38-44e4-bf79-973a56ae02e0", "member_id": "988a55df-2f59-4348-96cc-f65e8590c166", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-19T22:12:37.924549+00:00"},
  {"id": "46225c1c-2907-4f2e-b798-1d3a8b5fcaff", "member_id": "2c8ce1a0-eb69-4f73-b38c-3c50d07aac0e", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-19T22:22:34.101975+00:00"},
  {"id": "89117290-c819-4ef2-9cde-e74933b2f274", "member_id": "b75ef65e-f105-4638-9f9a-43462881e5e8", "amount": 50.0, "payment_date": "2025-01-15", "payment_method": "Carte bancaire", "status": "Paye", "created_at": "2025-12-22T18:49:47.760882+00:00"}
]
    
    # EVENTS
    events_data = [
  {
    "id": "836ca326-303c-419d-a3dd-5192cfb031e0",
    "title": "Stage International SPK 2025",
    "description": "Stage de perfectionnement pour tous les niveaux",
    "event_type": "Stage",
    "start_date": "2025-03-15",
    "end_date": "2025-03-16",
    "start_time": "",
    "end_time": "",
    "location": "Centre Sportif Municipal",
    "city": "Lyon",
    "country": "France",
    "instructor": "",
    "max_participants": None,
    "current_participants": 0,
    "price": 0.0,
    "image_url": "",
    "status": "A venir",
    "created_by": "7b1345cb-9698-4878-a83d-6a58ccf05974",
    "created_at": "2025-12-22T10:06:29.494382+00:00",
    "updated_at": "2025-12-22T10:06:29.494384+00:00"
  }
]
    
    # LEADS
    leads_data = [
  {"id": "02ea155c-e134-4274-8189-be155e08d9e1", "person_type": "Femme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Sophie Martin Test", "email": "contact@academielevinet.com", "phone": "+33 6 12 34 56 78", "city": "Paris", "country": "France", "status": "Nouveau", "notes": None, "created_at": "2025-12-14T20:01:36.827779+00:00"},
  {"id": "7b1bd601-dc69-4c1f-ad11-d3256a95c212", "person_type": "Homme", "motivations": ["Securite personnelle"], "full_name": "Gilles KORZEC", "email": "coachdigitalparis@gmail.com", "phone": "+33652345180", "city": "Courbevoie", "country": "France", "status": "Nouveau", "notes": None, "created_at": "2025-12-18T17:26:31.867216+00:00"},
  {"id": "e0d3d15b-4e80-4fb5-b261-0996227686b6", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Test Onboard User", "email": "onboard_test_1766079621@test.com", "phone": "+33 6 12 34 56 78", "city": "Lyon", "country": "France", "training_mode": "online", "nearest_club_city": None, "status": "Nouveau", "notes": None, "created_at": "2025-12-18T17:40:22.003537+00:00"},
  {"id": "1d2fc057-9eba-4871-9c43-c1aaa181baf4", "person_type": "Homme", "motivations": ["Condition physique"], "full_name": "Public Test User", "email": "public_test_174315@test.com", "phone": "+33987654321", "city": "Lyon", "country": "France", "training_mode": "online", "nearest_club_city": None, "status": "Nouveau", "notes": None, "created_at": "2025-12-18T17:43:15.605971+00:00"},
  {"id": "f3f6c440-2310-45fb-8135-0e2a85f671d7", "person_type": "Femme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Test Onboarding User", "email": "onboarding_test_174315@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "training_mode": "both", "nearest_club_city": "Paris", "status": "Nouveau", "notes": None, "created_at": "2025-12-18T17:43:15.927379+00:00"},
  {"id": "9737fd69-bad8-4821-9732-14f80c1b5915", "person_type": "Femme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Test Integration 1766079911", "email": "integration1766079911@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "training_mode": "both", "nearest_club_city": "Paris", "status": "Nouveau", "notes": None, "created_at": "2025-12-18T17:45:13.008897+00:00"},
  {"id": "7e4f08c9-ec22-4127-b335-38ba5c83fae0", "person_type": "Homme", "motivations": ["Confiance en soi", "Condition physique"], "full_name": "Gilles KORZEC", "email": "coachdigitalparis@gmail.com", "phone": "+33652345180", "city": "Courbevoie", "country": "France", "training_mode": "both", "nearest_club_city": "montpellier", "status": "Nouveau", "notes": None, "created_at": "2025-12-18T17:48:54.053468+00:00"}
]
    
    # Import all
    await db.subscriptions.delete_many({})
    result = await db.subscriptions.insert_many(subscriptions_data)
    print(f"[OK] subscriptions: {len(result.inserted_ids)} documents importes")
    
    await db.events.delete_many({})
    result = await db.events.insert_many(events_data)
    print(f"[OK] events: {len(result.inserted_ids)} documents importes")
    
    await db.leads.delete_many({})
    result = await db.leads.insert_many(leads_data)
    print(f"[OK] leads: {len(result.inserted_ids)} documents importes")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

