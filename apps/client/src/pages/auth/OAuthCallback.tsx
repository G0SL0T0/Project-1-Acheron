'use client';

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@hooks/useToast';

const OAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // Сохраняем токен
      localStorage.setItem('accessToken', token);
      
      // Отправляем сообщение в родительское окно
      if (window.opener) {
        window.opener.postMessage(
          { type: 'OAUTH_SUCCESS', token },
          window.location.origin
        );
      }
      
      // Показываем уведомление
      toast({
        title: 'Успешная авторизация',
        description: 'Вы успешно вошли в систему',
      });
      
      // Закрываем окно
      window.close();
    } else {
      // Если нет токена - ошибка
      toast({
        title: 'Ошибка авторизации',
        description: 'Не удалось получить токен доступа',
        variant: 'destructive',
      });
      
      navigate('/auth/login');
    }
  }, [location, navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">
          Обработка авторизации...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;