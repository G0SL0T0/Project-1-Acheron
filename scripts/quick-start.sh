#!/bin/bash

echo "🚀 Быстрый запуск проекта..."

# Проверка .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден. Запустите full-setup.sh"
    exit 1
fi

# Запуск Docker контейнеров
docker-compose up -d

# Ожидание готовности
echo "⏳ Ожидание готовности сервисов..."
sleep 10

# Проверка статуса
echo "📊 Статус сервисов:"
docker-compose ps

echo ""
echo "🌐 Проект запущен!"
echo "   Фронтенд: http://localhost:5173"
echo "   Бэкенд: http://localhost:3000"