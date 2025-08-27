# Стрим площадка

 ![](/api/attachments.redirect?id=6d2ee583-b465-49ed-95f4-bd77f29d445c "aspect=1")

  

 ![](/api/attachments.redirect?id=0cb082ea-dd55-4c6a-af3f-422948030eea "aspect=1|||border")

 ![](/api/attachments.redirect?id=41f0a9b6-22fb-41e6-b312-a94afc90f581 "aspect=1")

 ![](/api/attachments.redirect?id=954490cc-4e9d-4ad9-9c49-b9998ea9ceda "aspect=1")

# Декомпозиция задач — чек‑листы v1

 

> Использование: проходи группы сверху вниз. В каждой группе есть маленькие задачи‑чекбоксы, **DoD (Definition of Done)** — критерии готовности, и зависимости. Отмечай прогресс галочками.


  

### **✅ Что добавили(общее):**

| Путь | Изменение | Пояснение |
|----|----|----|
| ```javascript
apps/server/prisma/schema.prisma
``` | ✅ Обновлено | Добавлена модель OAuthAccount и обновлена User |
| ```javascript
apps/server/prisma/migrations/.../add_oauth.sql
``` | ✅ Новый | Миграция для OAuth таблиц и nullable password |
| ```javascript
packages/database/src/index.ts
``` | ✅ Обновлено | Типы OAuth и утилиты для работы |
| ```javascript
.env.example
``` | ✅ Обновлено | Добавлены переменные для Google и Yandex OAuth |
| ```javascript
apps/server/src/auth/strategies/google.strategy.ts
``` | ✅ Новый | Стратегия для Google OAuth |
| ```javascript
apps/server/src/auth/strategies/yandex.strategy.ts
``` | ✅ Новый | Стратегия для Yandex OAuth |
| ```javascript
apps/server/src/auth/auth.module.ts
``` | ✅ Обновлено | Добавлены OAuth стратегии |
| ```javascript
apps/server/src/auth/auth.controller.ts
``` | ✅ Обновлено | Эндпоинты для OAuth |
| ```javascript
apps/client/src/features/auth/components/OAuthButtons.tsx
``` | ✅ Новый | Компонент кнопок OAuth |
| ```javascript
apps/client/src/features/auth/hooks/useOAuth.ts
``` | ✅ Новый | Хук для OAuth авторизации |
| ```javascript
apps/client/src/pages/auth/OAuthCallback.tsx
``` | ✅ Новый | Страница обработки OAuth callback |

### **✅ Реализованные меры безопасности:**

| Компонент | Файл | Описание |
|----|----|----|
| Шифрование БД | ```javascript
prisma/schema.prisma
``` | Шифрование email, 2FA, аудит безопасности |
| Защита от brute-force | ```javascript
throttler.guard.ts
``` | Ограничение попыток входа |
| Безопасные JWT | ```javascript
jwt.service.ts
``` | Access/refresh токены с разным сроком действия |
| OAuth защита | ```javascript
oauth.service.ts
``` | State параметр, валидация redirect_uri |
| HTTP заголовки | ```javascript
helmet.middleware.ts
``` | CSP, XSS, CSRF защита |
| SQL инъекции | ```javascript
sql-injection.pipe.ts
``` | Фильтрация входящих данных |
| HTTPS | ```javascript
https.config.ts
``` | Настройка безопасного соединения |

  

  

### **✅ Реализованные компоненты:**

| Уровень | Компонент | Файл | Описание |
|----|----|----|----|
| Quick Wins | Unix-сокет PostgreSQL | ```javascript
docker-compose.yml
``` | Скрытие БД за Unix-сокетом |
| Quick Wins | Read-only реплика | ```javascript
docker-compose.yml
``` | Отдельная реплика для аналитики |
| Quick Wins | Ротация секретов | ```javascript
secret-rotation.service.ts
``` | Автоматическая смена секретов |
| Advanced | RLS | ```javascript
20231101000003_rls.sql
``` | Row Level Security |
| Advanced | Short-lived JWT | ```javascript
advanced-jwt.service.ts
``` | Короткие токены + cookie-pair |
| Advanced | DAST | ```javascript
dast.service.ts
``` | Динамическое тестирование безопасности |
| Paranoid | TDE | ```javascript
docker-compose.yml
``` | Прозрачное шифрование данных |
| Paranoid | SQL Firewall | ```javascript
sql-firewall.service.ts
``` | Фаервол для SQL запросов |
| Paranoid | Signed SQL | ```javascript
signed-sql.service.ts
``` | Подписанные prepared statements |
| Paranoid | HSM | ```javascript
hsm-service.ts
``` | Аппаратный модуль безопасности |

  

### **✅ Реализованные компоненты:**

| Компонент | Файл | Описание |
|----|----|----|
| Logging Service | ```javascript
logging.service.ts
``` | Основной сервис для логирования всех операций |
| Logs Gateway | ```javascript
logs.gateway.ts
``` | WebSocket шлюз для реального времени |
| Logs Controller | ```javascript
logs.controller.ts
``` | REST API для управления логами |
| Logging Middleware | ```javascript
logging.middleware.ts
``` | Автоматическое логирование HTTP запросов |
| Logs Dashboard | ```javascript
LogsDashboard.tsx
``` | Интерфейс для просмотра логов |
| useLogs Hook | ```javascript
useLogs.ts
``` | Хук для работы с логами на клиенте |

### **✅ Реализованные компоненты:**

| Компонент | Файл | Описание |
|----|----|----|
| Token Service | ```javascript
token.service.ts
``` | Расширенная работа с JWT, ротация, отзыв |
| Enhanced RBAC | ```javascript
enhanced-roles.guard.ts
``` | Проверка ролей в БД, логирование |
| Metrics Protection | ```javascript
metrics-protection.middleware.ts
``` | Защита Prometheus/Grafana |
| Advanced WAF | ```javascript
advanced-waf.middleware.ts
``` | Комплексная защита от атак |
| SSR Protection | ```javascript
ssr-protection.middleware.ts
``` | Предотвращение утечек данных |
| Enhanced Prisma | ```javascript
enhanced-prisma.service.ts
``` | Безопасный ORM, мониторинг пула |
| Monitoring Service | ```javascript
monitoring.service.ts
``` | Сбор метрик безопасности |
| Metrics Dashboard | ```javascript
MetricsDashboard.tsx
``` | Визуализация метрик на клиенте |

  

### **✅ Реализованная система режимов:**

| Компонент | Файл | Описание |
|----|----|----|
| Типы режимов | ```javascript
performance.ts
``` | Определение типов и настроек |
| Провайдер | ```javascript
PerformanceModeProvider.tsx
``` | Управление режимами и сохранение |
| Хук | ```javascript
usePerformanceMode.ts
``` | Удобный доступ к настройкам |
| Компонент-переключатель | ```javascript
PerformanceSwitch.tsx
``` | Условный рендеринг |
| Настройки | ```javascript
PerformanceSettings.tsx
``` | UI для переключения режимов |
| Глобальные стили | ```javascript
performance.css
``` | CSS для разных режимов |
| Пример использования | ```javascript
StreamCard.tsx
``` | Демонстрация условного рендеринга |

  

  

