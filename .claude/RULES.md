# ⛔ RÈGLES DU PROJET - NE PAS MODIFIER CE FICHIER ⛔

## ⚠️ CONFIGURATION CRITIQUE - LIRE AVANT TOUTE ACTION

### Fichiers .env - NE JAMAIS MODIFIER
```
frontend/.env:
  REACT_APP_BACKEND_URL=   ← DOIT ÊTRE VIDE (URLs relatives)
  
backend/.env:
  Port local: 8000
  CORS_ORIGINS=*
```

**⛔ SI CES VALEURS SONT MODIFIÉES, LE LOGIN NE FONCTIONNERA PLUS !**

---

## CONFIGURATION OBLIGATOIRE

### Démarrage Local
- **UN SEUL SCRIPT** : `.\start.ps1`
- **UN SEUL PORT** : `http://localhost:8000`
- **Mode unifié** : Le backend sert le frontend

### Rebuild Frontend
```powershell
cd frontend
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
npm run build
```
Puis relancer `.\start.ps1`

---

## INFORMATIONS OFFICIELLES (VÉRIFIÉES - NE JAMAIS CHANGER)

### Contact
- **Téléphone** : +33698070851
- **Adresse** : Saint Jean de Védas
- **Email** : contact@academie-levinet.com

### Réseaux Sociaux
- **Facebook** : https://www.facebook.com/capitainejacqueslevinet/
- **YouTube** : https://www.youtube.com/@CapitaineJacquesLevinet
- **LinkedIn** : https://www.linkedin.com/in/jacqueslevinet/
- **Twitter/X** : https://x.com/Jacques_LEVINET

---

## STRUCTURE DU PROJET (NE PAS CRÉER DE NOUVEAUX FICHIERS À LA RACINE)

```
academie-levinet/
├── backend/           # API FastAPI Python
├── frontend/          # React App
├── .claude/           # Config agents IA
├── start.ps1          # Démarrage local
├── README.md          # Doc simple
├── Dockerfile         # Déploiement
├── render.yaml        # Config Render
└── vercel.json        # Config Vercel
```

---

## INTERDICTIONS

❌ NE PAS créer de nouveaux fichiers de documentation
❌ NE PAS créer de scripts de démarrage alternatifs
❌ NE PAS modifier les ports (8000 pour tout)
❌ NE PAS dupliquer les fichiers de configuration
❌ NE PAS modifier frontend/.env ou backend/.env
❌ NE PAS changer REACT_APP_BACKEND_URL (doit rester VIDE)

---

## VERSIONING

Chaque build génère automatiquement un timestamp dans `frontend/src/buildInfo.js`
Visible dans le footer du site et dans la console du navigateur.

---

Dernière mise à jour : 28/12/2025 16:35
