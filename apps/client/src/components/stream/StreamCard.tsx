import React from 'react';
import { usePerformance } from '@hooks/usePerformance';
import { PerformanceSwitch } from '@components/performance/PerformanceSwitch';
import { Card, CardContent } from '@components/ui/Card';
import { Users, Eye } from 'lucide-react';

interface StreamCardProps {
  stream: {
    id: string;
    title: string;
    author: string;
    viewers: number;
    thumbnail: string;
  };
}

export const StreamCard: React.FC<StreamCardProps> = ({ stream }) => {
  const { componentSettings } = usePerformance();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all">
      {/* Оптимизированная версия */}
      <PerformanceSwitch
        optimized={
          <div className="aspect-video bg-muted flex items-center justify-center">
            <Eye className="h-12 w-12 text-muted-foreground" />
          </div>
        }
        enhanced={
          <div className="aspect-video relative overflow-hidden">
            <img 
              src={stream.thumbnail} 
              alt={stream.title}
              className="w-full h-full object-cover"
              loading={componentSettings.lazyLoadImages ? 'lazy' : 'eager'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        }
      />

      <CardContent className="p-4">
        <h3 className="font-semibold mb-1 line-clamp-2">{stream.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{stream.author}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {stream.viewers}
          </div>
          
          {/* Анимированный индикатор для расширенного режима */}
          <PerformanceSwitch
            optimized={<span className="h-2 w-2 bg-red-500 rounded-full" />}
            enhanced={
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </span>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};