### **✅ Серверная часть:**

| Файл | Изменения | Описание |
|----|----|----|
| ```javascript
app.module.ts
``` | ✅ Обновлен | Добавлены все сервисы безопасности и мониторинга |
| ```javascript
auth.module.ts
``` | ✅ Обновлен | Добавлены новые стратегии и сервисы аутентификации |
| ```javascript
prisma.module.ts
``` | ✅ Обновлен | Добавлен EnhancedPrismaService |
| ```javascript
common.module.ts
``` | ✅ Новый | Модуль для общих сервисов |
| ```javascript
main.ts
``` | ✅ Обновлен | Добавлена инициализация сервисов и HTTPS |

### **✅ Клиентская часть:**

| Файл | Изменения | Описание |
|----|----|----|
| ```javascript
main.tsx
``` | ✅ Обновлен | Добавлены все провайдеры |
| ```javascript
App.tsx
``` | ✅ Обновлен | Добавлены маршруты для мониторинга и настроек |
| ```javascript
components/index.ts
``` | ✅ Новый | Централизованный экспорт компонентов |
| ```javascript
features/index.ts
``` | ✅ Новый | Централизованный экспорт фич |
| ```javascript
hooks/index.ts
``` | ✅ Новый | Централизованный экспорт хуков |
| ```javascript
providers/index.ts
``` | ✅ Новый | Централизованный экспорт провайдеров |
| ```javascript
pages/index.ts
``` | ✅ Новый | Централизованный экспорт страниц |
| ```javascript
services/index.ts
``` | ✅ Новый | Централизованный экспорт сервисов |

### **✅ Пакеты:**

| Пакет | Изменения | Описание |
|----|----|----|
| ```javascript
types/index.ts
``` | ✅ Обновлен | Добавлены все необходимые типы |
| ```javascript
utils/index.ts
``` | ✅ Обновлен | Добавлены утилиты для безопасности и работы с данными |
| ```javascript
constants/index.ts
``` | ✅ Обновлен | Добавлены все константы проекта |

  

### **✅ Клиентские страницы:**

- **Главная страница** - с hero секцией, возможностями и популярными стримами
- **Страница стрима** - с плеером, чатом, донатами и информацией о стримере
- **Страница профиля** - с редактированием, статистикой и настройками

### **✅ Система блокировки:**

- **LockdownService** - основная логика блокировки
- **LockdownController** - API для управления блокировкой
- **LockdownControl** - интерфейс администратора
- **LockdownMiddleware** - middleware для проверки доступа


## **🚫 ОБЯЗАТЕЛЬНЫЕ ФАЙЛЫ (нужно создать)**

### **🎨 Клиент: Базовые компоненты и стили**

| Примерный путь | Пояснение |
|----|----|
| ```javascript
src/styles/tokens/tokens.css
``` | **Обязательно!** CSS-переменные для дизайн-системы (цвета, типографика, радиусы) |
| ```javascript
src/styles/themes/minimal.css
``` | **Обязательно!** Тема "Минимал" - переопределение токенов |
| ```javascript
src/styles/themes/classic.css
``` | **Обязательно!** Тема "Классика" - переопределение токенов |
| ```javascript
src/styles/global/global.css
``` | **Обязательно!** Глобальные стили (сброс, базовые стили) |
| ```javascript
src/components/ui/Button.tsx
``` | **Обязательно!** Базовая кнопка с поддержкой тем |
| ```javascript
src/components/ui/Input.tsx
``` | **Обязательно!** Базовое поле ввода с валидацией |
| ```javascript
src/components/layout/Header.tsx
``` | **Обязательно!** Шапка сайта с навигацией и поиском |
| ```javascript
src/components/layout/Footer.tsx
``` | **Обязательно!** Подвал сайта |
| ```javascript
src/components/ui/LoadingSpinner.tsx
``` | **Обязательно!** Индикатор загрузки для Suspense |

### **🎨 Клиент: Провайдеры состояния**

| Примерный путь | Пояснение |
|----|----|
| ```javascript
src/app/providers/ThemeProvider.tsx
``` | **Обязательно!** Провайдер тем с localStorage |
| ```javascript
src/features/auth/providers/AuthProvider.tsx
``` | **Обязательно!** Провайдер аутентификации с JWT |
| ```javascript
src/stores/appStore.ts
``` | **Обязательно!** Глобальное состояние приложения (Zustand) |

### **🎨 Клиент: Страницы роутинга**

| Примерный путь | Пояснение |
|----|----|
| ```javascript
src/pages/home/HomePage.tsx
``` | **Обязательно!** Главная страница с контентом |
| ```javascript
src/pages/stream/StreamPage.tsx
``` | **Обязательно!** Страница стрима с плеером и чатом |
| ```javascript
src/pages/profile/ProfilePage.tsx
``` | **Обязательно!** Страница профиля пользователя |
| ```javascript
src/pages/interactive/InteractivePage.tsx
``` | **Обязательно!** Страница интерактивов |
| ```javascript
src/pages/author/AuthorPage.tsx
``` | **Обязательно!** Страница автора (витрина) |

### **🎨 Клиент: Фичи (базовые)**

| Примерный путь | Пояснение |
|----|----|
| ```javascript
src/features/auth/components/LoginForm.tsx
``` | **Обязательно!** Форма входа с email/пароль |
| ```javascript
src/features/auth/components/RegisterForm.tsx
``` | **Обязательно!** Форма регистрации |
| ```javascript
src/features/auth/hooks/useAuth.ts
``` | **Обязательно!** Хук для работы с аутентификацией |
| ```javascript
src/features/auth/services/authService.ts
``` | **Обязательно!** Сервис для API запросов аутентификации |
| ```javascript
src/features/auth/components/AuthGuard.tsx
``` | **Обязательно!** Защита маршрутов требующих авторизации |
| ```javascript
src/features/streaming/components/StreamPlayer.tsx
``` | **Обязательно!** HLS.js плеер для стримов |
| ```javascript
src/features/streaming/hooks/useStream.ts
``` | **Обязательно!** Хук для получения данных стрима |
| ```javascript
src/features/chat/components/ChatWindow.tsx
``` | **Обязательно!** Окно чата с WebSocket |
| ```javascript
src/features/chat/hooks/useChat.ts
``` | **Обязательно!** Хук для работы с чатом |
| ```javascript
src/features/themes/components/ThemeSwitcher.tsx
``` | **Обязательно!** Переключатель тем |

### **⚙️ Сервер: Модули и DTO**

