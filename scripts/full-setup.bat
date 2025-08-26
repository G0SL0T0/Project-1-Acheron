Write-Host "🚀 Full setup and launch of Streaming Platform project" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

function Check-Dependencies {
    Write-Host "📋 Checking dependencies..." -ForegroundColor Yellow
    
    if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Node.js is not installed. Please install Node.js 18+" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
        Write-Host "❌ pnpm is not installed. Installing..." -ForegroundColor Yellow
        npm install -g pnpm
    }
    
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker is not installed. Please install Docker" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Get-Command "docker-compose" -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker Compose is not installed. Please install Docker Compose" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ All dependencies installed" -ForegroundColor Green
}

function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    pnpm install
    pnpm -r install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

function Setup-Environment {
    Write-Host "⚙️ Setting up environment..." -ForegroundColor Yellow
    
    if (-not (Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
        Write-Host "📝 .env file created. Please edit it:" -ForegroundColor Cyan
        Write-Host "   - JWT_SECRET" -ForegroundColor Cyan
        Write-Host "   - DATABASE_URL" -ForegroundColor Cyan
        Write-Host "   - FRONTEND_URL" -ForegroundColor Cyan
        Write-Host "   - METRICS_API_KEY" -ForegroundColor Cyan
    }
    
    if (-not (Test-Path "secrets.json")) {
        Write-Host "🔐 Generating secrets..." -ForegroundColor Yellow
        $secrets = @{
            jwtAccessSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
            jwtRefreshSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
            metricsApiKey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
            encryptionKey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
            lastRotation = [DateTime]::UtcNow.Ticks
        } | ConvertTo-Json -Depth 10
        $secrets | Out-File "secrets.json" -Encoding UTF8
        Write-Host "✅ Secrets generated" -ForegroundColor Green
    }
    
    Write-Host "✅ Environment configured" -ForegroundColor Green
}

function Setup-Database {
    Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
    
    Write-Host "🐳 Starting Docker containers..." -ForegroundColor Yellow
    docker-compose up -d db redis
    
    Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
    $ready = $false
    $attempts = 0
    $maxAttempts = 30
    
    while (-not $ready -and $attempts -lt $maxAttempts) {
        try {
            $result = docker-compose exec -T db pg_isready -U streaming
            if ($result -match "accepting connections") {
                $ready = $true
            }
        } catch {
            # Ignore errors, just wait
        }
        Start-Sleep -Seconds 1
        $attempts++
    }
    
    if (-not $ready) {
        Write-Host "❌ Database did not become ready within $maxAttempts seconds" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
    Set-Location "apps/server"
    pnpm prisma generate
    
    Write-Host "📊 Applying migrations..." -ForegroundColor Yellow
    pnpm prisma migrate dev
    
    Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
    pnpm prisma db seed
    
    Set-Location "../../"
    
    Write-Host "✅ Database configured" -ForegroundColor Green
}

function Build-Project {
    Write-Host "🏗️ Building project..." -ForegroundColor Yellow
    
    Write-Host "📱 Building client..." -ForegroundColor Yellow
    Set-Location "apps/client"
    pnpm build
    
    Write-Host "🔧 Building server..." -ForegroundColor Yellow
    Set-Location "../server"
    pnpm build
    
    Set-Location "../../"
    
    Write-Host "✅ Project built" -ForegroundColor Green
}

function Start-Project {
    Write-Host "🚀 Starting project..." -ForegroundColor Yellow
    
    docker-compose up -d
    
    Write-Host "✅ Project started" -ForegroundColor Green
    Write-Host "" -ForegroundColor White
    Write-Host "🌐 Available services:" -ForegroundColor Cyan
    Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "   - Backend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   - API Docs: http://localhost:3000/api" -ForegroundColor Cyan
    Write-Host "   - Prisma Studio: Run 'pnpm prisma:studio' in apps/server folder" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor White
    Write-Host "🔑 Test users:" -ForegroundColor Cyan
    Write-Host "   - Admin: admin@streaming.local / admin123" -ForegroundColor Cyan
    Write-Host "   - User: user@streaming.local / user123" -ForegroundColor Cyan
    Write-Host "   - Author: author@streaming.local / author123" -ForegroundColor Cyan
}

function Main {
    Check-Dependencies
    Install-Dependencies
    Setup-Environment
    Setup-Database
    Build-Project
    Start-Project
    
    Write-Host "" -ForegroundColor White
    Write-Host "🎉 Project successfully launched!" -ForegroundColor Green
    Write-Host "   To stop: docker-compose down" -ForegroundColor Yellow
    Write-Host "   To restart: docker-compose restart" -ForegroundColor Yellow
}

Main