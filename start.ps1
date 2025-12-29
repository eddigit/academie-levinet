# ============================================================================
# 🚀 DÉMARRAGE RAPIDE - Académie Levinet
# Un seul script pour tout lancer !
# ============================================================================

param(
    [switch]$Build,      # Rebuilder le frontend
    [switch]$DevMode     # Mode dev (frontend séparé avec hot-reload)
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           ACADÉMIE LEVINET - Démarrage                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$ROOT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ROOT_DIR

# ============================================================================
# Step 1: Check if MongoDB is needed
# ============================================================================
Write-Host "📋 Vérification de la configuration..." -ForegroundColor Yellow

$envFile = "$ROOT_DIR\backend\.env"
if (-not (Test-Path $envFile)) {
    Write-Host ""
    Write-Host "⚠️  Fichier .env non trouvé!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Créez le fichier backend/.env avec ce contenu minimal:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   MONGO_URL=mongodb://localhost:27017" -ForegroundColor White
    Write-Host "   DB_NAME=academie_levinet_db" -ForegroundColor White
    Write-Host "   JWT_SECRET=dev-secret-key-change-in-production" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou pour MongoDB Atlas (recommandé, gratuit):" -ForegroundColor Yellow
    Write-Host "   MONGO_URL=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/" -ForegroundColor White
    Write-Host ""
    
    # Create a default .env for local dev
    $createDefault = Read-Host "Voulez-vous créer un fichier .env par défaut pour MongoDB local ? (o/n)"
    if ($createDefault -eq "o" -or $createDefault -eq "O" -or $createDefault -eq "oui") {
        @"
MONGO_URL=mongodb://localhost:27017
DB_NAME=academie_levinet_db
JWT_SECRET=dev-secret-key-change-in-production
CORS_ORIGINS=*
"@ | Out-File -FilePath $envFile -Encoding UTF8
        Write-Host "✅ Fichier .env créé!" -ForegroundColor Green
    } else {
        Write-Host "Créez le fichier .env et relancez ce script." -ForegroundColor Yellow
        exit 1
    }
}

# ============================================================================
# Step 2: Build frontend if needed
# ============================================================================
$frontendBuild = "$ROOT_DIR\frontend\build"

if ($Build -or -not (Test-Path $frontendBuild)) {
    Write-Host ""
    Write-Host "📦 Construction du frontend..." -ForegroundColor Yellow
    
    Set-Location "$ROOT_DIR\frontend"
    
    # Install deps if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "   → Installation des dépendances npm..." -ForegroundColor Gray
        npm install
    }
    
    # Build
    Write-Host "   → Compilation React..." -ForegroundColor Gray
    $env:CI = "false"
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors du build!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Frontend compilé!" -ForegroundColor Green
    Set-Location $ROOT_DIR
}

# ============================================================================
# Step 3: Activate Python venv
# ============================================================================
Write-Host ""
Write-Host "🐍 Activation de l'environnement Python..." -ForegroundColor Yellow

$venvPath = "$ROOT_DIR\backend\venv"
if (Test-Path "$venvPath\Scripts\Activate.ps1") {
    & "$venvPath\Scripts\Activate.ps1"
    Write-Host "✅ Environnement virtuel activé" -ForegroundColor Green
} else {
    Write-Host "⚠️  Pas d'environnement virtuel trouvé, utilisation du Python système" -ForegroundColor Yellow
}

# ============================================================================
# Step 4: Start the server
# ============================================================================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           🚀 DÉMARRAGE DU SERVEUR                              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

if ($DevMode) {
    # Dev mode: start backend and frontend separately
    Write-Host "Mode développement: Backend + Frontend séparés" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    
    # Start backend in background
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT_DIR\backend'; uvicorn server:app --reload --port 8000"
    
    # Start frontend
    Set-Location "$ROOT_DIR\frontend"
    $env:REACT_APP_BACKEND_URL = "http://localhost:8000"
    npm start
} else {
    # Unified mode: backend serves frontend
    Write-Host "Mode unifié: Backend sert le frontend" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Application: http://localhost:8000" -ForegroundColor White
    Write-Host "   API Docs:    http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Gray
    Write-Host ""
    
    Set-Location "$ROOT_DIR\backend"
    uvicorn server:app --reload --port 8000
}

