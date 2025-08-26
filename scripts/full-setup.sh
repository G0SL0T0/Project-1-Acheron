#!/bin/bash

echo "🚀 Полная установка и запуск проекта Streaming Platform"
echo "=================================================="

# Проверка наличия необходимых инструментов
check_dependencies() {
    echo "📋 Проверка зависимостей..."
    
    # Проверка Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js не установлен. Пожалуйста, установите Node.js 18+"
        exit 1
    fi
    
    # Проверка pnpm
    if ! command -v pnpm &> /dev/null; then
        echo "❌ pnpm не установлен. Устанавливаю..."
        npm install -g pnpm
    fi
    
    # Проверка Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker не установлен. Пожалуйста, установите Docker"
        exit 1
    fi
    
    # Проверка Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose"
        exit 1
    fi
    
    echo "✅ Все зависимости установлены"
}

# Установка зависимостей
install_dependencies() {
    echo "📦 Установка зависимостей..."
    
    # Установка корневых зависимостей
    pnpm install
    
    # Установка зависимостей для всех пакетов
    pnpm -r install
    
    echo "✅ Зависимости установлены"
}

# Настройка окружения
setup_environment() {
    echo "⚙️ Настройка окружения..."
    
    # Копирование .env.example если .env не существует
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "📝 Файл .env создан. Пожалуйста, отредактируйте его:"
        echo "   - JWT_SECRET"
        echo "   - DATABASE_URL"
        echo "   - FRONTEND_URL"
        echo "   - METRICS_API_KEY"
    fi
    
    # Генерация секретов
    if [ ! -f secrets.json ]; then
        echo "🔐 Генерация секретов..."
        node -e "
        const crypto = require('crypto');
        const secrets = {
            jwtAccessSecret: crypto.randomBytes(64).toString('hex'),
            jwtRefreshSecret: crypto.randomBytes(64).toString('hex'),
            metricsApiKey: crypto.randomBytes(32).toString('hex'),
            encryptionKey: crypto.randomBytes(32).toString('hex'),
            lastRotation: Date.now()
        };
        require('fs').writeFileSync('secrets.json', JSON.stringify(secrets, null, 2));
        "
        echo "✅ Секреты сгенерированы"
    fi
    
    echo "✅ Окружение настроено"
}

# Настройка базы данных
setup_database() {
    echo "🗄️ Настройка базы данных..."
    
    # Запуск Docker контейнеров
    echo "🐳 Запуск Docker контейнеров..."
    docker-compose up -d db redis
    
    # Ожидание готовности базы данных
    echo "⏳ Ожидание готовности базы данных..."
    until docker-compose exec -T db pg_isready -U streaming; do
        sleep 1
    done
    
    # Генерация Prisma клиента
    echo "🔧 Генерация Prisma клиента..."
    cd apps/server
    pnpm prisma generate
    
    # Применение миграций
    echo "📊 Применение миграций..."
    pnpm prisma migrate dev
    
    # Заполнение базы данными
    echo "🌱 Заполнение базы данными..."
    pnpm prisma db seed
    
    cd ../..
    
    echo "✅ База данных настроена"
}

# Сборка проекта
build_project() {
    echo "🏗️ Сборка проекта..."
    
    # Сборка клиента
    echo "📱 Сборка клиента..."
    cd apps/client
    pnpm build
    
    # Сборка сервера
    echo "🔧 Сборка сервера..."
    cd ../server
    pnpm build
    
    cd ../..
    
    echo "✅ Проект собран"
}

# Запуск проекта
start_project() {
    echo "🚀 Запуск проекта..."
    
    # Запуск всех сервисов
    docker-compose up -d
    
    echo "✅ Проект запущен"
    echo ""
    echo "🌐 Доступные сервисы:"
    echo "   - Фронтенд: http://localhost:5173"
    echo "   - Бэкенд: http://localhost:3000"
    echo "   - API документация: http://localhost:3000/api"
    echo "   - Prisma Studio: pnpm prisma:studio (в apps/server)"
    echo ""
    echo "🔑 Тестовые пользователи:"
    echo "   - Администратор: admin@streaming.local / admin123"
    echo "   - Пользователь: user@streaming.local / user123"
    echo "   - Автор: author@streaming.local / author123"
}

# Основной процесс
main() {
    check_dependencies
    install_dependencies
    setup_environment
    setup_database
    build_project
    start_project
    
    echo ""
    echo "🎉 Проект успешно запущен!"
    echo "   Для остановки: docker-compose down"
    echo "   Для перезапуска: docker-compose restart"
}

# Запуск
main