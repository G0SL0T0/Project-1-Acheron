import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { 
  Video, 
  Users, 
  Play, 
  Star, 
  Clock,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { usePerformance } from '@hooks/usePerformance';
import { StreamCard } from '@components/streaming/StreamCard';

interface FeaturedStream {
  id: string;
  title: string;
  author: string;
  viewers: number;
  category: string;
  thumbnail: string;
  isLive: boolean;
}

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { isEnhanced } = usePerformance();
  const [featuredStreams, setFeaturedStreams] = useState<FeaturedStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загрузка популярных стримов
    const loadStreams = async () => {
      try {
        // В реальном приложении здесь будет запрос к API
        const mockStreams: FeaturedStream[] = [
          {
            id: '1',
            title: 'Разработка нового проекта на React',
            author: 'dev_streamer',
            viewers: 1234,
            category: 'Программирование',
            thumbnail: '/placeholder-stream.jpg',
            isLive: true,
          },
          {
            id: '2',
            title: 'Игровой стрим: Новые приключения',
            author: 'gamer_pro',
            viewers: 5678,
            category: 'Игры',
            thumbnail: '/placeholder-stream.jpg',
            isLive: true,
          },
          {
            id: '3',
            title: 'Музыкальный вечер',
            author: 'music_lover',
            viewers: 890,
            category: 'Музыка',
            thumbnail: '/placeholder-stream.jpg',
            isLive: true,
          },
        ];
        setFeaturedStreams(mockStreams);
      } catch (error) {
        console.error('Failed to load streams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStreams();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero секция */}
      <section className={`bg-gradient-to-r ${isEnhanced ? 'from-primary/20 via-primary/10 to-background' : 'from-primary/10 to-background'} py-20`}>
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Стриминговая платформа нового поколения
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Смотрите стримы, общайтесь в чате, участвуйте в играх и зарабатывайте награды
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/streams">
                <Play className="mr-2 h-4 w-4" />
                Смотреть стримы
              </Link>
            </Button>
            {user && (
              <Button variant="outline" size="lg" asChild>
                <Link to="/studio">
                  <Video className="mr-2 h-4 w-4" />
                  Начать стримить
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Особенности */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Возможности платформы</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`w-16 h-16 ${isEnhanced ? 'bg-gradient-to-r from-primary to-primary/50' : 'bg-primary/10'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Качественный стриминг</h3>
              <p className="text-muted-foreground">
                HLS стриминг с адаптивным качеством и низкой задержкой
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 ${isEnhanced ? 'bg-gradient-to-r from-primary to-primary/50' : 'bg-primary/10'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Активное сообщество</h3>
              <p className="text-muted-foreground">
                Чат в реальном времени, донаты и интерактивные функции
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 ${isEnhanced ? 'bg-gradient-to-r from-primary to-primary/50' : 'bg-primary/10'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Награды и достижения</h3>
              <p className="text-muted-foreground">
                Зарабатывайте валюту, открывайте предметы и участвуйте в играх
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Популярные стримы */}
      <section className="py-16 bg-accent/50">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Популярные стримы</h2>
            <Button variant="outline" asChild>
              <Link to="/streams">Все стримы</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Статистика */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Платформа в цифрах</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <p className="text-muted-foreground">Активных пользователей</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Стримов ежедневно</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Часов контента</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <p className="text-muted-foreground">Время работы</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};