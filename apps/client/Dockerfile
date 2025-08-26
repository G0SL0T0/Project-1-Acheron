# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Устанавливаем зависимости
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Копируем исходный код
COPY . .

# Собираем приложение
RUN pnpm build

# Этап продакшена
FROM nginx:alpine

# Копируем сборку
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфиг nginx
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]