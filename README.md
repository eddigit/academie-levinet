# Académie Jacques Levinet

## 🚀 Démarrage Local

```powershell
.\start.ps1
```

L'application sera disponible sur **http://localhost:8000**

## 📁 Structure

```
academie-levinet/
├── backend/          # API Python (FastAPI)
├── frontend/         # Interface React
├── start.ps1         # Script de démarrage
└── README.md         # Ce fichier
```

## ⚙️ Configuration

Le fichier `backend/.env` doit contenir :
```
MONGO_URL=mongodb+srv://...
DB_NAME=academie_levinet_db
JWT_SECRET=votre-secret
```

## 🌐 Déploiement

- **Backend** : Render.com (render.yaml)
- **Frontend** : Vercel (vercel.json)

---
© 2025 Académie Jacques Levinet
