# Переходим в корневую директорию проекта
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Setting up development environment..." -ForegroundColor Green

# Проверяем наличие .env.example
if (-not (Test-Path ".env.example")) {
    Write-Host "Error: .env.example file not found in project root!" -ForegroundColor Red
    Write-Host "Please create .env.example file in project root directory" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Copy .env.example if .env doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Please edit the .env file with your settings" -ForegroundColor Cyan
}

# Check Docker installation
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Docker is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop for Windows from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check Docker Compose installation
if (-not (Get-Command "docker-compose" -ErrorAction SilentlyContinue)) {
    # В новых версиях Docker команда может быть docker compose (без дефиса)
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue) -or 
        (-not (docker compose version 2>&1 | Out-String).Contains("Docker Compose"))) {
        Write-Host "Error: Docker Compose is not installed!" -ForegroundColor Red
        Write-Host "Please install Docker Compose or ensure it's included in your Docker installation" -ForegroundColor Yellow
        exit 1
    }
    # Если используется новая команда, создаем псевдоним
    Set-Alias -Name "docker-compose" -Value "docker compose" -Scope Script
}

# Start Docker containers
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
try {
    docker-compose up -d
} catch {
    Write-Host "Error starting Docker containers: $_" -ForegroundColor Red
    Write-Host "Please check if Docker is running and your docker-compose.yml is valid" -ForegroundColor Yellow
    exit 1
}

# Wait for database to be ready
Write-Host "Waiting for database..." -ForegroundColor Yellow
$ready = $false
$attempts = 0
$maxAttempts = 60  # Увеличим время ожидания

while (-not $ready -and $attempts -lt $maxAttempts) {
    try {
        $result = docker-compose exec -T db pg_isready -U streaming
        if ($result -match "accepting connections") {
            $ready = $true
        }
    } catch {
        # Ignore errors, just wait
    }
    Start-Sleep -Seconds 2  # Увеличим интервал ожидания
    $attempts++
    Write-Host "Attempt $attempts/$maxAttempts..." -ForegroundColor Gray
}

if (-not $ready) {
    Write-Host "Database did not become ready within $maxAttempts seconds" -ForegroundColor Red
    Write-Host "Checking container status:" -ForegroundColor Yellow
    docker-compose ps
    exit 1
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
Set-Location "apps/server"
try {
    pnpm prisma generate
} catch {
    Write-Host "Error generating Prisma client: $_" -ForegroundColor Red
    Set-Location $projectRoot
    exit 1
}

# Apply migrations
Write-Host "Applying migrations..." -ForegroundColor Yellow
try {
    pnpm prisma migrate dev
} catch {
    Write-Host "Error applying migrations: $_" -ForegroundColor Red
    Set-Location $projectRoot
    exit 1
}

# Seed database with initial data
Write-Host "Seeding database..." -ForegroundColor Yellow
try {
    pnpm prisma db seed
} catch {
    Write-Host "Error seeding database: $_" -ForegroundColor Red
    Set-Location $projectRoot
    exit 1
}

Set-Location $projectRoot

Write-Host "Setup completed!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "Prisma Studio: Run 'pnpm prisma:studio' in apps/server folder" -ForegroundColor Cyan