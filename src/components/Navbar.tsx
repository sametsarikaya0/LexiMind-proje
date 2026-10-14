import React from 'react';
import {
  ExternalLink,
  Sparkles,
  FileText,
  Compass,
  Database,
  GraduationCap,
  Activity,
  Cpu,
  Zap,
  HelpCircle
} from 'lucide-react';
import { AppTheme } from '../types';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  onOpenDocs: () => void;
  onOpenStudentGuide: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBackendHealthy: boolean;
  theme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDocs,
  onOpenStudentGuide,
  activeTab,
  setActiveTab,
  isBackendHealthy,
  theme,
  onSelectTheme,
}) => {
  const navItems = [
    { id: 'words', label: 'Kelime Laboratuvarı', icon: Sparkles },
    { id: 'text', label: 'Metin Analizi', icon: FileText },
    { id: 'visuals', label: 'Görsel Harita & Ağ', icon: Compass },
    { id: 'corpus', label: 'Türkçe Derlem & Sözlük', icon: Database },
    { id: 'homework', label: 'Ödev & Kaynaklar', icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 transition-colors border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Logo & Başlık & Canlı Motor Göstergeleri */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('words')}
              className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 text-white font-bold text-base shadow-xs group-hover:bg-indigo-500 transition-colors">
                LM
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                    LexiMind
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold uppercase tracking-wider">
                    Word2Vec
                  </span>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  Türkçe NLP Laboratuvarı
                </span>
              </div>
            </button>

            {/* FastAPI & Gensim Aktiflik Göstergeleri */}
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs">
              {/* Python & Gensim Motor Durumu */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  isBackendHealthy
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                }`}
                title="Gensim 4.x Word2Vec Modeli ve Python 3.11 çalışma zamanı"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBackendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'
                  }`}
                />
                <span className="font-semibold">
                  {isBackendHealthy ? 'Gensim Word2Vec Aktif' : 'Gensim Bağlanıyor...'}
                </span>
              </div>

              {/* FastAPI REST Rozeti */}
              <div
                className="hidden xl:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                title="FastAPI REST API Servisi"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>FastAPI / Uvicorn</span>
              </div>
            </div>
          </div>

          {/* Ana Navigasyon Sekmeleri */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sağ Eylemler: Öğrenci Rehberi + Tema Seçici + Swagger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Öğrenci & Geliştirici Kılavuzu Butonu */}
            <button
              type="button"
              onClick={onOpenStudentGuide}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              title="Öğrenci Kılavuzu: Kod Değiştirme ve Hoca Sunum Rehberi"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Kod & Sunum Kılavuzu</span>
            </button>

            {/* Karanlık / Açık Tema Seçici */}
            <ThemeSelector currentTheme={theme} onSelectTheme={onSelectTheme} />

            {/* Swagger API Dokümanı Butonu */}
            <button
              type="button"
              onClick={onOpenDocs}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              title="FastAPI Swagger İnteraktif Dokümantasyonu"
            >
              <span>Swagger /docs</span>
              <ExternalLink className="w-3 h-3 text-indigo-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
