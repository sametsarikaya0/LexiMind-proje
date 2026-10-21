import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { ApiDocsModal } from './components/ApiDocsModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { AnalysisResultsPage } from './pages/AnalysisResultsPage';
import { AnalysisHistoryPage } from './pages/AnalysisHistoryPage';
import { WordExplorerPage } from './pages/WordExplorerPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/AuthPages';

import { PageRoute, UserProfile, AnalysisRecord, ModelInfo } from './types';
import { fetchCurrentUser, fetchHealth, fetchModelInfo, fetchAnalysisById, logoutUser } from './api';

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<PageRoute>('dashboard');
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisRecord | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Layout & UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  // Path <-> PageRoute mapping
  const pathToRoute = (pathname: string): PageRoute => {
    const clean = pathname.replace(/\/$/, '') || '/';
    if (clean === '/dashboard' || clean === '/') return 'dashboard';
    if (clean === '/analysis/new') return 'new-analysis';
    if (clean.startsWith('/analysis/')) return 'analysis-result';
    if (clean === '/history') return 'history';
    if (clean === '/words') return 'words';
    if (clean === '/model') return 'model';
    if (clean === '/profile') return 'profile';
    if (clean === '/settings') return 'settings';
    if (clean === '/terms') return 'terms';
    if (clean === '/privacy') return 'privacy';
    if (clean === '/cookies') return 'cookies';
    if (clean === '/login') return 'login';
    if (clean === '/register') return 'register';
    if (clean === '/forgot-password') return 'forgot-password';
    return 'dashboard';
  };

  const routeToPath = (route: PageRoute, analysisId?: string): string => {
    switch (route) {
      case 'dashboard':
        return '/dashboard';
      case 'new-analysis':
        return '/analysis/new';
      case 'analysis-result':
        return analysisId ? `/analysis/${analysisId}` : '/analysis/result';
      case 'history':
        return '/history';
      case 'words':
        return '/words';
      case 'model':
        return '/model';
      case 'profile':
        return '/profile';
      case 'settings':
        return '/settings';
      case 'terms':
        return '/terms';
      case 'privacy':
        return '/privacy';
      case 'cookies':
        return '/cookies';
      case 'login':
        return '/login';
      case 'register':
        return '/register';
      case 'forgot-password':
        return '/forgot-password';
      default:
        return '/dashboard';
    }
  };

  // Synchronize on Navigation
  const navigateTo = (page: PageRoute, analysisId?: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const targetPath = routeToPath(page, analysisId);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page, analysisId }, '', targetPath);
    }
  };

  // Browser Popstate (Back/Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const page = pathToRoute(window.location.pathname);
      setCurrentPage(page);

      // If URL is /analysis/:id, load it
      if (window.location.pathname.startsWith('/analysis/') && window.location.pathname !== '/analysis/new') {
        const id = window.location.pathname.replace('/analysis/', '');
        if (id && id !== 'result') {
          fetchAnalysisById(id)
            .then((data) => setCurrentAnalysis(data))
            .catch(() => {});
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial Load (Authentication, Health, Model & Initial Route)
  useEffect(() => {
    const initApp = async () => {
      // 1. Determine Initial Page from URL
      const initialPage = pathToRoute(window.location.pathname);
      setCurrentPage(initialPage);

      if (window.location.pathname.startsWith('/analysis/') && window.location.pathname !== '/analysis/new') {
        const id = window.location.pathname.replace('/analysis/', '');
        if (id && id !== 'result') {
          fetchAnalysisById(id)
            .then((data) => setCurrentAnalysis(data))
            .catch(() => {});
        }
      }

      // 2. Fetch Current Authenticated User (if token exists)
      try {
        const user = await fetchCurrentUser();
        if (user) setCurrentUser(user);
      } catch (err) {
        console.warn('Oturum doğrulanamadı:', err);
      }

      // 3. Health & Model Information
      try {
        const health = await fetchHealth();
        if (health.status === 'ok' || health.status === 'healthy') {
          setIsBackendHealthy(true);
        }
      } catch (err) {
        console.warn('Backend sağlık kontrolü başarısız:', err);
      }

      try {
        const info = await fetchModelInfo();
        setModelInfo(info);
      } catch (err) {
        console.warn('Model bilgisi alınamadı:', err);
      }
    };

    initApp();

    // Periodic Health Check
    const interval = setInterval(async () => {
      try {
        const health = await fetchHealth();
        if (health.status === 'ok' || health.status === 'healthy') {
          setIsBackendHealthy(true);
        }
      } catch {
        setIsBackendHealthy(false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleSelectAnalysis = async (id: string) => {
    try {
      const data = await fetchAnalysisById(id);
      setCurrentAnalysis(data);
      navigateTo('analysis-result', id);
    } catch (err) {
      alert('Analiz kaydı yüklenemedi.');
    }
  };

  const handleAnalysisSuccess = (analysis: AnalysisRecord) => {
    setCurrentAnalysis(analysis);
    navigateTo('analysis-result', analysis.id);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    navigateTo('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F8FAFC] flex font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-400">
      {/* 1. Masaüstü ve Mobil Kenar Çubuğu (Persistent Sidebar) */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigateTo}
        currentUser={currentUser}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Mobil Menü Arka Plan Maskesi (Overlay) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. Ana Çalışma Alanı (Main Workspace) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Üst Gezinti ve Başlık Çubuğu */}
        <TopHeader
          currentPage={currentPage}
          onNavigate={navigateTo}
          currentUser={currentUser}
          isBackendHealthy={isBackendHealthy}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Ana Sayfa İçerik Alanı */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={navigateTo}
              currentUser={currentUser}
              onSelectAnalysis={handleSelectAnalysis}
            />
          )}

          {currentPage === 'new-analysis' && (
            <NewAnalysisPage
              onNavigate={navigateTo}
              onAnalysisSuccess={handleAnalysisSuccess}
            />
          )}

          {currentPage === 'analysis-result' && (
            currentAnalysis ? (
              <AnalysisResultsPage
                analysis={currentAnalysis}
                onReanalyze={() => navigateTo('new-analysis')}
                onNavigate={navigateTo}
              />
            ) : (
              <div className="py-16 text-center space-y-4">
                <p className="text-slate-400 text-sm">Görüntülenecek bir analiz seçilmedi veya bulunamadı.</p>
                <button
                  type="button"
                  onClick={() => navigateTo('new-analysis')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Yeni Analiz Başlat
                </button>
              </div>
            )
          )}

          {currentPage === 'history' && (
            <AnalysisHistoryPage
              onSelectAnalysis={handleSelectAnalysis}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'words' && (
            <WordExplorerPage onNavigate={navigateTo} />
          )}

          {currentPage === 'model' && (
            <ModelInfoPage onNavigate={navigateTo} />
          )}

          {currentPage === 'profile' && (
            <ProfilePage
              currentUser={currentUser}
              onNavigate={navigateTo}
              onUserUpdated={setCurrentUser}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              currentUser={currentUser}
              onNavigate={navigateTo}
              onOpenCookieSettings={() => navigateTo('cookies')}
            />
          )}

          {currentPage === 'terms' && (
            <TermsPage onNavigate={navigateTo} />
          )}

          {currentPage === 'privacy' && (
            <PrivacyPage onNavigate={navigateTo} />
          )}

          {currentPage === 'cookies' && (
            <CookiePolicyPage
              onNavigate={navigateTo}
              onOpenCookieSettings={() => {
                // Remove cookie consent to re-trigger modal/banner
                localStorage.removeItem('leximind_cookie_consent_v1');
                window.location.reload();
              }}
            />
          )}

          {currentPage === 'login' && (
            <LoginPage
              onNavigate={navigateTo}
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                navigateTo('dashboard');
              }}
            />
          )}

          {currentPage === 'register' && (
            <RegisterPage
              onNavigate={navigateTo}
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                navigateTo('dashboard');
              }}
            />
          )}

          {currentPage === 'forgot-password' && (
            <ForgotPasswordPage onNavigate={navigateTo} />
          )}
        </main>

        {/* Alt Bilgi (Footer) */}
        <Footer
          onOpenDocs={() => setIsDocsOpen(true)}
          onNavigate={navigateTo}
          onOpenCookieSettings={() => navigateTo('cookies')}
        />
      </div>

      {/* 3. Çerez İzni Altbilgi Şeridi */}
      <CookieBanner onNavigate={navigateTo} />

      {/* 4. API Swagger Dokümantasyon Modalı */}
      <ApiDocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
