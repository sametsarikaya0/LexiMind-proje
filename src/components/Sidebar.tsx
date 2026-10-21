import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  History,
  Compass,
  Cpu,
  User,
  Settings,
  Shield,
  FileText,
  Cookie,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { PageRoute, UserProfile } from '../types';

interface SidebarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  isCollapsed,
  onToggleCollapse,
}) => {
  const mainNav = [
    { id: 'dashboard' as PageRoute, label: 'Kontrol Paneli', icon: LayoutDashboard },
    { id: 'new-analysis' as PageRoute, label: 'Yeni Analiz', icon: FilePlus, highlight: true },
    { id: 'history' as PageRoute, label: 'Analiz Geçmişi', icon: History },
    { id: 'words' as PageRoute, label: 'Kelime Gezgini', icon: Compass },
    { id: 'model' as PageRoute, label: 'Model Mimarisi', icon: Cpu },
  ];

  const userNav = [
    { id: 'profile' as PageRoute, label: 'Kullanıcı Profili', icon: User },
    { id: 'settings' as PageRoute, label: 'Ayarlar', icon: Settings },
  ];

  const legalNav = [
    { id: 'terms' as PageRoute, label: 'Kullanım Koşulları', icon: FileText },
    { id: 'privacy' as PageRoute, label: 'Gizlilik Politikası', icon: Shield },
    { id: 'cookies' as PageRoute, label: 'Çerez Politikası', icon: Cookie },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 border-r border-[#1E2433] bg-[#10131B] text-[#F8FAFC] select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E2433]">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 text-left focus:outline-none cursor-pointer overflow-hidden"
        >
          {/* Logo Mark: Text node symbol with semantic connections */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-md border border-indigo-400/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-extrabold text-base tracking-tight text-white block">
                Lexi<span className="text-indigo-400">Mind</span>
              </span>
              <span className="text-[10px] text-slate-400 block truncate font-medium">
                Makalelerden Anlamlı Bilgiye
              </span>
            </div>
          )}
        </button>

        {/* Toggle Collapse Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
          className="p-1.5 rounded-lg hover:bg-[#1C2230] text-slate-400 hover:text-white transition-colors cursor-pointer hidden md:flex items-center justify-center"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Analytics Nav */}
        <div>
          {!isCollapsed && (
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 block mb-2">
              Akademik NLP
            </span>
          )}
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : item.highlight
                      ? 'text-indigo-300 hover:text-white hover:bg-[#171C28] border border-indigo-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-[#171C28]'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Account Nav */}
        <div>
          {!isCollapsed && (
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 block mb-2">
              Kullanıcı
            </span>
          )}
          <nav className="space-y-1">
            {userNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#171C28]'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Legal & Policy Nav */}
        <div>
          {!isCollapsed && (
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 block mb-2">
              Yasal & Güven
            </span>
          )}
          <nav className="space-y-0.5">
            {legalNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    isActive
                      ? 'text-indigo-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-[#1E2433] bg-[#0E1118]">
        {currentUser ? (
          <div className="flex items-center justify-between gap-2">
            {!isCollapsed && (
              <div
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate leading-tight">
                    {currentUser.full_name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={onLogout}
              title="Çıkış Yap"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {!isCollapsed ? (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Giriş Yap / Kaydol</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                title="Giriş Yap"
                className="w-full p-2 rounded-xl bg-indigo-600 text-white flex items-center justify-center cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
