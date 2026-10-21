import React from 'react';
import { FileText, Shield, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageRoute } from '../types';

interface TermsPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  const lastUpdated = '14 Ekim 2026';

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-[#1E2433] pb-6">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
          <FileText className="w-4 h-4" />
          <span>Yasal Bildirimler</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Kullanım Koşulları (Terms of Service)
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Son Güncelleme: {lastUpdated} • Üniversite Doğal Dil İşleme (NLP) Akademik Projesi
        </p>
      </div>

      {/* Önemli Uyarı Kutusu */}
      <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-600/30 text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
        <div>
          <strong>Akademik ve Hesaplamalı Sonuç Uyarısı:</strong> LexiMind tarafından üretilen anahtar kelimeler,
          tamlama skorları ve Gensim Word2Vec anlamsal benzerlik değerleri algoritmik istatistiksel hesaplamalardır.
          Nihai akademik değerlendirmelerin, makale özetlerinin ve literatür taramalarının mutlaka araştırmacı (insan)
          tarafından gözden geçirilmesi gerekmektedir.
        </div>
      </div>

      {/* İçerik Maddeleri */}
      <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>1. Hizmetin Amacı ve Kapsamı</span>
          </h2>
          <p>
            LexiMind platformu, akademik makalelerin, tezlerin ve Türkçe bilimsel metinlerin doğal dil işleme (NLP)
            yöntemleriyle taranması, önemli kavram ve tamlamaların çıkarılması ve Gensim Word2Vec gömme uzayında semantik
            ilişkilerin görselleştirilmesi amacıyla geliştirilmiş üniversite düzeyinde bir eğitim ve araştırma projesidir.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
          <h2 className="text-base font-bold text-white">2. Kabul Edilebilir Kullanım ve Yüklenen İçerikler</h2>
          <p>
            Kullanıcılar sisteme PDF, DOCX ve TXT formatlarında makale ve metin yükleyebilirler. Kullanıcı, yüklediği belgelerin
            yasal haklarına sahip olduğunu veya akademik inceleme amacıyla adil kullanım sınırları içinde hareket ettiğini kabul eder.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
            <li>Kişisel veri, hassas sağlık verisi veya gizli devlet belgesi yüklenmesi yasaktır.</li>
            <li>Zararlı yazılım, kötü niyetli makrolar veya bozuk dosya manipülasyonları engellenir.</li>
            <li>Platformun sunucu kaynaklarını kasıtlı olarak tüketmeye yönelik otomatik bot sorguları yasaktır.</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
          <h2 className="text-base font-bold text-white">3. Fikri Mülkiyet ve Telif Hakları</h2>
          <p>
            Kullanıcı tarafından sisteme yüklenen veya yapıştırılan makale metinlerinin telif hakları orijinal yazarlarına ve/veya
            yayıncılarına aittir. LexiMind, yüklenen makalelerin mülkiyetini talep etmez. Sistem yalnızca metin çıkarımı ve
            anahtar kelime analizi için geçici işlem yapar; orijinal dosyalar disk üzerinde kalıcı olarak depolanmaz.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
          <h2 className="text-base font-bold text-white">4. Hesap Güvenliği ve Fesih</h2>
          <p>
            Kullanıcılar hesap kimlik bilgilerinin güvenliğini sağlamaktan kendileri sorumludur. Parolalar sunucu tarafında
            kriptografik tuzlama (salt) ve güçlü özetleme algoritmaları (Bcrypt) ile saklanır. Kullanıcı dilediği an profil
            veya ayarlar sayfasından hesabını ve geçmişini tamamen silebilir.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
          <h2 className="text-base font-bold text-white">5. İletişim Bilgileri</h2>
          <p>
            Bu akademik platform ile ilgili her türlü soru, telif hakkı bildirimi ve teknik geri bildirim için proje koordinatörüyle
            aşağıdaki yer tutucu adres üzerinden iletişime geçebilirsiniz:
          </p>
          <div className="p-3 rounded-xl bg-[#0F121A] border border-[#1E2433] text-indigo-400 font-mono text-xs">
            E-posta: [PROJE_YONETICISI_EPOSTA] / ornek: nlp-destek@leximind-demo.edu.tr
          </div>
        </section>
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-[#1E2433]">
        <button
          type="button"
          onClick={() => onNavigate('privacy')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
        >
          <span>Gizlilik Politikasını İncele</span>
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
