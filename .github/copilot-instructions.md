# INSTRUCTIONS OBLIGATOIRES POUR TOUS LES AGENTS IA
# ==================================================
# CE FICHIER EST LU AUTOMATIQUEMENT PAR GITHUB COPILOT
# ==================================================

## ⛔ RÈGLES ABSOLUES - NE JAMAIS MODIFIER

### Démarrage Local
- COMMANDE UNIQUE: `.\start.ps1`
- PORT UNIQUE: 8000
- URL: http://localhost:8000

### Structure Projet
- backend/ = API FastAPI Python
- frontend/ = React App
- PAS de nouveaux fichiers à la racine
- PAS de nouveaux scripts de démarrage

### Rebuild Frontend
```powershell
cd frontend
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
npm run build
cd ..
.\start.ps1
```

## Informations Officielles (VÉRIFIÉES - NE PAS CHANGER)

- Téléphone: +33698070851
- Adresse: Saint Jean de Védas
- Facebook: https://www.facebook.com/capitainejacqueslevinet/
- YouTube: https://www.youtube.com/@CapitaineJacquesLevinet
- LinkedIn: https://www.linkedin.com/in/jacqueslevinet/
- Twitter/X: https://x.com/Jacques_LEVINET

## Déploiement
- Render.com (auto-deploy sur push GitHub)
- NE PAS reconfigurer Render
- NE PAS changer les ports (8080 sur Render)

## Fichiers de Référence
- CONTEXT.md = État du projet
- .claude/RULES.md = Règles détaillées
- backend/.env = Config (NE PAS MODIFIER les ports)

## ⚠️ AVANT TOUTE ACTION
1. Lire CONTEXT.md
2. Lire .claude/RULES.md
3. NE PAS créer de nouveaux fichiers de config
4. NE PAS modifier les ports
5. NE PAS proposer de "nouvelle architecture"
