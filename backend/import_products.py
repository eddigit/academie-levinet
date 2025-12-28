"""Import products"""
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
    
    products_data = [
  {
    "name": "Mittens SPK Pro",
    "description": "Mittens de qualite professionnelle pour entrainement Self-Pro Krav. Rembourrage haute densite.",
    "price": 45.0,
    "category": "Mittens",
    "image_url": "https://images.unsplash.com/photo-1583473848882-f9a5bc1a4d8a?w=400",
    "stock": 25,
    "sizes": ["S", "M", "L", "XL"],
    "id": "250fd974-1423-4607-acf0-c1616f53b2fb",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.447396+00:00",
    "updated_at": "2025-12-18T16:47:17.447406+00:00"
  },
  {
    "name": "Mittens Instructeur",
    "description": "Mittens premium pour instructeurs. Double couche de protection.",
    "price": 65.0,
    "category": "Mittens",
    "image_url": "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400",
    "stock": 15,
    "sizes": ["M", "L", "XL"],
    "id": "befbf76b-0c5a-44c6-a580-51a26b765698",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.459176+00:00",
    "updated_at": "2025-12-18T16:47:17.459179+00:00"
  },
  {
    "name": "Gants de Combat MMA",
    "description": "Gants MMA pour sparring. Protection phalanges renforcee.",
    "price": 55.0,
    "category": "Gants de Combat",
    "image_url": "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400",
    "stock": 30,
    "sizes": ["S", "M", "L", "XL"],
    "id": "2a3c16f3-fb1b-4239-ac92-37f39a87e39b",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.459588+00:00",
    "updated_at": "2025-12-18T16:47:17.459590+00:00"
  },
  {
    "name": "Gants Boxe SPK",
    "description": "Gants de boxe officiels Academie Levinet. Cuir veritable, 12oz.",
    "price": 75.0,
    "category": "Gants de Combat",
    "image_url": "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=400",
    "stock": 20,
    "sizes": ["10oz", "12oz", "14oz", "16oz"],
    "id": "c85d31fd-cfa5-4f56-b402-0c0c357afea7",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.459878+00:00",
    "updated_at": "2025-12-18T16:47:17.459880+00:00"
  },
  {
    "name": "Casque Integral Pro",
    "description": "Casque protection integral avec grille. Homologue competition.",
    "price": 89.0,
    "category": "Casques",
    "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    "stock": 12,
    "sizes": ["S", "M", "L", "XL"],
    "id": "de64c655-dd21-40ad-a3d6-b50701b308f6",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.460129+00:00",
    "updated_at": "2025-12-18T16:47:17.460131+00:00"
  },
  {
    "name": "Casque Ouvert",
    "description": "Casque ouvert entrainement, visibilite optimale.",
    "price": 59.0,
    "category": "Casques",
    "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
    "stock": 18,
    "sizes": ["S", "M", "L"],
    "id": "9817945f-d438-44d6-833c-f3b66a9f6e13",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.460350+00:00",
    "updated_at": "2025-12-18T16:47:17.460352+00:00"
  },
  {
    "name": "Coquille Homme Pro",
    "description": "Protection intime masculine de competition. Coque rigide.",
    "price": 35.0,
    "category": "Protections",
    "image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
    "stock": 40,
    "sizes": ["S", "M", "L", "XL"],
    "id": "44ae21fc-4b31-4ed7-8c77-b884ce57e8f7",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.460568+00:00",
    "updated_at": "2025-12-18T16:47:17.460570+00:00"
  },
  {
    "name": "Protege-Tibias",
    "description": "Protege-tibias et cou-de-pied integres. Mousse EVA.",
    "price": 42.0,
    "category": "Protections",
    "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400",
    "stock": 22,
    "sizes": ["S", "M", "L", "XL"],
    "id": "94c45df0-3725-4e58-9e20-77d86f24b3fa",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.460847+00:00",
    "updated_at": "2025-12-18T16:47:17.460849+00:00"
  },
  {
    "name": "Kimono SPK Blanc",
    "description": "Kimono officiel Academie Levinet. Coton 100%, broderie logo.",
    "price": 95.0,
    "category": "Kimonos",
    "image_url": "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400",
    "stock": 35,
    "sizes": ["150", "160", "170", "180", "190"],
    "id": "23b73b86-43fa-4df4-806f-94d0a1f1dead",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.461056+00:00",
    "updated_at": "2025-12-18T16:47:17.461058+00:00"
  },
  {
    "name": "Kimono Instructeur Noir",
    "description": "Kimono noir reserve instructeurs certifies. Broderies or.",
    "price": 145.0,
    "category": "Kimonos",
    "image_url": "https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=400",
    "stock": 10,
    "sizes": ["160", "170", "180", "190"],
    "id": "edfcbbbe-6be1-4f35-952a-fa36cbf5c05d",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.461242+00:00",
    "updated_at": "2025-12-18T16:47:17.461244+00:00"
  },
  {
    "name": "Ceinture Officielle",
    "description": "Ceinture officielle. Toutes couleurs de grades disponibles.",
    "price": 15.0,
    "category": "Accessoires",
    "image_url": "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400",
    "stock": 100,
    "sizes": ["Blanche", "Jaune", "Orange", "Verte", "Bleue", "Marron", "Noire"],
    "id": "add62b08-aed8-45a3-9556-73051d8a3807",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.461428+00:00",
    "updated_at": "2025-12-18T16:47:17.461430+00:00"
  },
  {
    "name": "Sac de Sport SPK",
    "description": "Sac grand format logo Academie. Compartiment chaussures.",
    "price": 49.0,
    "category": "Accessoires",
    "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkmjVCNWHbK4snP7FN4hKf9U76dS5bTRSEtQ&s",
    "stock": 28,
    "sizes": ["Unique"],
    "id": "4976dd3c-88d4-446b-bdde-5bacffe188c5",
    "is_active": True,
    "created_at": "2025-12-18T16:47:17.461621+00:00",
    "updated_at": "2025-12-18T17:02:04.946266+00:00"
  }
]
    
    await db.products.delete_many({})
    result = await db.products.insert_many(products_data)
    print(f"[OK] products: {len(result.inserted_ids)} documents importes")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

