'use client';

import React from 'react';
import { Button } from '@components/ui/Button';
import { Chrome, Mail } from 'lucide-react';

interface OAuthButtonsProps {
  isLoading?: boolean;
  onOAuthLogin: (provider: 'google' | 'yandex') => void;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ 
  isLoading, 
  onOAuthLogin 
}) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Или войти через
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => onOAuthLogin('google')}
          disabled={isLoading}
          className="gap-2"
        >
          <Chrome className="h-4 w-4" />
          Google
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onOAuthLogin('yandex')}
          disabled={isLoading}
          className="gap-2"
        >
          <Mail className="h-4 w-4" />
          Yandex
        </Button>
      </div>
    </div>
  );
};

export default OAuthButtons;