import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '@features/auth/components/LoginForm';
import { Button } from '@components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            На главную
          </Link>
          
          <h1 className="mt-6 text-3xl font-bold">Добро пожаловать!</h1>
          <p className="mt-2 text-muted-foreground">
            Войдите в свой аккаунт чтобы продолжить
          </p>
        </div>
        
        <div className="bg-background p-8 rounded-lg shadow-lg">
          <LoginForm />
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Нет аккаунта? </span>
            <Link to="/auth/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};