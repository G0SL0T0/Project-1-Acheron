import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { LogEntry } from '@streaming/types';

interface UseLogsOptions {
  autoConnect?: boolean;
  filters?: {
    level?: string;
    module?: string;
  };
}

export const useLogs = (options: UseLogsOptions = {}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (options.autoConnect === false) return;

    const newSocket = io(process.env.VITE_API_URL || 'http://localhost:3000', {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to logs server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from logs server');
    });

    newSocket.on('recent_logs', (recentLogs: LogEntry[]) => {
      setLogs(recentLogs);
    });

    newSocket.on('new_log', (log: LogEntry) => {
      setLogs(prev => [log, ...prev.slice(0, 99)]);
    });

    newSocket.on('log_stats', (logStats: any[]) => {
      setStats(logStats);
    });

    // Подписываемся на логи с фильтрами
    newSocket.emit('subscribe_logs', { filters: options.filters });

    return () => {
      newSocket.disconnect();
    };
  }, [options.filters, options.autoConnect]);

  const getLogs = async (filters?: any, limit = 100, offset = 0) => {
    if (!socket) return;

    socket.emit('get_logs', { filters, limit, offset });
  };

  const searchLogs = async (query: string, filters?: any) => {
    if (!socket) return;

    socket.emit('search_logs', { query, filters });
  };

  const exportLogs = async (format: 'csv' | 'json', filters?: any) => {
    if (!socket) return;

    socket.emit('export_logs', { format, filters });
  };

  return {
    logs,
    stats,
    connected,
    getLogs,
    searchLogs,
    exportLogs,
  };
};