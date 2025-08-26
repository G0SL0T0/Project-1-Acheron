import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@components/ui/Button';
import { Sun, Moon, Palette } from 'lucide-react';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-8 w-8"
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
      
      <div className="relative group">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Palette className="h-4 w-4" />
        </Button>
        
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-popover shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="p-2 space-y-1">
            <button
              onClick={() => setTheme('minimal')}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded"
            >
              Минимал
            </button>
            <button
              onClick={() => setTheme('classic')}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded"
            >
              Классика
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};