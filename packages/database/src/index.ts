// Типы OAuth
export type OAuthProvider = 'google' | 'yandex';

export interface OAuthProfile {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface OAuthUser {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  provider: OAuthProvider;
}

// Утилиты для OAuth
export const oauthUtils = {
  // Генерация имени пользователя из email
  generateUsername: (email: string): string => {
    const localPart = email.split('@')[0];
    // Удаляем специальные символы и добавляем случайное число
    const cleanUsername = localPart.replace(/[^a-zA-Z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${cleanUsername}_${randomSuffix}`;
  },
  
  // Валидация провайдера
  isValidProvider: (provider: string): provider is OAuthProvider => {
    return ['google', 'yandex'].includes(provider);
  },
  
  // Форматирование данных профиля
  normalizeProfile: (profile: any, provider: OAuthProvider): OAuthProfile => {
    switch (provider) {
      case 'google':
        return {
          provider,
          providerId: profile.id,
          email: profile.email,
          name: profile.name,
          avatar: profile.picture,
        };
      case 'yandex':
        return {
          provider,
          providerId: profile.id,
          email: profile.default_email,
          name: `${profile.first_name} ${profile.last_name}`.trim(),
          avatar: profile.default_avatar_id ? 
            `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200` : 
            undefined,
        };
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  },
};