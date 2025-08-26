Write-Host "🚀 Quick project start..." -ForegroundColor Green

if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Run full-setup.ps1" -ForegroundColor Red
    exit 1
}

docker-compose up -d

Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "📊 Service status:" -ForegroundColor Yellow
docker-compose ps

Write-Host "" -ForegroundColor White
Write-Host "🌐 Project started!" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend: http://localhost:3000" -ForegroundColor Cyan