| Примерный путь | Пояснение |
|----|----|
| ```javascript
src/auth/auth.module.ts
``` | **Обязательно!** Модуль аутентификации |
| ```javascript
src/auth/auth.controller.ts
``` | **Обязательно!** Контроллер для /auth эндпоинтов |
| ```javascript
src/auth/auth.service.ts
``` | **Обязательно!** Сервис с логикой аутентификации |
| ```javascript
src/auth/dto/login.dto.ts
``` | **Обязательно!** DTO для входа (email, пароль) |
| ```javascript
src/auth/dto/register.dto.ts
``` | **Обязательно!** DTO для регистрации |
| ```javascript
src/auth/strategies/jwt.strategy.ts
``` | **Обязательно!** Стратегия для JWT токенов |
| ```javascript
src/users/users.module.ts
``` | **Обязательно!** Модуль пользователей |
| ```javascript
src/users/users.service.ts
``` | **Обязательно!** Сервис для работы с пользователями |
| ```javascript
src/streaming/streaming.module.ts
``` | **Обязательно!** Модуль стриминга |
| ```javascript
src/streaming/streaming.controller.ts
``` | **Обязательно!** Контроллер для стримов |
| ```javascript
src/streaming/streaming.service.ts
``` | **Обязательно!** Сервис для управления стримами |
| ```javascript
src/chat/chat.module.ts
``` | **Обязательно!** Модуль чата |
| ```javascript
src/chat/chat.gateway.ts
``` | **Обязательно!** WebSocket шлюз для чата |
| ```javascript
src/chat/chat.service.ts
``` | **Обязательно!** Сервис для логики чата |

### **⚙️ Сервер: Общие модули**

| Примерный путь | Пояснение |
|----|----|
| ```javascript
src/prisma/prisma.module.ts
``` | **Обязательно!** Модуль для работы с Prisma |
| ```javascript
src/prisma/prisma.service.ts
``` | **Обязательно!** Сервис Prisma для подключения к БД |
| ```javascript
src/common/filters/all-exceptions.filter.ts
``` | **Обязательно!** Глобальный фильтр ошибок |
| ```javascript
src/common/interceptors/transform.interceptor.ts
``` | **Обязательно!** Интерсептор для унификации ответов API |
| ```javascript
src/common/health/health.controller.ts
``` | **Обязательно!** Контроллер для health checks |

### **🗄️ База данных**

| Примерный путь | Пояснение |
|----|----|
| ```javascript
apps/server/prisma/migrations/20231101000000_init/migration.sql
``` | **Обязательно!** Первая миграция с созданием таблиц |
| ```javascript
apps/server/prisma/seeds/seed.ts
``` | **Обязательно!** Начальные данные (пользователи, темы) |

### **📦 Общие пакеты**

| Примерный путь | Пояснение |
|----|----|
| ```javascript
packages/types/src/auth.ts
``` | **Обязательно!** Типы для аутентификации (User, LoginDto) |
| ```javascript
packages/types/src/streaming.ts
``` | **Обязательно!** Типы для стриминга (Stream, StreamStatus) |
| ```javascript
packages/types/src/chat.ts
``` | **Обязательно!** Типы для чата (Message, ChatEvent) |
| ```javascript
packages/utils/src/crypto.ts
``` | **Обязательно!** Утилиты для хэширования и шифрования |
| ```javascript
packages/constants/src/auth.ts
``` | **Обязательно!** Константы для аутентификации |
| ```javascript
packages/validation/src/auth.schema.ts
``` | **Обязательно!** Zod схемы для валидации |

### **🌐 Документация**

| Примерный путь | Пояснение |
|----|----|
| ```javascript
docs/api/README.md
``` | **Обязательно!** Документация API с примерами запросов |
| ```javascript
docs/components/README.md
``` | **Обязательно!** Документация компонентов с примерами |
| ```javascript
docs/guides/development.md
``` | **Обязательно!** Руководство для разработчиков |


  



### Стек:

  

## **Фронтенд**

1. **Основной фреймворк**: **React 18+** с **TypeScript**
   - Почему: Отличная экосистема, сильная типизация для сложного проекта, множество готовых решений
2. **State-менеджмент**: **Redux Toolkit**
   - Почему: Zustand проще и менее многословен, Redux Toolkit имеет мощные DevTools
3. **Стилизация и дизайн-система**:
   - **Styled Components** или **Emotion** для компонентного подхода
   - **CSS Variables** для токенов дизайна (как указано в вашем проекте)
   - **Storybook** для документации и тестирования компонентов
4. **UI-библиотека**: **Chakra UI** или **MUI (Material-UI)**
   - Почему: Обе хорошо работают с темами и токенами, имеют готовые компоненты
5. **Пакетный менеджер и сборка**: **Vite** + **pnpm**
   - Почему: Быстрая сборка и разработка, эффективное управление зависимостями
6. **Для работы с формами**: **React Hook Form** + **Zod** для валидации
7. **Для работы с API**: **TanStack Query (React Query)**
   - Почему: Отлично управляет кэшированием, состоянием загрузки и ошибками

## **Бэкенд**

1. **Основной язык**: **Node.js** с **TypeScript**
   - Почему: Единый язык на фронтенде и бэкенде, хорошая производительность для I/O-операций
2. **Фреймворк**: **NestJS**
   - Почему: NestJS предоставляет структуру для сложных приложений, Fastify - высокая производительность
3. **Аутентификация**:
   - **JWT** (access + refresh токены)
   - **Passport.js** с стратегиями для OAuth (Google, Steam, Discord)
   - **bcrypt** или **argon2** для хэширования паролей
4. **WebSocket**: **Socket.IO** или **ws**
   - Почему: Socket.IO проще в использовании с fallback-механизмами
5. **Валидация данных**: **Zod** или **Joi**
   - Почему: Строгая валидация схем данных на входе/выходе
6. **Очереди задач**: **BullMQ** (на основе Redis)
   - Почему: Для обработки фоновых задач (отправка email, обработка донатов и т.д.)

## **База данных**

1. **Основная СУБД**: **PostgreSQL 15+**
   - Почему: Надежность, поддержка JSONB для гибких данных, мощные индексы
2. **ORM**: **Prisma** или **Drizzle ORM**
   - Почему: Строгая типизация, автоматические миграции, отличная документация
3. **Кэширование и сессии**: **Redis**
   - Почему: Быстрое хранение сессий, кэширование данных, поддержка очередей
4. **Для поиска**: **Elasticsearch** или **Meilisearch**
   - Почему: Полнотекстовый поиск по контенту, чату и т.д.

## **Инфраструктура и DevOps**

1. **Контейнеризация**: **Docker** + **Docker Compose** (для локальной разработки)
   - Почему: Унификация окружений, как указано в вашем "Быстром старте"
2. **CI/CD**: **GitHub Actions** или **GitLab CI**
   - Почему: Интеграция с репозиторием, автоматизация тестирования и развертывания
3. **Облачное хранилище**:  (для локальной разработки)
   - Почему: Для хранения аватаров, медиафайлов и экспортированных тем
4. **Мониторинг**: **Prometheus** + **Grafana**
   - Почему: Сбор метрик и визуализация производительности системы

## **Специализированные сервисы**

1. **Стриминг**: **Nginx with RTMP module** или **OvenMediaEngine (OME)**
   - Почему: Как указано в вашем проекте, для приема и обработки RTMP-потоков
