# Script de démarrage du backend
Write-Host "🚀 Démarrage du backend..." -ForegroundColor Green

# Vérifier si l'environnement virtuel existe
if (-not (Test-Path "backend\venv")) {
    Write-Host "📦 Création de l'environnement virtuel..." -ForegroundColor Yellow
    cd backend
    python -m venv venv
    cd ..
}

# Activer l'environnement virtuel
Write-Host "🔧 Activation de l'environnement virtuel..." -ForegroundColor Yellow
cd backend
.\venv\Scripts\Activate.ps1

# Vérifier si les dépendances sont installées
if (-not (Test-Path "venv\Lib\site-packages\fastapi")) {
    Write-Host "📥 Installation des dépendances..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Skip MongoDB local check if using MongoDB Atlas (cloud)
$envFile = ".env"
$usesMongoDBAtlas = $false
if (Test-Path $envFile) {
    $mongoUrl = Select-String -Path $envFile -Pattern "MONGO_URL" | Select-Object -First 1
    if ($mongoUrl -and $mongoUrl.Line -match "mongodb\+srv") {
        $usesMongoDBAtlas = $true
    }
}

# Vérifier MongoDB seulement si local
if (-not $usesMongoDBAtlas) {
    Write-Host "🔍 Vérification de MongoDB local..." -ForegroundColor Yellow
    $mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if (-not $mongoCheck.TcpTestSucceeded) {
        Write-Host "⚠️  ATTENTION: MongoDB n'est pas accessible sur le port 27017" -ForegroundColor Red
        Write-Host "   Veuillez démarrer MongoDB avant de continuer" -ForegroundColor Red
        Write-Host "   Options:" -ForegroundColor Yellow
        Write-Host "   1. Service Windows: Start-Service MongoDB" -ForegroundColor Yellow
        Write-Host "   2. Docker: docker start mongodb" -ForegroundColor Yellow
        Write-Host "   3. Manuel: mongod --dbpath C:\data\db" -ForegroundColor Yellow
        $continue = Read-Host "Continuer quand même? (o/N)"
        if ($continue -ne "o" -and $continue -ne "O") {
            exit
        }
    }
} else {
    Write-Host "✅ Configuration MongoDB Atlas détectée" -ForegroundColor Green
}

# Démarrer le serveur
Write-Host "✅ Démarrage du serveur backend sur http://localhost:8001" -ForegroundColor Green
Write-Host "📚 Documentation API: http://localhost:8001/docs" -ForegroundColor Cyan
uvicorn server:app --host 0.0.0.0 --port 8001 --reload


