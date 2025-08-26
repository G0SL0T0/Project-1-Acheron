import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@hooks/useToast';

export const useOAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const initiateOAuth = (provider: 'google' | 'yandex') => {
    setIsLoading(true);
    
    // Открываем новое окно для OAuth
    const width = 500;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    const authWindow = window.open(
      `${import.meta.env.VITE_API_URL}/auth/${provider}`,
      'OAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Слушаем сообщения от OAuth окна
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'OAUTH_SUCCESS') {
        const { token } = event.data;
        
        // Сохраняем токен
        localStorage.setItem('accessToken', token);
        
        // Закрываем окно
        authWindow?.close();
        
        // Показываем уведомление
        toast({
          title: 'Успешная авторизация',
          description: 'Вы успешно вошли в систему',
        });
        
        // Редирект на главную
        navigate('/');
        
        // Удаляем слушатель
        window.removeEventListener('message', handleMessage);
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Таймаут на случай, если пользователь закрыл окно
    const checkClosed = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        setIsLoading(false);
      }
    }, 1000);
  };

  return {
    isLoading,
    initiateOAuth,
  };
};