2. **Транскодинг**: **FFmpeg**
   - Почему: Для конвертации видео в различные форматы и качества
3. **Платежи**: **Stripe** (с sandbox-режимом для разработки)
   - Почему: Простая интеграция, поддержка различных методов оплаты
4. **Feature flags**: **Flagsmith** или **LaunchDarkly**
   - Почему: Для управления функциональностью, как указано в вашем проекте
5. **Логирование**: **Winston** (для Node.js) + **ELK Stack** (Elasticsearch, Logstash, Kibana)
   - Почему: Централизованное сбор и анализ логов

  

---

## Этап 0 - Подготовка к заливке фундамента

- [x] Продумывание и реализация архитектуры (под масштабирование)


🏗️ Архитектура проекта "Декомпозиция задач — чек‑листы v1"

🌐 Общая структура системы

├── 🖥️ Клиент (Frontend) - React + TypeScript

├── ⚙️ Сервер (Backend) - NestJS + TypeScript

├── 🗄️ База данных - PostgreSQL

├── 💾 Кэш - Redis

├── 📡 RTMP-сервер - Nginx-RTMP/OME

├── 💳 Платежи - Stripe (sandbox)

├── 🔐 OAuth - Google/Steam/Discord

└── 📦 Хранилище - ?

📁 Структура клиентской части (apps/client/src)

├── 🎨 styles/                    # Стили и темы

│   ├── tokens/                   # CSS-переменные (цвета, типографика)

│   ├── themes/                   # Файлы тем (minimal.css, classic.css)

│   └── global/                   # Глобальные стили

│

├── 🧩 components/                # Переиспользуемые компоненты

│   ├── ui/                       # Базовые UI-элементы (Button, Input)

│   ├── layout/                   # Компоненты лейаута (Header, Footer)

│   └── forms/                    # Компоненты форм

│

├── 🔧 features/                  # Фичи (основная логика)

│   ├── auth/                     # Авторизация

│   │   ├── components/           # LoginForm, RegisterForm

│   │   ├── hooks/                # useAuth, useLogin

│   │   ├── services/             # authService

│   │   ├── store/                # authStore

│   │   └── types/                # Auth types

│   │

│   ├── themes/                   # Темы оформления

│   │   ├── components/           # ThemeSwitcher, ThemeCustomizer

│   │   ├── hooks/                # useTheme

│   │   ├── services/             # themesService

│   │   ├── store/                # themesStore

│   │   └── utils/                # Утилиты тем

│   │

│   ├── streaming/                # Стриминг

│   │   ├── components/           # StreamPlayer, StreamControls

│   │   ├── hooks/                # useStream

│   │   ├── services/             # streamingService

│   │   └── types/                # Stream types

│   │

│   ├── chat/                     # Чат

│   │   ├── components/           # ChatWindow, MessageList

│   │   ├── hooks/                # useChat

│   │   ├── services/             # chatService (WebSocket)

│   │   ├── store/                # chatStore

│   │   └── utils/                # Фильтрация мата

│   │

│   ├── donations/                # Донаты

│   │   ├── components/           # DonationForm, DonationAlert

│   │   ├── hooks/                # useDonations

│   │   ├── services/             # donationsService

│   │   └── types/                # Donation types

│   │

│   ├── economy/                  # Экономика

│   │   ├── components/           # Wallet, TransactionHistory

│   │   ├── hooks/                # useWallet

│   │   ├── services/             # economyService

│   │   └── types/                # Economy types

│   │

│   ├── games/                    # Мини-игры

│   │   ├── roulette/             # Рулетка

│   │   │   ├── components/       # RouletteWheel

│   │   │   ├── hooks/            # useRoulette

│   │   │   ├── services/         # rouletteService

│   │   │   └── types/            # Roulette types

│   │   │

│   │   └── quiz/                 # Квиз

│   │       ├── components/       # QuizComponent

│   │       ├── hooks/            # useQuiz

│   │       ├── services/         # quizService

│   │       └── types/            # Quiz types

│   │

│   ├── inventory/                # Инвентарь

│   │   ├── components/           # InventoryGrid, ItemCard

│   │   ├── hooks/                # useInventory

│   │   ├── services/             # inventoryService

│   │   └── types/                # Item types

│   │

│   └── shop/                     # Магазин

│       ├── components/           # ShopCatalog, ProductCard

│       ├── hooks/                # useShop

│       ├── services/             # shopService

│       └── types/                # Shop types

│

├── 📄 pages/                     # Страницы роутинга

│   ├── home/                     # Главная страница

│   ├── stream/                   # Страница стрима

│   ├── profile/                  # Страница профиля

│   ├── interactive/              # Страница интерактива

│   └── author/                   # Страница автора

│

├── 🔗 hooks/                     # Глобальные хуки (useApi, useLocalStorage)

├── 🌐 services/                  # Глобальные сервисы (apiService)

├── 📦 stores/                    # Глобальные состояния (appStore)

├── 🔧 utils/                     # Утилиты (formatDate, debounce)

├── 🎭 app/                       # Корневые компоненты

│   ├── layout/                   # Общие лейауты

│   └── providers/                # Провайдеры контекста

│

└── 📄 public/                    # Статические файлы

📁 Структура серверной части (apps/server/src)

├── 🔐 auth/                      # Модуль авторизации

│   ├── dto/                      # DTO (LoginDto, RegisterDto)

│   ├── strategies/               # Стратегии (JwtStrategy, GoogleStrategy)

│   ├── guards/                   # Guards (JwtGuard)

│   ├── controllers/              # AuthController

│   ├── services/                 # AuthService

│   └── entities/                 # User entity

│

├── 👤 users/                     # Модуль пользователей

│   ├── controllers/              # UserController

│   ├── services/                 # UserService

│   └── entities/                 # User entity

│

├── 📋 profiles/                  # Модуль профилей

│   ├── dto/                      # ProfileDto

│   ├── controllers/              # ProfileController

│   ├── services/                 # ProfileService

│   └── entities/                 # Profile entity

│

├── 📺 streaming/                 # Модуль стриминга

│   ├── dto/                      # StreamDto

│   ├── controllers/              # StreamController

│   ├── services/                 # StreamService

│   ├── entities/                 # Stream entity

│   └── utils/                    # RTMP/HLS утилиты

│

├── 💬 chat/                      # Модуль чата

│   ├── dto/                      # MessageDto

│   ├── controllers/              # ChatController

│   ├── services/                 # ChatService

│   ├── entities/                 # Message entity

│   ├── gateways/                 # WebSocket gateways

│   └── events/                   # Chat events

│

├── 💰 donations/                 # Модуль донатов

│   ├── dto/                      # DonationDto

│   ├── controllers/              # DonationController

│   ├── services/                 # DonationService

│   └── entities/                 # Donation entity

│

├── 🎨 themes/                    # Модуль тем

│   ├── dto/                      # ThemeDto

│   ├── controllers/              # ThemeController

│   ├── services/                 # ThemeService

