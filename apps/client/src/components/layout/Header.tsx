import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { ThemeSwitcher } from '@features/themes/components/ThemeSwitcher';
import { useAuth } from '@features/auth/hooks/useAuth';
import { 
  Search, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut,
  Video,
  Home
} from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Логотип и навигация */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">StreamHub</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
              <Home className="h-4 w-4" />
              Главная
            </Link>
            <Link to="/streams" className="text-sm font-medium hover:text-primary">
              Стримы
            </Link>
            <Link to="/categories" className="text-sm font-medium hover:text-primary">
              Категории
            </Link>
          </nav>
        </div>

        {/* Поиск */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск стримов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Правая часть */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          
          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Войти</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Регистрация</Link>
              </Button>
            </div>
          )}

          {/* Мобильное меню */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Мобильная навигация */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-4">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск стримов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            
            <nav className="space-y-2">
              <Link 
                to="/" 
                className="block px-3 py-2 text-sm font-medium hover:bg-accent rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Главная
              </Link>
              <Link 
                to="/streams" 
                className="block px-3 py-2 text-sm font-medium hover:bg-accent rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Стримы
              </Link>
              <Link 
                to="/categories" 
                className="block px-3 py-2 text-sm font-medium hover:bg-accent rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Категории
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};