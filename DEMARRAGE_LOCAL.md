# 🚀 Démarrage Local - Académie Levinet

## ⚠️ CONFIGURATION FIXE - NE JAMAIS MODIFIER LES PORTS

**Configuration établie et IMMUABLE :**
- **Frontend** : `http://localhost:3000`
- **Backend** : `http://localhost:8001`

**Fichiers de configuration :**
- `frontend/.env` : `REACT_APP_BACKEND_URL=http://localhost:8001`
- `backend/.env` : `FRONTEND_URL=http://localhost:3000`

**❌ NE JAMAIS utiliser le port 8000 en local !**

---

## ⚡ Démarrage Rapide (2 commandes)

### Étape 1 : Backend (port 8001)
```powershell
.\start-backend.ps1
```

### Étape 2 : Frontend (port 3000)
```powershell
.\start-frontend.ps1
```

**C'est tout !** 🎉

---

## 📍 URLs d'accès

- **Application** : http://localhost:3000
- **API Backend** : http://localhost:8001
- **Documentation API** : http://localhost:8001/docs

---

## 🔧 Configuration

La configuration est dans `backend/.env` :
- `FRONTEND_URL=http://localhost:3000` ✅
- `CORS_ORIGINS=http://localhost:3000,http://localhost:3001` ✅
- Backend écoute sur le port **8001** ✅
- Frontend écoute sur le port **3000** ✅

**⚠️ NE JAMAIS modifier ces ports !**

---

## 🛑 Arrêter les serveurs

Si les ports sont occupés :
```powershell
taskkill /F /IM python.exe
taskkill /F /IM node.exe
```

Puis redémarrer les 2 scripts.

---

## ❌ Ce qu'il NE FAUT PAS faire

1. ❌ **Ne PAS utiliser** `start.ps1` (mode unifié sur port 8000)
2. ❌ **Ne PAS changer** les ports dans le .env
3. ❌ **Ne PAS installer MongoDB** localement (on utilise MongoDB Atlas)

---

## ✅ Points importants

- **MongoDB Atlas** : Le script détecte automatiquement la connexion cloud
- **Hot-reload** : Le frontend se recharge automatiquement à chaque modification
- **Deux terminaux** : Un pour le backend, un pour le frontend

---

## 🔐 Comptes Admin

- **Super Admin** : coachdigitalparis@gmail.com / `$$Reussite888!!`
- **Admin AJL** : ajl.wkmo.ipc@gmail.com / `Admin2025!`
- **Edith** : edith.levinet@gmail.com

---

## 📝 Commandes utiles

### Rebuild complet du frontend
```powershell
cd frontend
Remove-Item -Recurse -Force build
npm run build
```

### Vérifier/créer les utilisateurs admin
```powershell
cd backend
python init_users.py
```

### Forcer le rechargement du navigateur
**Ctrl + Shift + R** (vide le cache)

---

## 🐛 Résolution de problèmes

### Le port 3000 est occupé
```powershell
taskkill /F /IM node.exe
.\start-frontend.ps1
```

### Le port 8001 est occupé
```powershell
taskkill /F /IM python.exe
.\start-backend.ps1
```

### Ancienne version affichée
1. Vider le cache du navigateur (**Ctrl + Shift + R**)
2. Ou rebuilder : `cd frontend && npm run build`

### Backend ne démarre pas
Vérifier que `backend/.env` existe et contient `MONGO_URL` avec MongoDB Atlas

---

## 📦 Déploiement (Vercel)

Le déploiement Vercel fonctionne différemment :
- Frontend servi par Vercel
- Backend sur Render ou autre
- Ports différents en production

**Cette note concerne uniquement le développement local !**