│   └── entities/                 # Theme entity

│

├── 🛒 shop/                      # Модуль магазина

│   ├── dto/                      # ProductDto

│   ├── controllers/              # ShopController

│   ├── services/                 # ShopService

│   └── entities/                 # Product entity

│

├── 💸 economy/                   # Модуль экономики

│   ├── dto/                      # TransactionDto

│   ├── controllers/              # EconomyController

│   ├── services/                 # EconomyService

│   ├── entities/                 # Transaction, Wallet entities

│   └── jobs/                     # Задачи (начисление валюты)

│

├── 🎮 games/                     # Модуль игр

│   ├── roulette/                 # Рулетка

│   │   ├── dto/                  # RouletteDto

│   │   ├── controllers/          # RouletteController

│   │   ├── services/             # RouletteService

│   │   └── entities/             # Roulette entities

│   │

│   └── quiz/                    # Квиз

│       ├── dto/                  # QuizDto

│       ├── controllers/          # QuizController

│       ├── services/             # QuizService

│       └── entities/             # Quiz entities

│

├── 🎒 inventory/                 # Модуль инвентаря

│   ├── dto/                      # ItemDto

│   ├── controllers/              # InventoryController

│   ├── services/                 # InventoryService

│   └── entities/                 # Item, UserItem entities

│

├── 💳 payments/                  # Модуль платежей

│   ├── dto/                      # PaymentDto

│   ├── controllers/              # PaymentController

│   ├── services/                 # PaymentService

│   └── entities/                 # Payment entity

│

├── 🔌 plugins/                   # Модуль плагинов

│   ├── dto/                      # PluginDto

│   ├── controllers/              # PluginController

│   ├── services/                 # PluginService

│   ├── entities/                 # Plugin entity

│   └── sandbox/                  # Песочница для плагинов

│

├── 🌐 websockets/                # WebSocket модуль

│   ├── gateways/                 # Базовые gateways

│   └── adapters/                 # Socket.IO адаптеры

│

├── 🔧 common/                    # Общие модули

│   ├── decorators/               # Кастомные декораторы

│   ├── filters/                  # Фильтры ошибок

│   ├── interceptors/             # Перехватчики

│   └── pipes/                    # Валидационные pipes

│

├── 🗄️ prisma/                    # База данных

│   ├── migrations/               # Миграции

│   └── seeds/                    # Начальные данные

│

└── ⚙️ config/                    # Конфигурации

    ├── app.config.ts             # Основная конфигурация

    ├── database.config.ts        # Конфигурация БД

    └── auth.config.ts            # Конфигурация аутентификации

📦 Общие пакеты (packages)

├── 📝 types/                     # Общие типы TypeScript

│   ├── auth.ts                  # Типы авторизации

│   ├── user.ts                  # Типы пользователя

│   ├── streaming.ts             # Типы стриминга

│   ├── chat.ts                  # Типы чата

│   └── economy.ts               # Типы экономики

│

├── 🔧 utils/                     # Общие утилиты

│   ├── crypto.ts                # Крипто-функции

│   ├── validation.ts            # Валидация

│   └── date.ts                  # Работа с датами

│

├── 🔢 constants/                 # Константы

│   ├── auth.ts                  # Константы авторизации

│   ├── economy.ts               # Константы экономики

│   └── themes.ts                # Константы тем

│

└── ✅ validation/                # Схемы валидации

    ├── auth.schema.ts            # Схемы авторизации

    ├── user.schema.ts            # Схемы пользователя

    └── economy.schema.ts         # Схемы экономики

🐳 Инфраструктура

├── docker/                      # Docker конфиги

│   ├── nginx/                   # Nginx конфиги

│   └── rtmp/                    # RTMP конфиги

│

├── .github/                     # CI/CD

│   └── workflows/               # GitHub Actions

│

├── scripts/                     # Сборочные скрипты

├── docs/                        # Документация

│   ├── api/                     # Документация API

│   ├── components/              # Документация компонентов

│   └── guides/                  # Руководства

│

├── docker-compose.yml           # Docker Compose

├── package.json                 # Корневой package.json

├── pnpm-workspace.yaml          # Workspace конфиг

└── README.md                    # Основная документация

### 1) Страницы с правильным расположением блоков

- [ ] Страница главного экрана
- [ ] Страница стрима (чат и описание)
- [ ] Страница интерактива
- [ ] Страница пользователя - описание автора +работы
- [ ] Страница


## Этап 1 — Базовый фундамент (MVP)

 

### 1) Дизайн‑система и темы (база)

 

- [ ]  **Токены темы**: цвета, типографика, радиусы, тени, интервалы (CSS variables).
- [ ]  **2 базовые темы**: *Минимал* и *Классика* (корневые переменные + light/dark).
- [ ]  **Переключатель темы** (UI + сохранение в localStorage/профиле).
- [ ]  **Импорт/экспорт пресета темы** (JSON файл, валидация схемы).

Темы: оптимизированные (компактные + расширенные высоко производительные) - переключение (по умолчанию лайт тема, при переключении записывается на пользователя + куки)

- [ ]  **Док‑страница** с примерами компонентов (кнопки, карточки, таблицы).
   **DoD:** темы переключаются без перезагрузки, пресет можно экспортировать и импортировать, все стандартные компоненты берут стили из токенов.

 Идея на постоянную смену “дырок“ ссылок на следующие странички. - Процедурная генерация сайта. (переключаемая - по умолчанию обычная генерация сайта)


### Немного про дизайн

