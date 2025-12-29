# INSTRUCTIONS OBLIGATOIRES - LIRE EN PREMIER
# =============================================
# Ce fichier est lu automatiquement par Claude/Cursor/Windsurf

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

## RÈGLES DU PROJET ACADÉMIE LEVINET

### Démarrage Local
```powershell
.\start.ps1
```
→ http://localhost:8000 (PORT UNIQUE, NE PAS CHANGER)

### Rebuild Frontend
```powershell
cd frontend
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
npm run build
cd ..
.\start.ps1
```

### Fichiers Importants
- CONTEXT.md = État complet du projet
- .claude/RULES.md = Règles détaillées
- .github/copilot-instructions.md = Instructions Copilot

### ⛔ INTERDICTIONS ABSOLUES
1. NE PAS changer les ports (8000 local, 8080 Render)
2. NE PAS créer de nouveaux scripts de démarrage
3. NE PAS créer de nouveaux fichiers de doc à la racine
4. NE PAS proposer de "nouvelle architecture"
5. NE PAS modifier frontend/.env ou backend/.env
6. NE PAS changer REACT_APP_BACKEND_URL (doit rester VIDE)

### Infos Officielles
- Tél: +33698070851
- Adresse: Saint Jean de Védas
- Facebook: https://www.facebook.com/capitainejacqueslevinet/
- YouTube: https://www.youtube.com/@CapitaineJacquesLevinet
- LinkedIn: https://www.linkedin.com/in/jacqueslevinet/
- Twitter/X: https://x.com/Jacques_LEVINET
