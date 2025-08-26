#!/bin/bash

echo "Очистка проекта."

# Останавливаем и удаляем контейнеры
echo "Остановка Docker контейнеров."
docker-compose down -v

# Удаляем node_modules
echo "Удаление node_modules."
find . -name "node_modules" -type d -exec rm -rf {} +
find . -name ".pnpm-store" -type d -exec rm -rf {} +

# Удаляем сборки
echo "Удаление сборок."
find . -name "dist" -type d -exec rm -rf {} +
find . -name ".next" -type d -exec rm -rf {} +
find . -name ".turbo" -type d -exec rm -rf {} +

# Удаляем кэш
echo "Очистка кэша."
pnpm store prune

echo "Очистка завершена!"