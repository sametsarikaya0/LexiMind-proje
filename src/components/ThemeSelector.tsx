import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Check, ChevronDown } from 'lucide-react';
import { AppTheme, ThemeConfig } from '../types';

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'dark',
    name: 'Karanlık',
    subtitle: 'Derin Grafit & Mor Vektör Uzayı (Varsayılan)',
    badgeBg: 'bg-indigo-950 text-indigo-300 border-indigo-800/60',
    previewBg: '#09090b',
    accentColor: '#8b5cf6',
    isDark: true,
  },
  {
    id: 'light',
    name: 'Açık',
    subtitle: 'Akademik Beyaz & Temiz Yüksek Kontrast',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    previewBg: '#f8fafc',
    accentColor: '#6366f1',
    isDark: false,
  },
];

interface ThemeSelectorProps {
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onSelectTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDark = currentTheme === 'dark';

  // Dışarı tıklayınca menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    onSelectTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {/* Hızlı 1-Tık Değiştirme Butonu (Masaüstü ve Mobil) */}
      <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-xs">
        <button
          type="button"
          onClick={() => onSelectTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isDark
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Karanlık Mod: Göz yormayan koyu tema"
        >
          <Moon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Karanlık</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            !isDark
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Açık Mod: Yüksek kontrastlı akademik beyaz tema"
        >
          <Sun className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Açık</span>
        </button>
      </div>
    </div>
  );
};
