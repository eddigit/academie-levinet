# 🎯 CONTEXTE PROJET - LIRE EN PREMIER

## État actuel : ✅ FONCTIONNEL

### Démarrage Local
```powershell
.\start.ps1
```
→ http://localhost:8000

### Déploiement Production
- **Backend + Frontend** : Render.com (déploiement auto sur push GitHub)
- **URL** : https://academielevinet.com (domaine personnalisé)
- **URL Render** : https://academie-levinet.onrender.com

---

## ⚠️ CONFIGURATION CRITIQUE - NE JAMAIS TOUCHER

```
frontend/.env:
  REACT_APP_BACKEND_URL=   ← DOIT ÊTRE VIDE (URLs relatives)
  
backend/.env:
  Port local: 8000
  CORS_ORIGINS=*
```

**⛔ SI CES VALEURS SONT MODIFIÉES, LE LOGIN NE FONCTIONNERA PLUS !**

---

## Structure (NE PAS MODIFIER)

```
academie-levinet/
├── backend/           # API FastAPI Python
├── frontend/          # React App  
├── start.ps1          # SEUL script de démarrage
├── Dockerfile         # Pour Render
├── render.yaml        # Config Render
└── .claude/RULES.md   # Règles détaillées
```

---

## Informations Officielles (VÉRIFIÉES)

| Info | Valeur |
|------|--------|
| Téléphone | +33698070851 |
| Adresse | Saint Jean de Védas |
| Facebook | https://www.facebook.com/capitainejacqueslevinet/ |
| YouTube | https://www.youtube.com/@CapitaineJacquesLevinet |
| LinkedIn | https://www.linkedin.com/in/jacqueslevinet/ |
| Twitter/X | https://x.com/Jacques_LEVINET |

---

## Versioning

Chaque build génère un timestamp visible :
- Dans le **footer** du site
- Dans la **console** navigateur (F12)
- Script : `frontend/generate-build-info.js`

---

## ⛔ INTERDICTIONS POUR LES AGENTS IA

1. NE PAS créer de nouveaux fichiers de config/doc à la racine
2. NE PAS changer les ports (8000 local, 8080 Render)
3. NE PAS créer de scripts alternatifs
4. NE PAS modifier frontend/.env ou backend/.env
5. NE PAS changer REACT_APP_BACKEND_URL (doit rester VIDE)
6. TOUJOURS rebuild le frontend avant de tester : `cd frontend; npm run build`

---

## Pour Reconstruire et Tester

```powershell
cd frontend
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
npm run build
cd ..
.\start.ps1
```

---

Dernière mise à jour : 28/12/2025 16:35
