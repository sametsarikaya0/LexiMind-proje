import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Cookie,
  User,
  Globe,
  CheckCircle2,
  Lock,
  Trash2,
  FileText,
  ExternalLink
} from 'lucide-react';
import { PageRoute, UserProfile } from '../types';

interface SettingsPageProps {
  currentUser: UserProfile | null;
  onNavigate: (page: PageRoute) => void;
  onOpenCookieSettings: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onNavigate,
  onOpenCookieSettings,
}) => {
  // Local preferences stored in localStorage
  const [defaultTopN, setDefaultTopN] = useState<number>(() => {
    return parseInt(localStorage.getItem('leximind_pref_top_n') || '10', 10);
  });
  const [defaultPhrases, setDefaultPhrases] = useState<boolean>(() => {
    return localStorage.getItem('leximind_pref_phrases') !== 'false';
  });
  const [defaultRelated, setDefaultRelated] = useState<boolean>(() => {
    return localStorage.getItem('leximind_pref_related') !== 'false';
  });

  const [savedNotification, setSavedNotification] = useState(false);

  const handleSavePreferences = () => {
    localStorage.setItem('leximind_pref_top_n', defaultTopN.toString());
    localStorage.setItem('leximind_pref_phrases', defaultPhrases.toString());
    localStorage.setItem('leximind_pref_related', defaultRelated.toString());
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-[#1E2433] pb-6">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
          <Settings className="w-4 h-4" />
          <span>Konfigürasyon</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Uygulama Ayarları
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Analiz tercihleri, gizlilik kontrolleri, çerez yönetimi ve sistem ayarlarınızı yapılandırın.
        </p>
      </div>

      {savedNotification && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Analiz tercihleriniz başarıyla kaydedildi ve tarayıcınızda güncellendi.</span>
        </div>
      )}

      {/* 1. Analiz Tercihleri */}
      <div className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Varsayılan Analiz Tercihleri</h2>
            <p className="text-xs text-slate-400">Yeni analiz başlattığınızda otomatik seçilecek başlangıç parametreleri.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Varsayılan Anahtar Kelime Sayısı
            </label>
            <select
              value={defaultTopN}
              onChange={(e) => setDefaultTopN(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value={5}>5 Anahtar Kelime</option>
              <option value={10}>10 Anahtar Kelime</option>
              <option value={15}>15 Anahtar Kelime</option>
              <option value={20}>20 Anahtar Kelime</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F121A] border border-[#232A3B]">
            <div>
              <span className="text-xs font-semibold text-white block">Çok Kelimeli Tamlamalar</span>
              <span className="text-[11px] text-slate-400">Örn: 'doğal dil işleme'</span>
            </div>
            <input
              type="checkbox"
              checked={defaultPhrases}
              onChange={(e) => setDefaultPhrases(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded bg-[#151923] border-[#2D3748] focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F121A] border border-[#232A3B]">
            <div>
              <span className="text-xs font-semibold text-white block">Word2Vec Benzerleri</span>
              <span className="text-[11px] text-slate-400">Semantik terim eşleşmesi</span>
            </div>
            <input
              type="checkbox"
              checked={defaultRelated}
              onChange={(e) => setDefaultRelated(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded bg-[#151923] border-[#2D3748] focus:ring-0 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSavePreferences}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          Tercihleri Kaydet
        </button>
      </div>

      {/* 2. Dil ve Arayüz */}
      <div className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Dil & Bölge</h2>
            <p className="text-xs text-slate-400">Kullanıcı arayüzü ve NLP işlem dili.</p>
          </div>
        </div>
        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Arayüz Dili
          </label>
          <select
            disabled
            value="tr"
            className="w-full px-3 py-2 rounded-xl bg-[#0B0D12] border border-[#1E2433] text-slate-400 text-xs cursor-not-allowed"
          >
            <option value="tr">Türkçe (Varsayılan - Akademik Proje)</option>
          </select>
          <span className="text-[11px] text-slate-500 block mt-1">
            LexiMind Türkçe akademik makaleler için optimize edilmiştir.
          </span>
        </div>
      </div>

      {/* 3. Gizlilik ve Çerez Yönetimi */}
      <div className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Çerez & Veri Saklama Tercihleri</h2>
            <p className="text-xs text-slate-400">KVKK ve gizlilik standartlarına uygun çerez kontrolü.</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          LexiMind yalnızca oturum yönetimi ve kullanıcı tercihlerini hatırlamak amacıyla kesinlikle gerekli çerezleri/yerel depolamayı kullanır. İsteğe bağlı analitik tercihlerini dilediğiniz an güncelleyebilirsiniz.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenCookieSettings}
            className="px-4 py-2 rounded-xl bg-[#1E2433] hover:bg-[#2A3347] text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Çerez Tercihlerini Düzenle...
          </button>
          <button
            type="button"
            onClick={() => onNavigate('cookies')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
          >
            <span>Çerez Politikasını Oku</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 4. Hesap ve Güvenlik Kısayolları */}
      <div className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Hesap ve Parola Yönetimi</h2>
            <p className="text-xs text-slate-400">Kullanıcı profiliniz, parola ve hesap işlemleri.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Profil ve Parola Sayfasına Git
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="px-4 py-2 rounded-xl bg-[#1E2433] hover:bg-[#2A3347] text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Yeni Hesap Oluştur
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
