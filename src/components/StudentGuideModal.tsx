import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Code2,
  Terminal,
  Cpu,
  Layers,
  GraduationCap,
  Copy,
  Check,
  FolderTree,
  Sliders,
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface StudentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentGuideModal: React.FC<StudentGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'professor' | 'customization' | 'commands' | 'architecture'>('professor');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Üst Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 text-white font-bold text-sm shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Öğrenci & Geliştirici Kılavuzu: Kod Değiştirme ve Sunum Rehberi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hocaya projeyi anlatırken dikkat edilecekler, dosya yapısı ve kod özelleştirme adımları.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sekme Seçici */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('professor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeSection === 'professor'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            1. Hoca Ne İster? (Puanlama Kriterleri)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('customization')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeSection === 'customization'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            2. Kodu Nasıl Değiştirebilirim?
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeSection === 'architecture'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            3. Dosya Haritası & Mimari
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('commands')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeSection === 'commands'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            4. Yerel Çalıştırma Komutları
          </button>
        </div>

        {/* İçerik Alanı */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {activeSection === 'professor' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Hocaya Sunarken Vurgulamanız Gereken 5 Temel NLP Noktası
                </h3>
                <p className="text-xs text-indigo-800 dark:text-indigo-400 mt-1">
                  Hoca projeyi incelerken sahte API mi yoksa gerçek Word2Vec matematiksel modeli mi kullanıldığını sorgulayacaktır:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    Gerçek Gensim Word2Vec Kütüphanesi
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Proje arka planda <code>from gensim.models import Word2Vec</code> motorunu kullanır. Sonuçlar yapay zekadan üretilmiş metinler değil, 100 boyutlu vektörlerin kosinüs benzerliğidir.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    Türkçe Karakter & Dil Ön İşleme
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Python'un hatalı <code>I-i</code> dönüşümü yerine özel <code>'I' -&gt; 'ı'</code> ve <code>'İ' -&gt; 'i'</code> normalizasyonu uygulanır. Stop-word filtreleme ve regex tokenization modülü bulunur.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    Vektör Aritmetiği & Analoji Desteği
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Word2Vec'in en meşhur yeteneği olan <code>Pozitif1 - Negatif + Pozitif2</code> vektör toplamı ve çıkartması (/api/analogy) tam fonksiyoneldir.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                    FastAPI & Flask Çift Web Mimarisi
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Hocanın belirttiği gibi hem FastAPI (asenkron, Uvicorn, Swagger /docs) hem de Flask (WSGI micro-framework) dağıtım seçenekleri hazır ve belgelenmiştir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'customization' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-900 dark:text-emerald-300">
                <strong>Kolay Kod Değiştirme Mimarisi:</strong> Projede tüm ayarlar tek bir dosya altında toplanmıştır: <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">nlp/config.py</code>.
              </div>

              <div className="space-y-3">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">A. Kendi Metin Belgenizi (Derlemi) Eklemek:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    1. <code>data/corpus.txt</code> dosyasını açın ve istediğiniz Türkçe metin cümlelerini ekleyin.<br/>
                    2. İster arayüzdeki <strong>Model Eğitimi</strong> sekmesinden tek tıkla eğitin, isterseniz terminalde <code>python3 scripts/expand_corpus.py</code> komutunu çalıştırın.
                  </p>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">B. Hiperparametreleri Değiştirmek:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    <code>nlp/config.py</code> dosyasındaki <code>DEFAULT_TRAINING_PARAMS</code> sözlüğünden:
                  </p>
                  <pre className="mt-1.5 p-2 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
{`DEFAULT_TRAINING_PARAMS = {
    "vector_size": 100,   # Vektör boyutu (örn: 50, 100, 200, 300)
    "window": 5,          # Bağlam penceresi genişliği
    "min_count": 1,       # Minimum kelime frekansı
    "sg": 1,              # 1 = Skip-gram, 0 = CBOW
    "epochs": 40,         # Tur sayısı
    "seed": 42            # Tekrarlanabilirlik tohumu
}`}
                  </pre>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">C. Yeni Stop-Word Eklemek veya Çıkarmak:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    <code>nlp/config.py</code> içindeki <code>TURKISH_STOP_WORDS</code> kümesine dilediğiniz kelimeyi ekleyebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'architecture' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-indigo-500" />
                Proje Dosya Ağacı ve Görevleri
              </h4>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto space-y-1">
                <div>├── <span className="text-indigo-400 font-bold">nlp/</span></div>
                <div>│   ├── <span className="text-emerald-300">config.py</span>        # ★ Tüm ayarlar ve hiperparametreler tek merkezde</div>
                <div>│   ├── <span className="text-emerald-300">preprocessing.py</span> # Türkçe 'I-i' temizleme, tokenization, stop-words</div>
                <div>│   ├── <span className="text-emerald-300">train.py</span>         # Gensim Word2Vec eğitimi ve benchmark değerlendirmesi</div>
                <div>│   └── <span className="text-emerald-300">service.py</span>       # Singleton NLP servisi (kosinüs, PCA, ağ grafiği)</div>
                <div>├── <span className="text-indigo-400 font-bold">data/</span></div>
                <div>│   ├── <span className="text-cyan-300">corpus.txt</span>        # 330+ zengin Türkçe cümle derlemi (~2.027 kelime)</div>
                <div>│   └── <span className="text-cyan-300">evaluation_set.json</span># Referans değerlendirme kelime çiftleri</div>
                <div>├── <span className="text-indigo-400 font-bold">main.py</span>            # FastAPI REST API sunucusu (Swagger /docs)</div>
                <div>├── <span className="text-indigo-400 font-bold">server.ts</span>          # Node Express ağ geçidi ve statik Vite sunucusu</div>
                <div>└── <span className="text-indigo-400 font-bold">src/</span>               # React + TypeScript kullanıcı arayüzü</div>
              </div>
            </div>
          )}

          {activeSection === 'commands' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                  <span>1. Testleri Çalıştırma (18 Otomatik Birim Testi):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('pytest -v', 'c1')}
                    className="flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-600 cursor-pointer"
                  >
                    {copiedText === 'c1' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>Kopyala</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs">pytest -v</pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                  <span>2. Modeli Terminalden Sıfırdan Eğitme:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('python3 scripts/expand_corpus.py', 'c2')}
                    className="flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-600 cursor-pointer"
                  >
                    {copiedText === 'c2' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>Kopyala</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs">python3 scripts/expand_corpus.py</pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                  <span>3. Geliştirme Sunucusunu Başlatma (Fullstack):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('npm run dev', 'c3')}
                    className="flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-600 cursor-pointer"
                  >
                    {copiedText === 'c3' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>Kopyala</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs">npm run dev</pre>
              </div>
            </div>
          )}
        </div>

        {/* Alt Kısım */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            LexiMind — Akademik Türkçe Semantik Zeka Laboratuvarı
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
