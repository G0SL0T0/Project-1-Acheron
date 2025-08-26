# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Устанавливаем зависимости
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Копируем исходный код
COPY . .

# Генерируем Prisma клиент
RUN npx prisma generate

# Собираем приложение
RUN pnpm build

# Этап продакшена
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Устанавливаем только продакшен зависимости
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Копируем сборку
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Копируем entrypoint скрипт
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

CMD ["docker-entrypoint.sh"]