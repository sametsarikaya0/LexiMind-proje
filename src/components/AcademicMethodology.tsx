import React from 'react';
import { BookOpen, Layers, Cpu, Database, AlertTriangle, ShieldCheck, GitBranch, CheckCircle2, Bookmark, Terminal, Compass } from 'lucide-react';

export const AcademicMethodology: React.FC = () => {
  return (
    <div id="academic" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-10 shadow-sm">
      {/* Title */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
          Akademik Metodoloji, Teori & Literatür Kaynakçası
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
          LexiMind: Türkçe Doğal Dil İşleme & Word2Vec Bilimsel Raporu
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Bu doküman, üniversite Doğal Dil İşleme (NLP) dersi müfredatına uygun olarak projenin teorik temellerini,
          Türkçe morfolojik ön işleme kararlarını, yazılım mimarisini, test metodolojisini ve doğrulanabilir akademik referanslarını sunar.
        </p>
      </div>

      {/* 1 & 2: Proje Amacı ve Problem Tanımı */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">1. PROJE BAŞLIĞI VE AMACI</div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Dağılımsal Anlambilim Laboratuvarı</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            LexiMind, Türkçe metinler üzerinde kelimelerin geometrik vektör uzayında temsil edilmesini,
            anlamsal komşuluklarını, vektör analojilerini ve metinlerin ortalama embedding değerlerini
            gerçek Python Gensim Word2Vec kütüphanesiyle hesaplayan uçtan uca bir NLP laboratuvarıdır.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">2. PROBLEM TANIMI & MOTİVASYON</div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Geleneksel Sayısal Temsillerin Yetersizliği</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            One-hot encoding ve temel TF-IDF gibi seyrek (sparse) yöntemlerde kelimeler birbirine diktir (ortogonal).
            &ldquo;bilgisayar&rdquo; ve &ldquo;yazılım&rdquo; arasındaki anlam benzerliği sıfır kabul edilir.
            Dağılımsal hipotez (Distributional Hypothesis) temel alınarak kelimelerin çevrelerindeki bağlamla
            öğrenilmesi bu problemi çözmektedir.
          </p>
        </div>
      </div>

      {/* 3: TF-IDF vs Word2Vec Matrisi */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>3. Geleneksel Seyrek Temsiller (TF-IDF) ile Word2Vec Karşılaştırması</span>
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono">
              <tr>
                <th className="p-3">Kriter</th>
                <th className="p-3">TF-IDF (Term Frequency - Inverse Doc Frequency)</th>
                <th className="p-3">Word2Vec (Skip-gram / CBOW)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-900 dark:text-white font-mono">Vektör Tipi</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">Seyrek (Sparse), V boyutlu (çoğu sıfır)</td>
                <td className="p-3 text-indigo-600 dark:text-indigo-400 font-medium">Yoğun (Dense), d=100 latent boyut</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-900 dark:text-white font-mono">Semantik Yakınlık</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">Ölçülemez (tüm kelime çiftleri birbirine ortogonal)</td>
                <td className="p-3 text-indigo-600 dark:text-indigo-400 font-medium">Kosinüs benzerliği ile sürekli ölçekte ölçülür</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-900 dark:text-white font-mono">Bağlam Penceresi</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">Yok; doküman düzeyinde kelime frekansı</td>
                <td className="p-3 text-indigo-600 dark:text-indigo-400 font-medium">±w pencereli yerel bağlam (n-gram benzeri çevre)</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-900 dark:text-white font-mono">Vektör Aritmetiği</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">Mümkün değildir</td>
                <td className="p-3 text-indigo-600 dark:text-indigo-400 font-medium">v_kral - v_erkek + v_kadın ≈ v_kraliçe analojisi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 & 5: Skip-gram vs CBOW & Matematiksel Formülasyon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">4. MİMARİ SEÇİMİ: SKIP-GRAM (sg=1)</div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Merkez Kelimeden Çevre Kelimelerini Tahmin</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Verilen hedef kelime w(t) üzerinden bağlam penceresindeki w(t+j) kelimelerinin koşullu olasılığı maksimize edilir:
          </p>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 font-mono text-xs text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
            L = ∑_(t=1)^T ∑_(-c ≤ j ≤ c, j≠0) log P(w_(t+j) | w_t)
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Negatif Örnekleme (Negative Sampling): Tüm sözlük yerine sadece k adet sahte kelime güncellenerek hesaplama karmaşıklığı O(V)&apos;den O(k)&apos;ya düşürülür.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">5. KOSİNÜS BENZERLİĞİ & GEOMETRİ</div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Açısal Yakınlık Ölçümü</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            İki kelime vektörü u ve v arasındaki benzerlik vektör normlarından bağımsız olarak hesaplanır:
          </p>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 font-mono text-xs text-purple-600 dark:text-purple-300 border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
            cos(θ) = (u · v) / (||u|| ||v||) ∈ [-1.0, 1.0]
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Ayrıca 2D görselleştirme için Tekil Değer Ayrışımı (SVD) kullanılarak d boyutlu uzay Temel Bileşen Analizi (PCA) ile varyansı maksimize eden ilk 2 boyuta izdüşürülür.
          </p>
        </div>
      </div>

      {/* 6: Türkçe Dil Ön İşleme & Sondan Eklemeli Yapı */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">6. Türkçe Dil Ön İşleme Kararları & Morfolojik Özellikler</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">Özel Harf Normalizasyonu</span>
            Türkçe &lsquo;İ&rsquo; harfi standart Python lower() ile &lsquo;i&rsquo; yerine &lsquo;i\u0307&rsquo; veya hatalı dönüşebileceğinden, &lsquo;İ&rsquo;→&lsquo;i&rsquo; ve &lsquo;I&rsquo;→&lsquo;ı&rsquo; dönüşümleri özel unicode mapping ile garantiye alınmıştır.
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">Sondan Eklemeli Yapı</span>
            Türkçe sondan eklemeli bir dildir. Stemmer/lemmatizer kullanılmadığında &lsquo;kitap&rsquo;, &lsquo;kitabın&rsquo;, &lsquo;kitaplar&rsquo; ayrı vektörler olur. Bu durum kelime dağarcığını büyütür ancak morfolojik bağlamı korur.
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">Seçici Stop-word Yönetimi</span>
            Tüm bağlaçların körlemesine silinmesi cümle yapısını bozar. Model eğitiminde cümle akışını korumak için stop-word&apos;ler derlemde tutulmuş, metin frekans özetinde opsiyonel filtrelenmiştir.
          </div>
        </div>
      </div>

      {/* 7: Yazılım Mimarisi */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">7. Yazılım Mimarisi (Separation of Concerns)</h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Proje katmanlı bir mimariye sahiptir:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
            <strong className="text-indigo-600 dark:text-indigo-400 block">FastAPI Backend</strong>
            Pydantic şemaları, RESTful endpoint&apos;ler, CORS ve HTTP hata yönetimi.
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
            <strong className="text-indigo-600 dark:text-indigo-400 block">NLP Servis Katmanı</strong>
            Gensim Word2Vec singleton bellekte tutulur, her istekte model yeniden eğitilmez.
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
            <strong className="text-purple-600 dark:text-purple-400 block">Pytest Süiti</strong>
            18 adet otomatik birim, entegrasyon ve sınır testiyle tam doğrulama.
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
            <strong className="text-emerald-600 dark:text-emerald-400 block">React 19 & Tailwind</strong>
            5 tema, reaktif durum yönetimi, erişilebilir formlar.
          </div>
        </div>
      </div>

      {/* 8: Sınırlılıklar ve Etik */}
      <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-slate-700 dark:text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>8. Model Sınırlılıkları ve Algoritmik Önyargı (Bias)</span>
        </div>
        <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
          <li><strong>Statik Vektör Kısıtı:</strong> Word2Vec eş sesli kelimeleri (ör. &ldquo;yüz&rdquo; = sayı vs. surat) tek bir vektörde birleştirir. BERT gibi bağlamsal modeller bu kısıtı giderir.</li>
          <li><strong>Derlem Taraflılığı (Corpus Bias):</strong> Word2Vec doğrudan derlemdeki kelime eş-oluşumlarını yansıttığından, eğitim metnindeki toplumsal cinsiyet veya kültürel önyargılar vektör uzayına yansır.</li>
          <li><strong>Dağarcık Dışı (OOV) Kelimeler:</strong> Eğitim sırasında görülmeyen yeni kelimeler için vektör üretilemez; kontrollü 404 yanıtı ve yakın öneriler sunulur.</li>
        </ul>
      </div>

      {/* 9: Doğrulanabilir Akademik Referanslar */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>9. Doğrulanabilir Bilimsel Kaynakça (References)</span>
        </div>
        <ol className="text-xs text-slate-500 dark:text-slate-400 space-y-2 font-mono leading-relaxed list-decimal list-inside">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Mikolov, T., Chen, K., Corrado, G., & Dean, J. (2013a).</strong> Efficient estimation of word representations in vector space. <em>arXiv preprint arXiv:1301.3781</em>.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Mikolov, T., Sutskever, I., Chen, K., Corrado, G. S., & Dean, J. (2013b).</strong> Distributed representations of words and phrases and their compositionality. <em>Advances in Neural Information Processing Systems (NeurIPS 2013)</em>, 26.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Řehůřek, R., & Sojka, P. (2010).</strong> Software Framework for Topic Modelling with Large Corpora. <em>In Proceedings of the LREC 2010 Workshop on New Challenges for NLP Frameworks</em>, pp. 45–50.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Firth, J. R. (1957).</strong> A synopsis of linguistic theory, 1930-1955. <em>Studies in Linguistic Analysis</em>, Philological Society, Oxford.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Harris, Z. S. (1954).</strong> Distributional structure. <em>Word</em>, 10(2-3), 146-162.
          </li>
        </ol>
      </div>
    </div>
  );
};
