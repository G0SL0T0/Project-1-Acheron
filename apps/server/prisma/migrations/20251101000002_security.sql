-- Добавляем поля безопасности
ALTER TABLE "users" 
ADD COLUMN "encrypted_email" TEXT,
ADD COLUMN "two_factor_secret" TEXT,
ADD COLUMN "two_factor_enabled" BOOLEAN DEFAULT false,
ADD COLUMN "backup_codes" TEXT[] DEFAULT '{}',
ADD COLUMN "last_login_at" TIMESTAMP,
ADD COLUMN "login_attempts" INTEGER DEFAULT 0,
ADD COLUMN "locked_until" TIMESTAMP;

-- Создаем таблицу аудита
CREATE TABLE "security_audits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "successful" BOOLEAN NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_audits_pkey" PRIMARY KEY ("id")
);

-- Внешний ключ
ALTER TABLE "security_audits" ADD CONSTRAINT "security_audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Создаем индексы для быстрого поиска
CREATE INDEX "security_audits_userId_idx" ON "security_audits"("userId");
CREATE INDEX "security_audits_action_idx" ON "security_audits"("action");
CREATE INDEX "security_audits_createdAt_idx" ON "security_audits"("createdAt");