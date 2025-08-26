import React, { useState, useEffect } from 'react';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Badge } from '@components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/Tabs';
import { 
  User, 
  Mail, 
  Calendar,
  MapPin,
  Edit,
  Save,
  Camera,
  Link,
  Settings,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { SocialLinks } from '@components/profile/SocialLinks';
import { usePerformance } from '@hooks/usePerformance';

interface ProfileData {
  username: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  joinedAt: Date;
  socialLinks: any;
  stats: {
    streamsCount: number;
    followersCount: number;
    followingCount: number;
    totalViews: number;
  };
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { isEnhanced } = usePerformance();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    location: '',
    website: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // В реальном приложении здесь будет запрос к API
        const mockProfile: ProfileData = {
          username: user?.username || 'testuser',
          email: user?.email || 'test@example.com',
          bio: 'Разработчик и стример. Люблю создавать новые проекты и делиться опытом.',
          location: 'Москва, Россия',
          website: 'https://example.com',
          joinedAt: new Date('2023-01-01'),
          socialLinks: {
            telegram: 'testuser',
            github: 'testuser',
            vk: 'https://vk.com/testuser',
          },
          stats: {
            streamsCount: 42,
            followersCount: 1234,
            followingCount: 56,
            totalViews: 45678,
          },
        };
        setProfile(mockProfile);
        setEditForm({
          bio: mockProfile.bio,
          location: mockProfile.location,
          website: mockProfile.website,
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      // В реальном приложении здесь будет запрос к API
      setProfile(prev => prev ? {
        ...prev,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
      } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Заголовок профиля */}
        <div className="bg-gradient-to-r from-primary/10 to-background rounded-lg p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                <Badge variant="secondary">Профессионал</Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  На платформе с {profile.joinedAt.toLocaleDateString('ru-RU')}
                </div>
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <Button onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Настройки
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Контент профиля */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="streams">Стримы</TabsTrigger>
            <TabsTrigger value="schedule">Расписание</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Биография */}
            <Card>
              <CardHeader>
                <CardTitle>О себе</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <textarea
                      className="w-full p-3 border rounded-md"
                      rows={4}
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Расскажите о себе..."
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Город"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      />
                      <Input
                        placeholder="Вебсайт"
                        value={editForm.website}
                        onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Социальные сети */}
            <Card>
              <CardHeader>
                <CardTitle>Социальные сети</CardTitle>
              </CardHeader>
              <CardContent>
                <SocialLinks links={profile.socialLinks} showAll={true} />
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile.stats.streamsCount}</div>
                    <p className="text-sm text-muted-foreground">Стримов</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile.stats.followersCount.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Подписчиков</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile.stats.followingCount}</div>
                    <p className="text-sm text-muted-foreground">Подписок</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile.stats.totalViews.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Просмотров</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streams">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Здесь будут отображаться стримы пользователя</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Здесь будет расписание стримов</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Настройки профиля</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Приватный профиль</h4>
                      <p className="text-sm text-muted-foreground">Только подписчики смогут видеть ваш контент</p>
                    </div>
                    <Button variant="outline">Настроить</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Уведомления</h4>
                      <p className="text-sm text-muted-foreground">Настройте уведомления о новых стримах</p>
                    </div>
                    <Button variant="outline">Настроить</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Безопасность</h4>
                      <p className="text-sm text-muted-foreground">Двухфакторная аутентификация</p>
                    </div>
                    <Button variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Настроить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};