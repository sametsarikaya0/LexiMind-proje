import React from 'react';
import { Cookie, CheckCircle2, Shield, Sliders, ArrowRight } from 'lucide-react';
import { PageRoute } from '../types';

interface CookiePolicyPageProps {
  onNavigate: (page: PageRoute) => void;
  onOpenCookieSettings: () => void;
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({
  onNavigate,
  onOpenCookieSettings,
}) => {
  const lastUpdated = '14 Ekim 2026';

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-[#1E2433] pb-6">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
          <Cookie className="w-4 h-4" />
          <span>Şeffaf Çerez Yönetimi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Çerez Politikası (Cookie Policy)
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Son Güncelleme: {lastUpdated} • LexiMind Akademik Türkçe NLP Platformu
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#151923] border border-amber-500/30 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Çerezler ve Yerel Depolama Nedir?</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Çerezler (cookies) ve yerel depolama (HTML5 localStorage), bir web sitesini ziyaret ettiğinizde tarayıcınız 
          tarafından cihazınızda saklanan küçük veri dosyalarıdır. LexiMind, üçüncü taraf reklam çerezleri veya gizli 
          izleme kodları <strong>kullanmaz</strong>; yalnızca uygulamanın doğru ve güvenli çalışabilmesi için gerekli 
          minimum verileri saklar.
        </p>
        <button
          type="button"
          onClick={onOpenCookieSettings}
          className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Çerez Tercihlerini Şimdi Düzenle</span>
        </button>
      </div>

      {/* Gerçek Çerez ve Depolama Envanteri Tablosu */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">LexiMind Tarafından Kullanılan Depolama Envanteri</h2>
        <div className="overflow-x-auto rounded-2xl border border-[#232A3B] bg-[#151923]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#10131B] text-slate-400 font-semibold border-b border-[#232A3B]">
              <tr>
                <th className="p-3.5">Anahtar / Çerez Adı</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Kullanım Amacı</th>
                <th className="p-3.5">Saklama Süresi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2433] text-slate-300">
              <tr>
                <td className="p-3.5 font-mono text-indigo-400">leximind_auth_token</td>
                <td className="p-3.5 font-medium text-emerald-400">Zorunlu (Gerekli)</td>
                <td className="p-3.5 text-slate-400">Giriş yapmış kullanıcının oturumunu doğrulamak için JWT belirteci.</td>
                <td className="p-3.5 text-slate-400">Çıkış yapılana kadar</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-indigo-400">leximind_theme</td>
                <td className="p-3.5 font-medium text-cyan-400">İşlevsel (Tercih)</td>
                <td className="p-3.5 text-slate-400">Kullanıcının karanlık veya aydınlık tema tercihini hatırlar.</td>
                <td className="p-3.5 text-slate-400">Kalıcı (LocalStorage)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-indigo-400">leximind_cookie_consent_v1</td>
                <td className="p-3.5 font-medium text-emerald-400">Zorunlu (Gerekli)</td>
                <td className="p-3.5 text-slate-400">Kullanıcının çerez izin tercihlerini saklar.</td>
                <td className="p-3.5 text-slate-400">Kalıcı (LocalStorage)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-indigo-400">leximind_pref_*</td>
                <td className="p-3.5 font-medium text-cyan-400">İşlevsel (Tercih)</td>
                <td className="p-3.5 text-slate-400">Varsayılan anahtar kelime sayısı ve tamlama ayarlarını saklar.</td>
                <td className="p-3.5 text-slate-400">Kalıcı (LocalStorage)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
          <h3 className="text-base font-bold text-white">Çerez Tercihlerini Nasıl Değiştirebilirsiniz?</h3>
          <p>
            Sayfanın en altındaki veya ayarlar bölümündeki "Çerez Tercihleri" bağlantısına tıklayarak isteğe bağlı çerezleri 
            her an açıp kapatabilirsiniz. Ayrıca tarayıcınızın ayarlarından yerel depolama verilerini temizleyerek tüm oturum 
            ve tercih kayıtlarını sıfırlayabilirsiniz.
          </p>
        </section>
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-[#1E2433]">
        <button
          type="button"
          onClick={() => onNavigate('terms')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
        >
          <span>Kullanım Koşullarını İncele</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 rounded-xl bg-[#1A202C] hover:bg-[#232B3B] text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          Panele Dön
        </button>
      </div>
    </div>
  );
};
