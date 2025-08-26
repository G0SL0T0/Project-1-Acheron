import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало заполнения базы данных...');

  // Создаем администратора
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@streaming.local' },
    update: {},
    create: {
      email: 'admin@streaming.local',
      username: 'admin',
      password: adminPassword,
      bio: 'Системный администратор',
      roles: {
        create: [
          { role: 'ADMIN' },
          { role: 'AUTHOR' },
          { role: 'USER' },
        ],
      },
      profile: {
        create: {
          language: 'ru',
          timezone: 'Europe/Moscow',
        },
      },
    },
  });

  // Создаем тестового пользователя
  const userPassword = await hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@streaming.local' },
    update: {},
    create: {
      email: 'user@streaming.local',
      username: 'testuser',
      password: userPassword,
      bio: 'Тестовый пользователь',
      roles: {
        create: [
          { role: 'USER' },
        ],
      },
      profile: {
        create: {
          language: 'ru',
          timezone: 'Europe/Moscow',
        },
      },
    },
  });

  // Создаем тестового автора
  const authorPassword = await hash('author123', 10);
  const author = await prisma.user.upsert({
    where: { email: 'author@streaming.local' },
    update: {},
    create: {
      email: 'author@streaming.local',
      username: 'testauthor',
      password: authorPassword,
      bio: 'Тестовый автор стримов',
      roles: {
        create: [
          { role: 'AUTHOR' },
          { role: 'USER' },
        ],
      },
      profile: {
        create: {
          language: 'ru',
          timezone: 'Europe/Moscow',
          twitter: '@testauthor',
          youtube: 'testauthor',
          twitch: 'testauthor',
        },
      },
    },
  });

  // Создаем базовые темы
  const minimalTheme = await prisma.theme.upsert({
    where: { name: 'Минимал' },
    update: {},
    create: {
      name: 'Минимал',
      isDefault: true,
      config: {
        colors: {
          primary: '#3b82f6',
          background: '#ffffff',
          foreground: '#000000',
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
        },
      },
    },
  });

  const classicTheme = await prisma.theme.upsert({
    where: { name: 'Классика' },
    update: {},
    create: {
      name: 'Классика',
      isDefault: false,
      config: {
        colors: {
          primary: '#8b5cf6',
          background: '#f8fafc',
          foreground: '#1e293b',
        },
        typography: {
          fontFamily: 'Georgia, serif',
        },
      },
      authorId: admin.id,
    },
  });

  // Создаем тестовые предметы
  const items = await Promise.all([
    prisma.item.create({
      data: {
        name: 'Бейдж новичка',
        description: 'Выдается новым пользователям',
        kind: 'BADGE',
        rarity: 'COMMON',
        hash: 'hash_badge_newbie_001',
        totalSupply: 1000,
        minted: 100,
      },
    }),
    prisma.item.create({
      data: {
        name: 'Золотой аватар',
        description: 'Эксклюзивный золотой аватар',
        kind: 'AVATAR',
        rarity: 'LEGENDARY',
        hash: 'hash_avatar_gold_001',
        totalSupply: 100,
        minted: 5,
      },
    }),
  ]);

  // Создаем тестовый стрим
  const stream = await prisma.stream.create({
    data: {
      title: 'Тестовый стрим',
      description: 'Это тестовый стрим для демонстрации',
      category: 'Играем',
      streamKey: 'test_stream_key_001',
      authorId: author.id,
    },
  });

  console.log('✅ База данных успешно заполнена!');
  console.log('📧 Администратор: admin@streaming.local / admin123');
  console.log('👤 Пользователь: user@streaming.local / user123');
  console.log('🎥 Автор: author@streaming.local / author123');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });