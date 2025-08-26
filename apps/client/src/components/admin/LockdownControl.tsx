import React, { useState, useEffect } from 'react';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Badge } from '@components/ui/Badge';
import { Alert, AlertDescription } from '@components/ui/Alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  Activity,
  Users,
  Database
} from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';

interface LockdownStatus {
  isActive: boolean;
  config?: {
    reason: string;
    initiatedBy: string;
    initiatedAt: string;
    estimatedDuration?: number;
    message: string;
  };
}

interface LockdownFormData {
  reason: string;
  estimatedDuration: number;
  allowAdminAccess: boolean;
  customMessage: string;
}

const lockdownReasons = [
  { value: 'security_breach', label: 'Угроза безопасности' },
  { value: 'maintenance', label: 'Техническое обслуживание' },
  { value: 'ddos_attack', label: 'DDoS атака' },
  { value: 'data_breach', label: 'Утечка данных' },
  { value: 'system_failure', label: 'Сбой системы' },
];

export const LockdownControl: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<LockdownStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LockdownFormData>({
    reason: '',
    estimatedDuration: 30 * 60 * 1000, // 30 минут по умолчанию
    allowAdminAccess: true,
    customMessage: '',
  });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/admin/lockdown/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load lockdown status:', error);
    }
  };

  const handleInitiateLockdown = async () => {
    if (!formData.reason) {
      alert('Пожалуйста, выберите причину блокировки');
      return;
    }

    if (!confirm(`Вы уверены, что хотите инициировать тотальную блокировку системы?\n\nПричина: ${formData.reason}`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/lockdown/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Блокировка успешно инициирована');
        loadStatus();
      } else {
        alert(`Ошибка: ${result.message}`);
      }
    } catch (error) {
      alert('Ошибка при инициации блокировки');
    } finally {
      setLoading(false);
    }
  };

  const handleLiftLockdown = async () => {
    if (!confirm('Вы уверены, что хотите снять блокировку системы?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/lockdown/lift', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        alert('Блокировка успешно снята');
        loadStatus();
      } else {
        alert(`Ошибка: ${result.message}`);
      }
    } catch (error) {
      alert('Ошибка при снятии блокировки');
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    return lockdownReasons.find(r => r.value === reason)?.label || reason;
  };

  if (!user?.roles.includes('ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Доступ запрещен. Требуются права администратора.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-red-500" />
        <h1 className="text-2xl font-bold">Управление блокировкой системы</h1>
      </div>

      {/* Текущий статус */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Текущий статус
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status?.isActive ? (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-medium">СИСТЕМА В РЕЖИМЕ БЛОКИРОВКИ</div>
                  <div className="mt-2">
                    <strong>Причина:</strong> {getReasonLabel(status.config!.reason)}
                  </div>
                  <div>
                    <strong>Инициирована:</strong> {new Date(status.config!.initiatedAt).toLocaleString('ru-RU')}
                  </div>
                  <div>
                    <strong>Кем:</strong> {status.config!.initiatedBy}
                  </div>
                  <div className="mt-2 p-3 bg-red-100 rounded border border-red-200">
                    <strong>Сообщение пользователям:</strong>
                    <div className="mt-1">{status.config!.message}</div>
                  </div>
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleLiftLockdown} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Снятие блокировки...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Снять блокировку
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Система работает в нормальном режиме. Блокировка не активна.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Управление блокировкой */}
      {!status?.isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Инициировать блокировку
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Причина блокировки</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                >
                  <option value="">Выберите причину...</option>
                  {lockdownReasons.map(reason => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Длительность (минуты)
                </label>
                <Input
                  type="number"
                  value={formData.estimatedDuration / (60 * 1000)}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estimatedDuration: parseInt(e.target.value) * 60 * 1000 
                  }))}
                  min="1"
                  max="1440"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allowAdminAccess}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowAdminAccess: e.target.checked }))}
                />
                <span className="text-sm">Разрешить доступ администраторам</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Кастомное сообщение (опционально)
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={formData.customMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                placeholder="Сообщение для пользователей..."
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Внимание: Блокировка остановит все транзакции и заблокирует доступ к системе для всех пользователей, кроме администраторов.
                </span>
              </div>

              <Button 
                onClick={handleInitiateLockdown} 
                disabled={loading || !formData.reason}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Инициация...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Инициировать блокировку
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Влияние на сервисы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Влияние на сервисы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-red-500" />
                <span className="font-medium">База данных</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Перевод в режим только для чтения, завершение активных транзакций
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-red-500" />
                <span className="font-medium">Пользователи</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Блокировка входа, завершение активных сессий
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-red-500" />
                <span className="font-medium">API</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Отключение всех эндпоинтов, кроме административных
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};