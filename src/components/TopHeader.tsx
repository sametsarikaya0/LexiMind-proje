import React from 'react';
import {
  Menu,
  Sparkles,
  User,
  LogIn,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FilePlus,
  BookOpen
} from 'lucide-react';
import { PageRoute, UserProfile } from '../types';

interface TopHeaderProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  currentUser: UserProfile | null;
  isBackendHealthy: boolean;
  onToggleMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  isBackendHealthy,
  onToggleMobileMenu,
}) => {
  // Breadcrumb labels
  const pageTitles: Record<PageRoute, { title: string; parent?: string }> = {
    'dashboard': { title: 'Kontrol Paneli' },
    'new-analysis': { title: 'Yeni Makale Analizi', parent: 'Analiz' },
    'analysis-result': { title: 'Analiz Raporu', parent: 'Sonuçlar' },
    'history': { title: 'Analiz Geçmişi' },
    'words': { title: 'Kelime Gezgini & Word2Vec' },
    'model': { title: 'Model Mimarisi & NLP' },
    'profile': { title: 'Kullanıcı Profili' },
    'settings': { title: 'Uygulama Ayarları' },
    'terms': { title: 'Kullanım Koşulları', parent: 'Yasal' },
    'privacy': { title: 'Gizlilik Politikası', parent: 'Yasal' },
    'cookies': { title: 'Çerez Politikası', parent: 'Yasal' },
    'login': { title: 'Giriş Yap' },
    'register': { title: 'Yeni Hesap Oluştur' },
    'forgot-password': { title: 'Parola Sıfırlama' },
  };

  const currentMeta = pageTitles[currentPage] || { title: 'LexiMind' };

  return (
    <header className="h-16 border-b border-[#1E2433] bg-[#0E1118]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Sol: Mobil Menü Butonu & Ekmek Kırıntısı (Breadcrumb) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1C2230] md:hidden cursor-pointer"
          title="Menüyü Aç"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Typographic Breadcrumbs (Zero-Pill) */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer font-medium"
          >
            LexiMind
          </button>
          <span className="text-slate-600" aria-hidden="true">/</span>
          {currentMeta.parent && (
            <>
              <span className="text-slate-400">{currentMeta.parent}</span>
              <span className="text-slate-600" aria-hidden="true">/</span>
            </>
          )}
          <span className="text-white font-semibold truncate max-w-[200px] sm:max-w-xs">
            {currentMeta.title}
          </span>
        </div>
      </div>

      {/* Sağ: Durum Göstergesi & Hızlı Aksiyonlar */}
      <div className="flex items-center gap-3">
        {/* Sistem Durumu (Quiet unboxed indicator) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-[11px] font-medium">
            {isBackendHealthy ? 'Gensim & FastAPI Aktif' : 'Servis Bağlanıyor'}
          </span>
        </div>

        {/* Yeni Analiz Hızlı Butonu */}
        {currentPage !== 'new-analysis' && (
          <button
            type="button"
            onClick={() => onNavigate('new-analysis')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Yeni Analiz</span>
          </button>
        )}

        {/* Kullanıcı Menüsü veya Giriş */}
        {currentUser ? (
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-[#1C2230] text-slate-300 hover:text-white transition-colors cursor-pointer border border-[#1E2433]"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-900/80 text-indigo-300 flex items-center justify-center text-xs font-bold">
              {currentUser.full_name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium hidden md:inline truncate max-w-[120px]">
              {currentUser.full_name.split(' ')[0]}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1C2230] transition-colors cursor-pointer"
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
            >
              Kayıt Ol
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