Шрифты которые я бы добавил:
1) [Widock Trial](https://fonts-online.ru/fonts/widock-trial)  

2) [Flatiron](https://fonts-online.ru/fonts/flatiron)  

3) [Raimei Hakke](https://fonts-online.ru/fonts/raimei-hakke)  

4) [Stage Wander](https://fonts-online.ru/fonts/stage-wander)  

5) [Drei Fraktur](https://fonts-online.ru/fonts/drei-fraktur)  

### режим “по умолчанию“

1 - Имеет максимально производительный стиль, загружается первый и по умолчанию при подключении к сайту (в куки записывается “какой стиль предпочитаете?” - если же записи нет, то выводится диалоговое окно которое и дает выбор (эконом (рекомендуется для телефонов или офисных пк / ноутбуков) / дизайн (Рекомендуется для получения максимально приятного пользовательского опыта) )

### режим “pro”

1 - Каждая кнопка в режиме “Pro“ имеет черную обводку и черный цвет шрифта “название“, внутри кнопки светлые оттенки (кнопки и элементы темы с прямыми углами, без скруглений) - при наведении шрифт меняется на [Lyno Jean](https://fonts-online.ru/fonts/lyno-jean) - так же с интервалом в 30 секунд шрифт меняется на противоположный (шрифт меняется плавно) в этом случае при наведении так же становится [Lyno Jean](https://fonts-online.ru/fonts/lyno-jean). При наведении на любую кнопку “высвечивается таймер“ (от 3 часов, до 20 часов) - как долго эта кнопка будет действовать. -Таймер запускается когда эту кнопку впервые использовали. (фронт отправляет: кнопка n / x найдена и бэк запускает таймер - записывая значения начала + кнопки в БД) - Получается вармхолы - только интерфейсные.

- Добавить микро-анимации при появлении таймера (плавное появление, легкая пульсация)


- Реализовать эффект "мерцания" для кнопок, срок действия которых истекает

Так же нужно продумать какие кнопки стоит трогать, а какие нет. для генерации.

2 - При зажатии ЛКМ - курсор создает портал на заднем фоне (\~1 сек) и исчезает в нем. Перемещаясь "в подпространственном измерении" - как только пользователь отпускает "ЛКМ" - курсор опять создает портал и выскакивает из него - портал возникает уже в другом месте.

  

#### **1. Портал курсор + хамелеон курсор**

| Описание | Двойной режим курсора:

- **Хамелеон**: меняет цвет на инверсный при наведении на темные элементы
- **Портал**: при зажатии ЛКМ создает портал, исчезает, перемещается "в подпространстве", появляется в новой точке при отпускании | | Зависимости | Базовая система тем, обработка событий курсора | | **DoD** | ✅ Курсор динамически меняет цвет при наведении на элементы с темным фоном
  ✅ При зажатии ЛКМ создается анимированный портал в точке нажатия
  ✅ Курсор исчезает в портале, перемещается "невидимо", появляется в новой точке при отпускании
  ✅ Портал имеет визуальный эффект "всасывания" и "выброса"
  ✅ Эффект работает во всех разделах сайта |

---

#### **2. Матрица символов по пробелу**

| Описание | При зажатии пробела весь текст превращается в "шифровку" (Matrix-style):

- Случайные символы (латиница, цифры, иероглифы)
- Эффект "падающих символов" как в фильме "Матрица"
- При отпускании пробела текст восстанавливается с эффектом "дешифровки" | | Зависимости | Обработка текстовых блоков, анимации символов | | **DoD** | ✅ При зажатии пробела весь текст заменяется на случайные символы
  ✅ Символы имеют анимацию "падения" сверху вниз
  ✅ Цвет символов: классический зеленый (#0F0) или черно-белый (в зависимости от темы)
  ✅ При отпускании пробела текст плавно восстанавливается с эффектом "сборки" из символов
  ✅ Эффект работает для всего текстового контента на странице |

---

#### **3. Кастомное меню по ПКМ + переключатель тем**

| Описание | При нажатии ПКМ появляется кастомное контекстное меню:

- **Действия**: копировать, поделиться, добавить в избранное
- **Настройки**: переключатель "Pro" ↔ "Классика"
- **Визуал**: черно-белое, с анимацией появления из точки клика | | Зависимости | Система тем, обработка контекстных событий | | **DoD** | ✅ ПКМ вызывает кастомное меню вместо стандартного браузерного
  ✅ Меню содержит пункты: копировать, поделиться, избранное, настройки
  ✅ В настройках есть переключатель "Pro" / "Классика" с мгновенным применением
  ✅ Меню появляется с анимацией "раскрытия" из точки клика
  ✅ При клике вне области меню плавно закрывается
  ✅ Переключение тем сохраняется в localStorage и профиле пользователя |

---

#### **4. Гравитация курсора**

| Описание | Курсор ведет себя как "миниатюрная черная звезда":

- При движении рядом с текстом (буквами) создает эффект притяжения
- Буквы слегка "отклоняются" к курсору на фиксированное расстояние (5-10px)
- Эффект затухает при удалении курсора | | Зависимости | Работа с текстовыми элементами, физика движения | | **DoD** | ✅ При движении курсора рядом с текстом буквы притягиваются к нему
  ✅ Величина отклонения фиксирована (например, 8px)
  ✅ Эффект имеет плавную анимацию притяжения/отталкивания
  ✅ Работает для всех текстовых элементов на странице
  ✅ Не влияет на интерактивность элементов (кнопки, ссылки остаются кликабельными) |

#### **5. Предсказывающие подсказки + обучение**

| Описание | Интеллектуальная система подсказок:

- **Предсказание**: в меню профиля/настроек показывает "призрачные" дубли следующих экранов
- **Обучение**: интерактивные подсказки для новых функций
- **Запоминание**: прогресс обучения сохраняется в cookies и БД, чтобы не повторяться | | Зависимости | Аналитика действий пользователя, система подсказок, база данных | | **DoD** | ✅ В меню профиля/настроек появляются "призрачные" превью следующих экранов
  ✅ Система обучения показывает интерактивные подсказки для новых функций
  ✅ Прогресс обучения сохраняется:
  - В cookies для быстрого доступа
  - В БД для синхронизации между устройствами
    ✅ Подсказки не повторяются для пользователей, прошедших обучение
    ✅ Есть возможность сбросить прогресс обучения в настройках

 

### **🚀 Будущие функции** 

---

#### **6. Метеоритный донат**

| Описание | Анимированный эффект отправки доната:

- Донат падает сверху как метеор с хвостом из искр
- При "столкновении" с интерфейсом возникает взрыв конфетти
- Для крупных сумм: метеор оставляет кратер, который медленно "затягивается" | | Зависимости | Система донатов, анимации частиц, физика столкновений | | **DoD** | ✅ Донат имеет анимацию падения метеорита с хвостом искр
  ✅ При достижении цели (кнопка доната) возникает взрыв конфетти
  ✅ Для донатов > $100 метеор оставляет кратер с эффектом "затягивания"
  ✅ Эффект синхронизирован с реальной отправкой доната
  ✅ Работает на всех страницах с возможностью доната |


 

### Немного про процедурную генерацию

Генерация присутствует на главном сайте - каждый модуль / компонент имеет 3 своих копии, только с другими стилями. Каждый модуль может накладываться на другой модуль при этом каждую кнопку можно перемещать - в пределах контейнера. (контейнеры, слайд бары, шапки, подвалы - еще продумываются и это может корректироваться). Контейнеры меняют положение - “как это удобней сделать -через дублирование или через ts смену css стилей?“.

При начале генерации - все кнопки заблюрены (текст на кнопке) - на них черненькие квадратики серых / полу серых и черноватых оттенков - нестатическим полем (для каждой кнопки свое x / y поле). При наведении: вместо таймера (или вместе с ним) выплывает подсказка - примерный путь (куда ведет кнопка): “Похоже эта кнопка ведет в какой то модуль профиля“, “Одна из страниц подписок“, “Страничка сайта - только какая?“. И каждая подсказка имеет % подсказки - показывают насколько подсказка может дать точный ответ.

Каждый контейнер и кнопки в нем пользователь может перемещать по полю (контейнеры заменять друг другом или “уменьшать / увеличивать одну из сторон“ - реализация css через ts и динамическое изменение каждого из блоков.


  

### **Ключевые принципы**

1. **Минимализм в деталях:** Чем сложнее эффект, тем важнее оптимизация.
2. **Цикличность:** Все анимации должны быть зациклены или иметь плавное завершение.
3. **Контраст:** В черно-белой палитре используйте градации серого и резкие переходы для акцентов.
4. **Интерактивность:** Медиа должны реагировать на действия пользователя в реальном времени (без задержек).

  

### **📋 Дополнительные требования ко всем функциям**

| Параметр | Требование |
|----|----|
| **Производительность** | Все эффекты не должны снижать FPS ниже 50 на средних устройствах |
| **Адаптивность** | Корректная работа на десктопе и планшетах (на мобильных упрощенные версии) |
| **Доступность** | Возможность отключить все эффекты в настройках для людей с вестибулярными расстройствами |
| **Тестирование** | Проверка в Chrome, Firefox, Safari, Edge |
| **Логирование** | Фиксация использования эффектов в аналитике для оптимизации |

### 2) Шапка сайта (Header)

 

- [ ]  **Компонент №1 — Общий стиль**: лого/название, адаптивная сетка (desktop/tablet/mobile).
- [ ]  **Импорт/экспорт текстур/фонового узора** для шапки (загрузка → превью → сохранение в теме; дефолтный стиль).
- [ ]  **Компонент №2 — Слайд‑меню** (off‑canvas): навигация, поддержка смены стилей, импорт/экспорт фоновой текстуры + дефолт.
- [ ]  **Компонент №3 — Поиск** (UI + заглушка API GET /search?q=).
- [ ]  **Компонент №4 — Переключатель роли** *Автор/Пользователь* (UI, индикатор текущей роли).
   **DoD:** на всех брейкпоинтах header стабилен, текстуры подхватываются из темы, меню открывается/закрывается с анимацией, роль визуально меняется.

 

### 3) Авторизация и роли

 

- [ ]  Email‑регистрация/логин (форма, ошибки, подтверждение почты — mock, можно без отправки).
- [ ]  OAuth: Google/Steam/Discord (кнопки + серверные заглушки).
- [ ]  Сессии: JWT access + refresh; логаут; авто‑обновление токена.
- [ ]  2FA (TOTP) — отложить флагом; хранение секретов.
- [ ]  Роли: флаги пользователя + UI‑переключатель.
   **DoD:** я могу зарегистрироваться, войти/выйти, переключить роль; защищённые роуты не доступны без токена.

 

### 4) Профиль пользователя

 

- [ ]  Бэкенд: GET/PUT /profiles/me (ник, био, соцсети, язык/часовой пояс).
- [ ]  Загрузка аватара (обрезка, S3/хранилище, ссылка в профиле).
- [ ]  UI: страница «Профиль» с предпросмотром.
- [ ]  Настройки приватности (минимум: показать/скрыть соцсети).
   **DoD:** профиль редактируется, аватар грузится и отображается, настройки сохраняются.
- [ ]  

### 5) Потоковое ядро

 

- [ ]  Ingest: RTMP‑вход (Nginx‑RTMP/OME) + ключ стрима у автора.
- [ ]  Транскодер: профили 720p/480p, HLS/LL‑HLS манифест.
- [ ]  Плеер: HLS.js, авто‑выбор качества, mute‑autoplay, fallback постер.
- [ ]  Страница стрима: статус (офлайн/онлайн), заголовок, категория.
   **DoD:** автор видит ключ, может отправить RTMP, зритель смотрит LL‑HLS с автокачеством; офлайн‑страница корректна.

 

### 6) Чат (активный)

 

- [ ]  WebSocket‑шлюз: chat.join, chat.message, chat.moderate.
- [ ]  Схема сообщений (id, user, text, ts, meta), фильтр нецензурной лексики (базовый).
- [ ]  Режимы: slow‑mode, only‑subs (заглушка статуса подписки), таймаут/мут/бан.
- [ ]  UI: список, ввод, эмодзи, хайлайт ответов автора.
   **DoD:** пользователи видят сообщения в реальном времени, модерация работает, спам ограничен.

 

### 7) Донаты (прямые)

 

- [ ]  Платёжный mock‑провайдер (sandbox): POST /donations.
- [ ]  Формы доната: сумма, сообщение; TTS (флагом).
- [ ]  Алерты в оверлее плеера (slot top‑overlay).
- [ ]  История донатов автора.
   **DoD:** донат создаёт запись, алерт появляется в оверлее, автор видит историю.

 

### 8) Страница автора (витрина)

 

- [ ]  Шапка автора: обложка, аватар, кнопки «Подписаться», «Донат».
- [ ]  Блоки: расписание, архив (VOD/клипы — заглушки данных).
- [ ]  Блок достижений (пустой список на этом этапе).
   **DoD:** у автора есть публичная витрина, основные блоки отображаются, ссылки работают.

 

---

 

## Этап 2 — Расширение функционала (V1)

 

### 9) Пассивный чат / сообщество

 

- [ ]  Треды: posts + comments (CRUD, пагинация).
- [ ]  Режим «анонсы» автора (role‑gate: только автор может постить).
- [ ]  Голосования: poll.create, poll.vote (без мошенничества — по пользователю).
   **DoD:** вне эфира можно вести обсуждения, автор публикует анонсы, опросы считают голоса.

 

### 10) Подписки и цели

 

- [ ]  Подписки уровней (Bronze/Silver/Gold) — фича‑флаги перков.
- [ ]  Цели стрима: goal.create, прогресс от донатов/активности.
- [ ]  Отображение целей в оверлее/панели.
   **DoD:** можно оформить подписку (sandbox), цели растут от событий, перки учитываются в UI.

 

### 11) Мини‑игры (база)

 

**Рулетка (косметика):**

 

- [ ]  Коммит‑ревил: сервер генерирует сид → коммит; при спине публикует ревил + вычислимый результат.
- [ ]  Таблица шансов, пустые «денежные» призы запрещены.
- [ ]  UI рулетки + лог выигрышей.
   **Квиз (ручной):**
- [ ]  CRUD вопросов (текст, варианты, правильный).
- [ ]  Раунды/очки, лидерборд.
   **DoD:** рулетка честная и повторяемая, квиз начисляет очки, результаты логируются.

 

### 12) Система предметов (инвентарь, хэш)

 

- [ ]  Схема items: id, kind, rarity, meta.
- [ ]  **Хэш предмета**: hash = SHA256(issuerId|itemId|serial|meta).
- [ ]  Лимитированный выпуск: editions.total, editions.minted.
- [ ]  Инвентарь: user_items (назначение, списание, журнал событий).
- [ ]  Источники: выдача из рулетки/квизов/покупки.
- [ ]  UI: инвентарь в профиле, предпросмотр косметики.
   **DoD:** предметы имеют уникальные хэши и серийные номера, лимиты соблюдаются, инвентарь показывает актуальные владения.

 

### 13) Валюта сайта (soft)

 

- [ ]  Модель кошелька: balances (available, locked), журнал ledger с двусторонними проводками.
- [ ]  **Заработок:** действия (просмотр, чат, победы в квизе, креатив автора) → события → начисления по таблице тарифов.
- [ ]  **Траты:** покупки косметики, участие в играх, донаты авторам.
- [ ]  Антифрод: дневные капы, скоринг, защита от ботов.
- [ ]  UI кошелька: баланс, история операций, фильтры.
   **DoD:** операции проходят через журнал, балансы сходятся, начисления и списания прозрачны в истории.

 

### 14) Темы (расширенные) — «Аркада»

 

- [ ]  Анимационные пресеты (частицы/неон/звуки) с выключателем «пониженной насыщенности».
- [ ]  Производительность: ленивые эффекты, деградация на слабых устройствах.
   **DoD:** тема переключается, FPS стабильный, можно убрать анимации одним кликом.
- [ ]  

---

 

## Этап 3 — Глубокая интеграция

 

### 15) Магазин предметов и тем

 

- [ ]  Каталог: фильтры по редкости, сериям, авторам.
- [ ]  Карточка товара: превью, supply, хэш‑шаблон.
- [ ]  Покупка за валюту: чек‑аут, списание, выдача предмета.
- [ ]  Квитанция: запись в purchases + подпись сервера (proof).
   **DoD:** товар покупается, supply уменьшается, предмет появляется в инвентаре, квитанция доступна.

 

### 16) Платные плагины/виджеты

 

- [ ]  Manifest: id, name, slots, permissions, settingsSchema, price.
- [ ]  Песочница исполнения (iframe + postMessage, CSP, rate‑limits).
- [ ]  Маркетплейс: покупка лицензии, проверка «entitlement» при подключении.
   **DoD:** сторонний виджет ставится автором, настройки сохраняются, лицензия проверяется.
- [ ]  

### 17) Продвинутая экономика

 

- [ ]  Разделение валют (реальные: руб / доллар / евро / и т.д.) и игровые (коин / клик / и т.д.), так же игровые валюты делятся на (выводные и не выводные)
- [ ] Балансировка: таблица доходов (earn) и расходов (sink), сезонные модификаторы.
- [ ]  Отчёты: графики притока/оттока, активные пользователи, инфляция валюты.
- [ ]  Механики дефицита: сезонные предметы, восстановление запасов, сгорание токенов.
   **DoD:** есть дашборд метрик, можно оперативно менять коэффициенты без релиза.
- [ ]  

### 18) Платные мини‑игры (валюта сайта)

 

- [ ]  Кейсы/аркады: таблицы выпадений, визуал открытия.
- [ ]  Честность: публичные сиды, проверка результата пользователем.
- [ ]  Соответствие правилам: 18+, без вывода денег, предупреждения.
   **DoD:** игра оплачивается внутренней валютой, результаты проверяемы, логи событий полные.
- [ ] Кликер - мини игра, при просмотре стримов - начисляется пассивный “клик“, все клики каждый месяц начисляются на “не выводной счет”-архив. При купленной подписке “genius“ - клики можно конвертировать в “коины“. При покупке подписки - не выводной валютой (снятие с 65% комиссией). При покупке подписки - выводной валютой (снятие с 5% комиссией).
- [ ] Игра стран: Выигрыш: понижение комиссии на вывод всему региону.

 

---

 

## Этап 4 — Монетизация платформы (в конце)

 

### 19) Покупка валюты за реальные деньги

 

- [ ] Пополнение баланса можно обычной валютой (руб / евр / дол) - но при этом их можно только “пожертвовать“ авторам на контент (такие пожертвования облагаются 0,5% комиссионных). А так же эту валюту можно сконвертировать в “коины” облагается 1% комиссионных (рефералам 0,5% - приглашенному - 0,5%) 
- [ ] Разделение и отслеживание выводной и не выводной валюты (подумать про внедрение криптовалюты и отслеживание “коинов“ - выводной / не выводной.
- [ ] Интеграция PSP (sandbox), валюты/НДС, чарджбеки, вебхуки.
- [ ]  Лимиты и KYC по необходимости (страны/возраст).
   **DoD:** покупка за деньги увеличивает баланс, есть квитанции и возвраты.
- [ ] Вывод “коинов” в удобную валюту для авторов (руб. евр. доллары) -Комиссия (1%)
- [ ] Регулярное / активное участие - комиссия на вывод - 1%(при выводной валюте), остальным - 14%, -не выводная валюта (при пожертвовании автору - комиссия - 65%).
- [ ] Комиссия на вывод для не РФ пользователей: +5% / +26% (Китай / Япония / Корея - комиссия как у РФ) (6% - регулярный автор с активными зрителями 1 час на 70+ сообщений / 40% - для пользователей не РФ) - не РФ пользователь записывается на аккаунт - неснимаемое клеймо. (снятие стоит 1000$ -  переводом на иностранный счет “комментарий к платежу“: ([никнейм], Collection fee. +[никнейм “если перевод на несколько аккаунтов“],[никнейм “если перевод на несколько аккаунтов“])

 

### 20) Комиссии и планы Premium/Pro

 

- [ ]  Комиссия маркетплейса (процент с продаж предметов/плагинов).
- [ ]  **Premium (зритель):** буст заработка, эксклюзивные темы.
- [ ]  **Pro (автор):** доп. слоты виджетов, расширенная аналитика.
   **DoD:** планы покупаются, перки активны/деактивируются при окончании.
- [ ] Подписка “genius" - доступ к мини играм для заработка и вывода на счет (\~390 руб / 5$ и т.д.)
- [ ] Подписка “stonks“ - вывод / ввод без комиссии площадке (пригласитель в любом случае получает 0,5% от пополнения) (1900 руб. / 90$ и т.д.)

 

### 20.1) Рефералы

- [ ] Реферальные ссылки.
- [ ] Конвертация валют в “коины“ - 1% обычным - 0,5 / 0,5 % рефералам.
- [ ] (выслуга лет на площадке) - Начисление не выводных “коинов“.
- [ ] (Выслуга лет за подписку) - Месячные подписки на 7% дешевле ( от 1 до 3 лет), 11% ( от 3 до 6 лет), 20% (от 6 лет)
  + В новый год начисляется по n сумме “коинов“, каждый год n + x . При условии что год с даты регистрации прошел.
- [ ] День рождения аккаунта / пользователя - подарки (“коины” + что-то)

---

###  

## Общие правила приёмки и мотивации

 

- [ ] Каждый компонент завершаем с **демо‑страницей** (storybook/дока).
- [ ] Все события логируем и показываем в «живом лог‑виджете» в Студии автора.
- [ ] Не копим «скрытый долг»: если нет времени на идеал — оставляем TODO: с датой и кратким планом.
- [ ] Раз в конец недели — **«срез» прогресса**: сколько чекбоксов закрыто и какие блокеры.

 

---

 

## Быстрый старт (микро‑спринт 0)

 

- [ ]  Инициализировать репо (client+server, CI линтеры/форматтеры).
- [ ]  Включить feature‑flags (переключатели этапов).
- [ ]  Развернуть dev‑стенд (docker compose: db, cache, rtmp, api, web).
   **DoD:** локально всё поднимается одной командой, фича‑флаги работают.

  


