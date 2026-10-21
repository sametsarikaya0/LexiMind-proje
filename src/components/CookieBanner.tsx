import React, { useState, useEffect } from 'react';
import { Cookie, X, Check, Shield, Sliders } from 'lucide-react';
import { CookiePreferences, PageRoute } from '../types';

interface CookieBannerProps {
  onNavigate: (page: PageRoute) => void;
}

const STORAGE_KEY = 'leximind_cookie_consent_v1';

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setIsOpen(true);
    }
  }, []);

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    const preferences: CookiePreferences = {
      necessary: true,
      analytics,
      marketing,
      timestamp: Date.now(),
      version: '1.0.0',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setIsOpen(false);
    setIsModalOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleRejectOptional = () => {
    saveConsent(false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(analyticsEnabled, marketingEnabled);
  };

  if (!isOpen && !isModalOpen) {
    return null;
  }

  return (
    <>
      {/* Bottom Sticky Banner */}
      {isOpen && !isModalOpen && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-[#0E1118]/95 backdrop-blur-md border-t border-[#1E2433] shadow-2xl">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex-shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Çerez Tercihleriniz ve Gizlilik
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  LexiMind, hizmetin çalışması için gerekli çerezleri kullanır. İzin vermen durumunda
                  isteğe bağlı çerezler de kullanılabilir. Tercihlerini istediğin zaman değiştirebilirsin.{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('cookies')}
                    className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                  >
                    Çerez Politikamızı İnceleyin
                  </button>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end md:self-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#171C28] hover:bg-[#1E2433] border border-[#1E2433] transition-colors cursor-pointer"
              >
                Tercihleri Yönet
              </button>
              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-[#171C28] hover:bg-[#1E2433] border border-[#1E2433] transition-colors cursor-pointer"
              >
                İsteğe Bağlıları Reddet
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm cursor-pointer"
              >
                Tümünü Kabul Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#151923] border border-[#1E2433] shadow-2xl p-6 text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2433]">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Çerez Tercihlerini Yönet</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              LexiMind üzerinde kullanılan çerez kategorilerini aşağıdan inceleyebilir ve tercihlerinizi özelleştirebilirsiniz.
            </p>

            <div className="space-y-3">
              {/* Zorunlu Çerezler */}
              <div className="p-3.5 rounded-xl bg-[#10131B] border border-[#1E2433] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Gerekli ve Zorunlu Çerezler</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">Her Zaman Etkin</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Kullanıcı oturumunun korunması, API yetkilendirmesi ve temel güvenlik gereksinimleri için zorunludur. Kapatılamaz.
                  </p>
                </div>
                <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Analitik Çerezler */}
              <div className="p-3.5 rounded-xl bg-[#10131B] border border-[#1E2433] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Analitik Çerezler</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sayfa ziyaretleri, analiz hızı ve hata raporlarının anonim olarak toplanmasını sağlar.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer mt-1"
                />
              </div>

              {/* Pazarlama Çerezleri */}
              <div className="p-3.5 rounded-xl bg-[#10131B] border border-[#1E2433] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Pazarlama & Tanıtım Çerezleri</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Akademik yayın duyuruları ve ürün güncellemeleri için kullanılır (varsayılan olarak kapalıdır).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={(e) => setMarketingEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer mt-1"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#1E2433]">
              <button
                type="button"
                onClick={() => onNavigate('cookies')}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
              >
                Detaylı Çerez Politikası ↗
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#171C28] border border-[#1E2433] cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm cursor-pointer"
                >
                  Tercihleri Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
