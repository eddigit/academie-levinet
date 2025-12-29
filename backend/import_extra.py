"""Import messages, conversations, chat_history, payment_transactions, user_activity"""
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
    
    # MESSAGES
    messages_data = [
  {
    "id": "37c4a03c-b0ea-4867-b689-cbdf17f193ca",
    "conversation_id": "9aab67cd-32e7-4f1a-a13c-ac392ee278b9",
    "sender_id": "7b1345cb-9698-4878-a83d-6a58ccf05974",
    "sender_name": "Admin Levinet",
    "content": "Bonjour Jean, bienvenue a l'Academie Jacques Levinet!",
    "read": False,
    "created_at": "2025-12-15T13:36:18.360915+00:00"
  }
]
    
    # CONVERSATIONS
    conversations_data = [
  {
    "id": "9aab67cd-32e7-4f1a-a13c-ac392ee278b9",
    "participants": [
      "7b1345cb-9698-4878-a83d-6a58ccf05974",
      "9bfb8d94-4a72-4d48-9786-00fa6bb081ca"
    ],
    "participant_names": [
      "Admin Levinet",
      "Jean Dupont"
    ],
    "last_message": "Bonjour Jean, bienvenue a l'Academie Jacques Levinet!",
    "last_message_at": "2025-12-15T13:36:18.379301+00:00",
    "last_sender_id": "7b1345cb-9698-4878-a83d-6a58ccf05974",
    "created_at": "2025-12-15T13:36:18.229698+00:00",
    "updated_at": "2025-12-15T13:36:18.379314+00:00"
  }
]
    
    # CHAT_HISTORY
    chat_history_data = [
  {
    "id": "5057c328-d54b-49e7-a2fe-28e33be7fe90",
    "session_id": "22604f7e-f263-4942-9731-f0965067136e",
    "type": "visitor",
    "user_message": "Qu'est-ce que le SPK ?",
    "assistant_response": "Le SPK, ou Self-Pro Krav, est une methode de self-defense realiste et efficace, developpee par Jacques Levinet, un expert avec plus de 40 ans d'experience.",
    "created_at": "2025-12-19T10:59:26.281545+00:00"
  },
  {
    "id": "25808678-ed13-4431-9e9d-0aa5ca9d538e",
    "session_id": "member_96c06f3a-df55-4d38-be9c-f7c1fc18916b",
    "type": "member",
    "user_id": "96c06f3a-df55-4d38-be9c-f7c1fc18916b",
    "user_message": "Comment modifier mon profil ?",
    "assistant_response": "Pour modifier votre profil, rendez-vous sur la section Mon Profil.",
    "created_at": "2025-12-19T10:59:56.639756+00:00"
  }
]
    
    # PAYMENT_TRANSACTIONS
    payment_transactions_data = [
  {"id": "79f38bcb-8aaf-4f09-95bc-506eb760c242", "session_id": "cs_test_a1VNuwUVIAJw2a8VCdk0QQz91UfXJCdKBu4X0nFDZQCZCZXFPXPZ9fdJpj", "type": "membership", "package_id": "licence", "package_name": "Licence Membre", "user_id": "90001eb3-a8a3-415d-9c4c-842838e77364", "amount": 35.0, "currency": "eur", "status": "pending", "created_at": "2025-12-18T17:40:22.781067+00:00", "updated_at": "2025-12-18T17:40:22.781078+00:00"},
  {"id": "48dbcd58-a27b-42ab-9508-3b0f6dd6304d", "session_id": "cs_test_a1us3F3ne6qqwnQxfzd2dFBM9J0ODSU85XKztubXjg3qxB63erujcyWqiV", "type": "membership", "package_id": "licence", "package_name": "Licence Membre", "user_id": "3f6327f7-ebc6-43e0-8c98-7daebd594ccc", "amount": 35.0, "currency": "eur", "status": "pending", "created_at": "2025-12-18T17:43:16.525012+00:00", "updated_at": "2025-12-18T17:43:16.525024+00:00"},
  {"id": "ff7d91f2-9ee5-4e8d-938d-fc8d2205a7a9", "session_id": "cs_test_a1I4OO1G6po0tswK6uJqjSlvQre15YMWJs6cQV1JplCIX1FcKWYLMpLXkG", "type": "membership", "package_id": "licence", "package_name": "Licence Membre", "user_id": "b5e77c0e-1528-482b-9138-e7297874dee6", "amount": 35.0, "currency": "eur", "status": "pending", "created_at": "2025-12-18T17:45:13.518352+00:00", "updated_at": "2025-12-18T17:45:13.518363+00:00"},
  {"id": "01c2f7b8-13e3-4425-adcc-a0c8da489611", "session_id": "cs_test_a15KjJAyBk9pqQ2WE6LWIH23SrRTlBYM08ZM87jHblZKRDr1XD2GNsuon6", "type": "membership", "package_id": "licence", "package_name": "Licence Membre", "user_id": "fefc031b-5cf8-4c64-a69c-cfd49506437d", "amount": 35.0, "currency": "eur", "status": "pending", "created_at": "2025-12-18T17:48:54.543972+00:00", "updated_at": "2025-12-18T17:48:54.543983+00:00"}
]
    
    # USER_ACTIVITY
    user_activity_data = [
  {"user_id": "0a007636-f5c3-4339-bd2c-6c2436622cd5", "last_active": "2025-12-18T17:21:55.563001+00:00"},
  {"user_id": "7b1345cb-9698-4878-a83d-6a58ccf05974", "last_active": "2025-12-22T10:12:36.910081+00:00"},
  {"user_id": "96c06f3a-df55-4d38-be9c-f7c1fc18916b", "last_active": "2025-12-19T10:59:50.176105+00:00"},
  {"user_id": "fefc031b-5cf8-4c64-a69c-cfd49506437d", "last_active": "2025-12-22T19:46:51.029809+00:00"},
  {"user_id": "bf699ee9-1ada-4f12-b318-a47bfd0ffa7a", "last_active": "2025-12-19T23:41:38.820072+00:00"},
  {"user_id": "cc8aaa1c-c0b1-4d08-9af8-a3a29ab7841f", "last_active": "2025-12-22T21:29:45.932563+00:00"}
]
    
    # Import all
    await db.messages.delete_many({})
    result = await db.messages.insert_many(messages_data)
    print(f"[OK] messages: {len(result.inserted_ids)} documents importes")
    
    await db.conversations.delete_many({})
    result = await db.conversations.insert_many(conversations_data)
    print(f"[OK] conversations: {len(result.inserted_ids)} documents importes")
    
    await db.chat_history.delete_many({})
    result = await db.chat_history.insert_many(chat_history_data)
    print(f"[OK] chat_history: {len(result.inserted_ids)} documents importes")
    
    await db.payment_transactions.delete_many({})
    result = await db.payment_transactions.insert_many(payment_transactions_data)
    print(f"[OK] payment_transactions: {len(result.inserted_ids)} documents importes")
    
    await db.user_activity.delete_many({})
    result = await db.user_activity.insert_many(user_activity_data)
    print(f"[OK] user_activity: {len(result.inserted_ids)} documents importes")
    
    # Resume final complet
    print("\n========== RESUME FINAL COMPLET ==========")
    collections = await db.list_collection_names()
    total = 0
    for coll in sorted(collections):
        count = await db[coll].count_documents({})
        total += count
        print(f"  {coll}: {count}")
    print(f"\n  TOTAL: {total} documents dans {len(collections)} collections")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

