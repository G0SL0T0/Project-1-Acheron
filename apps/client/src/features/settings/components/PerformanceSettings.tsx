import React from 'react';
import { usePerformanceMode } from '@hooks/usePerformanceMode';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/Card';
import { Zap, Palette, Settings } from 'lucide-react';

export const PerformanceSettingsComponent: React.FC = () => {
  const { settings, setMode, isOptimized, isEnhanced } = usePerformanceMode();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки производительности
          </CardTitle>
          <CardDescription>
            Выберите режим работы приложения. Оптимизированный режим включен по умолчанию для максимальной производительности.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Оптимизированный режим */}
            <Card 
              className={`cursor-pointer transition-all ${
                isOptimized ? 'ring-2 ring-primary' : 'hover:bg-accent'
              }`}
              onClick={() => setMode('optimized')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4" />
                  Оптимизированный
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Максимальная производительность</li>
                  <li>• Отключенные анимации</li>
                  <li>• Упрощенные эффекты</li>
                  <li>• Быстрая загрузка</li>
                </ul>
              </CardContent>
            </Card>

            {/* Расширенный режим */}
            <Card 
              className={`cursor-pointer transition-all ${
                isEnhanced ? 'ring-2 ring-primary' : 'hover:bg-accent'
              }`}
              onClick={() => setMode('enhanced')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Palette className="h-4 w-4" />
                  Расширенный
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Полные визуальные эффекты</li>
                  <li>• Плавные анимации</li>
                  <li>• Улучшенное качество</li>
                  <li>• Максимальная красота</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Текущие настройки */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Текущие настройки:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Режим: <span className="font-medium">{settings.mode === 'optimized' ? 'Оптимизированный' : 'Расширенный'}</span></div>
              <div>Анимации: <span className="font-medium">{settings.animations ? 'Включены' : 'Отключены'}</span></div>
              <div>Эффекты: <span className="font-medium">{settings.effects ? 'Включены' : 'Отключены'}</span></div>
              <div>Качество: <span className="font-medium">{settings.highQuality ? 'Высокое' : 'Стандартное'}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};