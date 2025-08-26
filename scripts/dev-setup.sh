#!/bin/bash

echo "Настройка окружения для разработки..."

# Устанавливаем зависимости
echo "Установка зависимостей..."
pnpm install

# Копируем .env.example если .env не существует
if [ ! -f .env ]; then
    echo "Создание .env файла..."
    cp .env.example .env
    echo "Пожалуйста, отредактируйте .env файл с вашими настройками"
fi

# Запускаем Docker контейнеры
echo "Запуск Docker контейнеров..."
docker-compose up -d

# Ждем пока база данных будет готова
echo "Ожидание базы данных..."
until docker-compose exec -T db pg_isready -U streaming; do
    sleep 1
done

# Генерируем Prisma клиент
echo "Генерация Prisma клиента..."
cd apps/server
pnpm prisma generate

# Применяем миграции
echo "Применение миграций..."
pnpm prisma migrate dev

# Заполняем базу начальными данными
echo "Заполнение базы данными..."
pnpm prisma db seed

cd ../..

echo "Настройка завершена!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3000"
echo "API Docs: http://localhost:3000/api"
echo "Prisma Studio: pnpm prisma:studio (в apps/server)"