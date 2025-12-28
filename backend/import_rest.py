"""Import settings and technical_directors"""
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
    
    # SETTINGS (site_content)
    settings_data = [
  {
    "id": "smtp_settings",
    "from_email": "test@academie-levinet.com",
    "from_name": "Academie Jacques Levinet Test",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_user": "test@gmail.com",
    "updated_at": "2025-12-22T18:49:48.326089+00:00"
  },
  {
    "id": "site_content",
    "about": {
      "title": "A Propos de l'Academie",
      "description": "Depuis plus de 25 ans, l'Academie est specialisee dans la self-defense de rue et la formation professionnelle des forces de l'ordre. Une structure tripartite internationale.",
      "mission": "Unifier les pratiquants de diverses disciplines - Self-Pro Krav, Krav Maga, KAPAP, Canne Defense, Self Feminine - sous une banniere commune d'excellence et d'efficacite.",
      "image": "",
      "stats": {
        "countries": "50+",
        "directors": "50",
        "clubs": "100+",
        "members": "10000+"
      }
    },
    "contact": {
      "email": "contact@academie-levinet.com",
      "phone": "+33 1 48 05 16 10",
      "address": "Paris, France",
      "linkedin": "https://linkedin.com/company/academie-levinet"
    },
    "disciplines": {
      "wkmo": {
        "title": "WKMO",
        "subtitle": "World Krav Maga Organization",
        "description": "Organisation internationale regroupant les pratiquants de Krav Maga et disciplines associees.",
        "image": "",
        "clubs_count": "100"
      },
      "ipc": {
        "title": "IPC",
        "subtitle": "International Police Confederation",
        "description": "Formation professionnelle des forces de l'ordre et certification ROS.",
        "image": ""
      },
      "spk": {
        "title": "Self-Pro Krav",
        "subtitle": "Methode creee par Jacques Levinet",
        "description": "Self-defense realiste et efficace, adaptee a tous.",
        "image": ""
      },
      "sfjl": {
        "title": "Self Feminine",
        "subtitle": "Mesdames, Defendez-vous",
        "description": "Programme specialement concu pour les femmes.",
        "image": ""
      }
    },
    "footer": {
      "tagline": "Academie Jacques Levinet - World Krav Maga Organization - International Police Confederation",
      "copyright": "2025 Academie Jacques Levinet. Tous droits reserves."
    },
    "founder": {
      "name": "Capitaine Jacques LEVINET",
      "title": "Fondateur de l'Academie",
      "grade": "10eme Dan",
      "photo": "",
      "bio": "Champion de France de Karate, 6eme Dan FEKAMT. Officier de Police, expert en techniques d'intervention. Createur du Self-Pro Krav (SPK) et fondateur de la WKMO et de l'IPC.",
      "quote": "J'ai parcouru le monde pour analyser les meilleures techniques de self-defense et d'entrainement policier. Mon objectif : creer des methodes efficaces, realistes et adaptees a la legislation francaise."
    },
    "hero": {
      "title": "ACADEMIE JACQUES LEVINET",
      "subtitle": "L'Excellence en Self-Defense",
      "description": "Depuis plus de 25 ans, l'Academie forme l'elite mondiale de la self-defense. Methodes eprouvees et reconnues internationalement.",
      "cta_text": "Rejoindre l'Academie",
      "cta_link": "/onboarding",
      "video_url": "https://www.youtube.com/embed/mX3cGUHUgKo",
      "background_image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80"
    },
    "images": {
      "logo": "",
      "logo_white": "",
      "favicon": "",
      "og_image": ""
    },
    "international": {
      "title": "Presence Internationale",
      "subtitle": "50+ pays representes",
      "partners": [
        "OMON (Russie)",
        "ROTAM (Bresil)",
        "BOPE (Bresil)",
        "ERIS (France)",
        "GAD (Argentine)",
        "OSTTU (Australie)"
      ],
      "magazine_name": "KRAV MAG AJL",
      "magazine_subtitle": "Le magazine du monde de la self-defense, des sports de combat et des arts martiaux",
      "map_image": ""
    },
    "login": {
      "title": "Connexion",
      "subtitle": "Academie Jacques Levinet",
      "tagline": "L'excellence en self-defense",
      "background_image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80"
    },
    "pedagogy": {
      "title": "Formation & Pedagogie",
      "description": "Supports pedagogiques imprimes et numeriques, videos et PDF telechargeables.",
      "resources_count": "50+",
      "image": ""
    },
    "social_links": {
      "facebook": "https://facebook.com/academielevinet",
      "instagram": "https://instagram.com/academielevinet",
      "youtube": "https://youtube.com/academielevinet",
      "linkedin": "https://linkedin.com/company/academie-levinet"
    },
    "updated_at": "2025-12-22T18:53:11.977429+00:00",
    "updated_by": "cc8aaa1c-c0b1-4d08-9af8-a3a29ab7841f",
    "features": [
      {
        "title": "Self-Defense Realiste",
        "description": "Techniques eprouvees sur le terrain",
        "icon": "shield"
      },
      {
        "title": "Reseau International",
        "description": "Presence dans plus de 30 pays",
        "icon": "globe"
      },
      {
        "title": "Formation Complete",
        "description": "Du debutant a l'instructeur",
        "icon": "award"
      }
    ],
    "testimonials": []
  }
]
    
    # TECHNICAL DIRECTORS
    technical_directors_data = [
  {
    "id": "2a2e2501-8ca6-4e6b-996b-99f9120225c8",
    "name": "Jean Dupont",
    "email": "director_184511@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-14T18:45:11.408166+00:00"
  },
  {
    "id": "1cff031a-27ff-4ab7-9be2-dba8b0cc0139",
    "name": "Jean Dupont Test",
    "email": "jean.dupont.test@example.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-14T18:46:22.907823+00:00"
  },
  {
    "id": "22436ac7-a2a4-4325-87ce-276523bac260",
    "name": "Jean Dupont",
    "email": "director_174237@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-18T17:42:37.579376+00:00"
  },
  {
    "id": "3ced66d9-6a4f-43e2-aef8-a601db614f02",
    "name": "Jean-Pierre Martin",
    "email": "jp.martin@academie-levinet.com",
    "phone": "+33 6 00 00 00 01",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-19T07:12:30.249577+00:00"
  },
  {
    "id": "28b0a3ac-f368-4107-905a-77cd35657f1b",
    "name": "Jean Dupont",
    "email": "director_071946@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-19T07:19:46.083153+00:00"
  },
  {
    "id": "c1086b37-cbe3-410d-b8ab-7830c2e32957",
    "name": "Jean Dupont",
    "email": "director_072014@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-19T07:20:14.841391+00:00"
  },
  {
    "id": "3da4c2e0-cee3-47ea-b9ae-b8b7bf61147d",
    "name": "Jean Dupont",
    "email": "director_145757@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-19T14:57:57.797957+00:00"
  },
  {
    "id": "30b20457-95c3-44a7-b538-c0aca5674b19",
    "name": "Jean Dupont",
    "email": "director_145824@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-19T14:58:24.883361+00:00"
  },
  {
    "id": "240973d4-9aae-47ea-94a7-1ef209d2974b",
    "name": "Jean Dupont",
    "email": "director_145849@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-19T14:58:49.774816+00:00"
  },
  {
    "id": "f8a8a90c-c404-46f6-930a-0070db658614",
    "name": "Jean Dupont",
    "email": "director_220649@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-19T22:06:49.356622+00:00"
  },
  {
    "id": "85daa679-d01a-42f5-8c4d-5ba3e4d59ee3",
    "name": "Jean Dupont",
    "email": "director_220734@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-19T22:07:34.291553+00:00"
  },
  {
    "id": "a8cbca99-9d30-4f6f-bad3-68cc79b40cbf",
    "name": "Jean Dupont",
    "email": "director_221237@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-19T22:12:37.756750+00:00"
  },
  {
    "id": "b7bdaf97-6357-4032-99f2-75eacc07d379",
    "name": "Jean Dupont",
    "email": "director_222233@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-19T22:22:33.934136+00:00"
  },
  {
    "id": "642350f6-b98d-4ef7-985d-c2eadb0a591b",
    "name": "Jean Dupont",
    "email": "director_184947@test.com",
    "phone": "+33123456789",
    "country": "France",
    "city": "Paris",
    "photo": None,
    "members_count": 0,
    "created_at": "2025-12-22T18:49:47.586469+00:00"
  }
]
    
    # Import settings
    await db.settings.delete_many({})
    result = await db.settings.insert_many(settings_data)
    print(f"[OK] settings: {len(result.inserted_ids)} documents importes")
    
    # Import technical_directors
    await db.technical_directors.delete_many({})
    result = await db.technical_directors.insert_many(technical_directors_data)
    print(f"[OK] technical_directors: {len(result.inserted_ids)} documents importes")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

