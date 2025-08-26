import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Badge } from '@components/ui/Badge';
import { 
  Activity, 
  Search, 
  Download, 
  Filter, 
  RefreshCw,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { LogEntry } from '@streaming/types';

interface LogStats {
  level: string;
  count: number;
  unique_users: number;
  recent_count: number;
}

const levelIcons = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  warn: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  debug: <CheckCircle className="h-4 w-4 text-green-500" />,
};

const levelColors = {
  info: 'bg-blue-100 text-blue-800',
  warn: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  debug: 'bg-green-100 text-green-800',
};

export const LogsDashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [filters, setFilters] = useState({
    level: '',
    module: '',
    search: '',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Подключаемся к WebSocket
    const newSocket = io(process.env.VITE_API_URL || 'http://localhost:3000');
    setSocket(newSocket);

    // Получаем последние логи при подключении
    newSocket.on('recent_logs', (recentLogs: LogEntry[]) => {
      setLogs(recentLogs);
      setLoading(false);
    });

    // Получаем новые логи в реальном времени
    newSocket.on('new_log', (log: LogEntry) => {
      if (autoRefresh) {
        setLogs(prev => [log, ...prev.slice(0, 99)]);
      }
    });

    // Получаем статистику
    newSocket.on('log_stats', (logStats: LogStats[]) => {
      setStats(logStats);
    });

    // Запрашиваем статистику
    newSocket.emit('get_log_stats');

    return () => {
      newSocket.disconnect();
    };
  }, [autoRefresh]);

  const fetchLogs = async () => {
    if (!socket) return;

    setLoading(true);
    socket.emit('get_logs', {
      filters: {
        level: filters.level || undefined,
        module: filters.module || undefined,
      },
      limit: 100,
    });
  };

  const handleSearch = async () => {
    if (!socket || !filters.search) return;

    setLoading(true);
    socket.emit('get_logs', {
      filters: {
        level: filters.level || undefined,
        module: filters.module || undefined,
      },
      limit: 100,
    });
  };

  const exportLogs = async (format: 'csv' | 'json') => {
    if (!socket) return;

    socket.emit('get_logs', {
      filters: {
        level: filters.level || undefined,
        module: filters.module || undefined,
      },
      limit: 10000,
    });

    // В реальном приложении здесь был бы обработчик ответа
    console.log(`Exporting logs as ${format}`);
  };

  const filteredLogs = logs.filter(log => {
    if (filters.level && log.level !== filters.level) return false;
    if (filters.module && log.module !== filters.module) return false;
    if (filters.search && !log.message.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getLevelIcon = (level: string) => levelIcons[level as keyof typeof levelIcons] || <Info className="h-4 w-4" />;
  const getLevelColor = (level: string) => levelColors[level as keyof typeof levelColors] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      {/* Заголовок и управление */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Системный мониторинг</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Автообновление
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportLogs('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportLogs('json')}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт JSON
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.level}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getLevelIcon(stat.level)}
                {stat.level.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-xs text-muted-foreground">
                {stat.recent_count} за последний час
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по сообщениям..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md"
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
            >
              <option value="">Все уровни</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>
            <select
              className="px-3 py-2 border rounded-md"
              value={filters.module}
              onChange={(e) => setFilters(prev => ({ ...prev, module: e.target.value }))}
            >
              <option value="">Все модули</option>
              <option value="HTTP">HTTP</option>
              <option value="DATABASE">Database</option>
              <option value="SECURITY">Security</option>
              <option value="AUTH">Auth</option>
            </select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Поиск
            </Button>
            <Button variant="outline" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Список логов */}
      <Card>
        <CardHeader>
          <CardTitle>Логи операций ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getLevelIcon(log.level)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {log.module}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        {log.action && (
                          <p className="text-xs text-muted-foreground">
                            Действие: {log.action}
                          </p>
                        )}
                        {log.ipAddress && (
                          <p className="text-xs text-muted-foreground">
                            IP: {log.ipAddress}
                          </p>
                        )}
                      </div>
                    </div>
                    {log.responseTime && (
                      <div className="text-xs text-muted-foreground">
                        {log.responseTime}ms
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};