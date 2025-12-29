"""Import pending_members, orders, posts"""
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
    
    # PENDING_MEMBERS
    pending_members_data = [
  {"id": "10a586b9-84c7-47ae-bbeb-eeb659f9b871", "person_type": "Homme", "motivations": ["Securite personnelle", "Condition physique"], "full_name": "Pierre Martin", "email": "pierre.martin@test.com", "phone": "+33 6 11 22 33 44", "city": "Lyon", "country": "France", "club_name": "Club SPK Lyon", "instructor_name": "Jean-Pierre Martin", "belt_grade": "Ceinture Bleue", "training_mode": "club", "status": "Approuve", "admin_notes": None, "reviewed_by": "7b1345cb-9698-4878-a83d-6a58ccf05974", "reviewed_at": "2025-12-19T07:17:50.087542+00:00", "created_at": "2025-12-19T07:17:10.336010+00:00"},
  {"id": "b41ec375-e439-4a5a-83f0-a36c395ebed6", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Jean Membre", "email": "pending_071946@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "club_name": "Club SPK Paris Centre", "instructor_name": "Jacques Levinet", "belt_grade": "Ceinture Noire 1er Dan", "training_mode": "club", "status": "En attente", "admin_notes": None, "reviewed_by": None, "reviewed_at": None, "created_at": "2025-12-19T07:19:46.337644+00:00"},
  {"id": "58a92758-cbbf-49f6-9472-e9da19a02f64", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Jean Membre", "email": "pending_072015@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "club_name": "Club SPK Paris Centre", "instructor_name": "Jacques Levinet", "belt_grade": "Ceinture Noire 1er Dan", "training_mode": "club", "status": "Approuve", "admin_notes": None, "reviewed_by": "7b1345cb-9698-4878-a83d-6a58ccf05974", "reviewed_at": "2025-12-19T07:20:15.403237+00:00", "created_at": "2025-12-19T07:20:15.095628+00:00"},
  {"id": "16cbbcad-a049-4995-8675-f967332bbcbf", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Test Membre", "email": "test.membre@test.com", "phone": "+33123456789", "city": "Lyon", "country": "France", "club_name": "Club SPK Lyon", "instructor_name": "Jacques Levinet", "belt_grade": "Ceinture Noire 1er Dan", "training_mode": "club", "status": "Approuve", "admin_notes": None, "reviewed_by": "7b1345cb-9698-4878-a83d-6a58ccf05974", "reviewed_at": "2025-12-19T07:22:20.932989+00:00", "created_at": "2025-12-19T07:20:51.917961+00:00"},
  {"id": "3adf8c1a-bd37-4252-81f6-4527d60e8eb3", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Jean Membre", "email": "pending_145758@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "club_name": "Club SPK Paris Centre", "instructor_name": "Jacques Levinet", "belt_grade": "Ceinture Noire 1er Dan", "training_mode": "club", "status": "Approuve", "admin_notes": None, "reviewed_by": "7b1345cb-9698-4878-a83d-6a58ccf05974", "reviewed_at": "2025-12-19T14:57:58.448273+00:00", "created_at": "2025-12-19T14:57:58.140592+00:00"},
  {"id": "c58799ca-e44f-4696-bee6-21da9d55ad21", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Jean Membre", "email": "pending_145825@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "club_name": "Club SPK Paris Centre", "instructor_name": "Jacques Levinet", "belt_grade": "Ceinture Noire 1er Dan", "training_mode": "club", "status": "Approuve", "admin_notes": None, "reviewed_by": "7b1345cb-9698-4878-a83d-6a58ccf05974", "reviewed_at": "2025-12-19T14:58:25.470000+00:00", "created_at": "2025-12-19T14:58:25.151488+00:00"},
  {"id": "fa5c171f-3266-47dd-b2c5-4111cbd0cbb6", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Jean Membre", "email": "pending_145850@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "club_name": "Club SPK Paris Centre", "instructor_name": "Jacques Levinet", "belt_grade": "Ceinture Noire 1er Dan", "training_mode": "club", "status": "Approuve", "admin_notes": None, "reviewed_by": "7b1345cb-9698-4878-a83d-6a58ccf05974", "reviewed_at": "2025-12-19T14:58:50.370994+00:00", "created_at": "2025-12-19T14:58:50.033679+00:00"},
  {"id": "9638558a-b960-47e5-8d7d-57fdef269070", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Jean Membre", "email": "pending_220649@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "club_name": "Club SPK Paris Centre", "instructor_name": "Jacques Levinet", "belt_grade": "Ceinture Noire 1er Dan", "training_mode": "club", "status": "Approuve", "admin_notes": None, "reviewed_by": "7b1345cb-9698-4878-a83d-6a58ccf05974", "reviewed_at": "2025-12-19T22:06:50.043194+00:00", "created_at": "2025-12-19T22:06:49.722743+00:00"},
  {"id": "13b8a4e3-bbdb-488c-945e-a9696a69117f", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Jean Membre", "email": "pending_220734@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "club_name": "Club SPK Paris Centre", "instructor_name": "Jacques Levinet", "belt_grade": "Ceinture Noire 1er Dan", "training_mode": "club", "status": "Approuve", "admin_notes": None, "reviewed_by": "7b1345cb-9698-4878-a83d-6a58ccf05974", "reviewed_at": "2025-12-19T22:07:34.896211+00:00", "created_at": "2025-12-19T22:07:34.591924+00:00"},
  {"id": "e613dbb6-cef2-4ba2-a81f-ad2d032da28b", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Jean Membre", "email": "pending_221238@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "club_name": "Club SPK Paris Centre", "instructor_name": "Jacques Levinet", "belt_grade": "Ceinture Noire 1er Dan", "training_mode": "club", "status": "Approuve", "admin_notes": None, "reviewed_by": "7b1345cb-9698-4878-a83d-6a58ccf05974", "reviewed_at": "2025-12-19T22:12:38.354360+00:00", "created_at": "2025-12-19T22:12:38.053825+00:00"},
  {"id": "f45846b7-ea94-4bad-a282-9eb2cb97d683", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Jean Membre", "email": "pending_222234@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "club_name": "Club SPK Paris Centre", "instructor_name": "Jacques Levinet", "belt_grade": "Ceinture Noire 1er Dan", "training_mode": "club", "status": "Approuve", "admin_notes": None, "reviewed_by": "7b1345cb-9698-4878-a83d-6a58ccf05974", "reviewed_at": "2025-12-19T22:22:34.522208+00:00", "created_at": "2025-12-19T22:22:34.224361+00:00"},
  {"id": "4d165197-64b6-45d0-ac2e-56547724cd17", "person_type": "Homme", "motivations": ["Securite personnelle", "Confiance en soi"], "full_name": "Jean Membre", "email": "pending_184947@test.com", "phone": "+33123456789", "city": "Paris", "country": "France", "club_name": "Club SPK Paris Centre", "instructor_name": "Jacques Levinet", "belt_grade": "Ceinture Noire 1er Dan", "training_mode": "club", "status": "Approuve", "admin_notes": None, "reviewed_by": "7b1345cb-9698-4878-a83d-6a58ccf05974", "reviewed_at": "2025-12-22T18:49:48.249142+00:00", "created_at": "2025-12-22T18:49:47.944115+00:00"}
]
    
    # ORDERS
    orders_data = [
  {
    "id": "badf70cd-0131-48d1-8176-e008abdf504f",
    "session_id": "cs_test_a1yYQyPAcAL0896j9XapuH0LiYbv0Gfpw2F74NQjK2ruuCNnekRtl1VOVH",
    "user_id": "96c06f3a-df55-4d38-be9c-f7c1fc18916b",
    "user_email": "test@academie-levinet.com",
    "items": [
      {
        "product_id": "4976dd3c-88d4-446b-bdde-5bacffe188c5",
        "product_name": "Sac de Sport SPK",
        "quantity": 1,
        "size": "Unique",
        "unit_price": 49.0,
        "total_price": 49.0
      }
    ],
    "subtotal": 49.0,
    "discount_applied": False,
    "total_amount": 49.0,
    "currency": "eur",
    "status": "En attente",
    "payment_status": "pending",
    "created_at": "2025-12-18T17:23:38.722756+00:00",
    "updated_at": "2025-12-18T17:23:38.722764+00:00"
  }
]
    
    # POSTS
    posts_data = [
  {
    "id": "15548bc9-c13a-4bdd-8ae9-017b5ce26baf",
    "author_id": "0a007636-f5c3-4339-bd2c-6c2436622cd5",
    "content": "Bonjour a toute la communaute ! Je viens de terminer mon premier stage SPK et je suis ravi de faire partie de cette grande famille.",
    "post_type": "text",
    "image_url": None,
    "video_url": None,
    "created_at": "2025-12-18T16:34:05.058359+00:00",
    "updated_at": "2025-12-18T16:34:05.058368+00:00"
  },
  {
    "id": "140f8223-f63f-4972-8929-3a396b1ae8e3",
    "author_id": "0a007636-f5c3-4339-bd2c-6c2436622cd5",
    "content": "Bonjour a toute la communaute ! Premier post sur le mur social de l'Academie.",
    "post_type": "text",
    "image_url": None,
    "video_url": None,
    "created_at": "2025-12-18T16:35:06.522237+00:00",
    "updated_at": "2025-12-18T16:35:06.522245+00:00"
  }
]
    
    # Import all
    await db.pending_members.delete_many({})
    result = await db.pending_members.insert_many(pending_members_data)
    print(f"[OK] pending_members: {len(result.inserted_ids)} documents importes")
    
    await db.orders.delete_many({})
    result = await db.orders.insert_many(orders_data)
    print(f"[OK] orders: {len(result.inserted_ids)} documents importes")
    
    await db.posts.delete_many({})
    result = await db.posts.insert_many(posts_data)
    print(f"[OK] posts: {len(result.inserted_ids)} documents importes")
    
    # Resume final
    print("\n========== RESUME FINAL ==========")
    collections = ["users", "members", "clubs", "products", "technical_directors", "settings", "subscriptions", "events", "leads", "pending_members", "orders", "posts"]
    total = 0
    for coll in collections:
        count = await db[coll].count_documents({})
        total += count
        print(f"  {coll}: {count}")
    print(f"\n  TOTAL: {total} documents")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

