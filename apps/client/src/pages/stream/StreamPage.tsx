import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Card, CardContent } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { Input } from '@components/ui/Input';
import { 
  Heart, 
  Share, 
  Gift, 
  Users, 
  Eye,
  MessageCircle,
  Settings,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { usePerformance } from '@hooks/usePerformance';
import { StreamPlayer } from '@components/streaming/StreamPlayer';
import { ChatWindow } from '@components/chat/ChatWindow';

interface StreamData {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    isLive: boolean;
  };
  category: string;
  viewers: number;
  tags: string[];
  isFollowing: boolean;
}

export const StreamPage: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const { user } = useAuth();
  const { isEnhanced } = usePerformance();
  const [stream, setStream] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');

  useEffect(() => {
    const loadStream = async () => {
      try {
        // В реальном приложении здесь будет запрос к API
        const mockStream: StreamData = {
          id: streamId || '1',
          title: 'Разработка нового проекта на React + NestJS',
          description: 'В этом стриме мы создаем полноценную стриминговую платформу с нуля. Рассматриваем архитектуру, безопасность и оптимизацию.',
          author: {
            id: '1',
            username: 'dev_streamer',
            avatar: '/avatar.jpg',
            isLive: true,
          },
          category: 'Программирование',
          viewers: 1234,
          tags: ['react', 'nestjs', 'typescript', 'разработка'],
          isFollowing: false,
        };
        setStream(mockStream);
      } catch (error) {
        console.error('Failed to load stream:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStream();
  }, [streamId]);

  const handleFollow = () => {
    if (!stream) return;
    // В реальном приложении здесь будет запрос к API
    setStream(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
  };

  const handleDonate = async () => {
    if (!donationAmount || !stream) return;
    
    try {
      // В реальном приложении здесь будет запрос к API
      alert(`Донат ${donationAmount} с сообщением: ${donationMessage}`);
      setDonationAmount('');
      setDonationMessage('');
    } catch (error) {
      console.error('Failed to donate:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Стрим не найден</h1>
          <Button asChild>
            <Link to="/">На главную</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-6">
            {/* Плеер */}
            <div className="relative">
              <StreamPlayer streamId={stream.id} />
              {isEnhanced && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Дополнительные эффекты для расширенного режима */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}
            </div>

            {/* Информация о стриме */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{stream.title}</h1>
                    <p className="text-muted-foreground mb-4">{stream.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {stream.viewers.toLocaleString()}
                      </div>
                      <Badge variant="secondary">{stream.category}</Badge>
                      {stream.author.isLive && (
                        <Badge variant="destructive" className="animate-pulse">
                          LIVE
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={stream.isFollowing ? "secondary" : "default"}
                      size="sm"
                      onClick={handleFollow}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${stream.isFollowing ? 'fill-current' : ''}`} />
                      {stream.isFollowing ? 'Отписаться' : 'Подписаться'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Теги */}
                <div className="flex flex-wrap gap-2">
                  {stream.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Донаты */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Поддержать стримера</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {[100, 500, 1000, 5000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setDonationAmount(amount.toString())}
                      >
                        {amount}₽
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Сумма"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleDonate} disabled={!donationAmount}>
                      <Gift className="h-4 w-4 mr-2" />
                      Донат
                    </Button>
                  </div>
                  
                  <Input
                    placeholder="Сообщение (опционально)"
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Информация о стримере */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={stream.author.avatar || '/default-avatar.jpg'}
                    alt={stream.author.username}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{stream.author.username}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stream.author.isLive ? 'В эфире' : 'Не в эфире'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Чат
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                        Подписчики
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Настройки
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Чат */}
                <Card>
                  <CardContent className="p-0">
                    <ChatWindow streamId={stream.id} />
                  </CardContent>
                </Card>

                {/* Рекомендации */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Похожие стримы</h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Link key={i} to={`/stream/${i}`} className="block">
                          <div className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                            <div className="w-20 h-12 bg-muted rounded"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Похожий стрим {i}</p>
                              <p className="text-xs text-muted-foreground">Автор {i}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };