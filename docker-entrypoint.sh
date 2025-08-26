#!/bin/sh

set -e

# Запускаем миграции базы данных
npx prisma migrate deploy

# Запускаем сиды (только в разработке)
if [ "$NODE_ENV" = "development" ]; then
    npx prisma db seed
fi

# Запускаем приложение
exec node dist/main