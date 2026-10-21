import React from 'react';
import { Shield, Lock, Trash2, Database, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageRoute } from '../types';

interface PrivacyPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  const lastUpdated = '14 Ekim 2026';

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-[#1E2433] pb-6">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
          <Shield className="w-4 h-4" />
          <span>Veri Koruma & KVKK / GDPR Uyum İlkeleri</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Gizlilik Politikası (Privacy Policy)
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Son Güncelleme: {lastUpdated} • LexiMind Akademik Türkçe NLP Platformu
        </p>
      </div>

      {/* Özet Kartı */}
      <div className="p-5 rounded-2xl bg-[#151923] border border-emerald-500/30 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Şeffaf Veri İşleme Taahhüdü</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          LexiMind, kullanıcı gizliliğini temel bir ilke olarak kabul eder. Yüklediğiniz akademik belgeler asla üçüncü taraf
          ticari reklam şirketlerine veya kapalı yapay zeka eğitim havuzlarına satılmaz veya aktarılmaz. Yüklenen orijinal belgeler
          analiz tamamlandıktan sonra sunucu diskinde kalıcı olarak saklanmaz.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>1. Hangi Bilgileri Topluyoruz?</span>
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
            <li>
              <strong>Hesap Bilgileri:</strong> Kayıt esnasında sağlanan Ad Soyad, E-posta adresi ve güçlü <strong>Bcrypt</strong> algoritması ile özetlenmiş (hashing) parola. Düz metin (plaintext) parola asla kaydedilmez.
            </li>
            <li>
              <strong>Analiz Metaverileri:</strong> İşlenen makalenin başlığı, belge türü (PDF, DOCX, TXT veya metin yapıştırma), toplam kelime ve cümle sayısı, hesaplanan işlem süresi ve çıkarılan anahtar kelimeler ile anlamsal benzerlik skorları.
            </li>
            <li>
              <strong>Teknik Oturum Bilgileri:</strong> Oturum güvenliğini sağlamak amacıyla üretilen JWT / erişim belirteçleri (Token).
            </li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>2. Yüklenen Belgelerin İşlenmesi ve Dosya Saklama Politikası</span>
          </h2>
          <p>
            Yüklediğiniz PDF ve DOCX dosyaları yalnızca sunucunun geçici belleğinde veya güvenli geçici dizininde
            metin katmanının ayrıştırılması (parsing) amacıyla işlenir. 
          </p>
          <div className="p-4 rounded-xl bg-[#0F121A] border border-[#1E2433] space-y-1.5 text-xs">
            <div className="text-emerald-400 font-semibold">Kalıcı Dosya Saklanmaz:</div>
            <p className="text-slate-400">
              Orijinal PDF veya DOCX dosyası disk üzerinde kalıcı olarak saklanmaz. Yalnızca makale başlığı, kelime/cümle sayısı, 
              çıkarılan anahtar kelimeler ve metinden kısa bir önizleme özeti (ilk ~350 karakter) analiz geçmişinizde gösterilmek üzere kaydedilir.
            </p>
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>3. Verilerinizi Silme Hakkı (KVKK / GDPR Uyumu)</span>
          </h2>
          <p>
            Kullanıcılar diledikleri zaman sisteme kayıtlı verileri üzerinde tam kontrole sahiptir:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
            <li><strong>Geçmiş Analizleri Silme:</strong> "Analiz Geçmişi" sayfasından tekil analiz kayıtlarını anında silebilirsiniz.</li>
            <li><strong>Hesap ve Tüm Verileri Silme:</strong> "Kullanıcı Profili" veya "Ayarlar" sayfasından hesabınızı sildiğinizde, hesabınıza ait tüm analizler, anahtar kelime kayıtları ve profil verileri veritabanından kalıcı olarak temizlenir.</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
          <h2 className="text-base font-bold text-white">4. Güvenlik Önlemleri</h2>
          <p>
            Veritabanı erişimlerinde SQL Injection saldırılarına karşı parametreli sorgular kullanılır. Oturum belirteçleri güvenli başlıklarda taşınır. Parolalar en güncel endüstri standardı güvenlik kütüphaneleriyle korunur.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
          <h2 className="text-base font-bold text-white">5. Veri Sorumlusu & İletişim</h2>
          <p>
            Kişisel verilerinizin işlenmesi veya haklarınızın kullanımıyla ilgili talepleriniz için aşağıdaki yer tutucu adres üzerinden ulaşabilirsiniz:
          </p>
          <div className="p-3 rounded-xl bg-[#0F121A] border border-[#1E2433] text-indigo-400 font-mono text-xs">
            E-posta: [GIZLILIK_SORUMLUSU_EPOSTA] / ornek: kvkk@leximind-demo.edu.tr
          </div>
        </section>
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-[#1E2433]">
        <button
          type="button"
          onClick={() => onNavigate('cookies')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
        >
          <span>Çerez Politikasını İncele</span>
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
