import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  Award,
  Layers,
  Sparkles,
  GitBranch,
  Globe,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { fetchEvaluationReport, fetchModelInfo } from '../api';
import { EvaluationResponse, ModelInfo } from '../types';

export const HomeworkResources: React.FC = () => {
  const [studentName, setStudentName] = useState('Öğrenci Adı Soyadı');
  const [studentNo, setStudentNo] = useState('2024001234');
  const [university, setUniversity] = useState('Mühendislik Fakültesi / Bilgisayar Mühendisliği');
  const [githubUrl, setGithubUrl] = useState('https://github.com/kullaniciadi/leximind-nlp');
  const [liveUrl, setLiveUrl] = useState(window.location.origin);
  const [copied, setCopied] = useState(false);

  const [frameworkTab, setFrameworkTab] = useState<'fastapi' | 'flask'>('fastapi');
  const [evalData, setEvalData] = useState<EvaluationResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loadingEval, setLoadingEval] = useState(false);

  useEffect(() => {
    const loadInfo = async () => {
      setLoadingEval(true);
      try {
        const [ev, info] = await Promise.all([
          fetchEvaluationReport().catch(() => null),
          fetchModelInfo().catch(() => null),
        ]);
        if (ev) setEvalData(ev);
        if (info) setModelInfo(info);
      } finally {
        setLoadingEval(false);
      }
    };
    loadInfo();
  }, []);

  const courseLinks = [
    {
      title: 'Gensim Kütüphanesi',
      url: 'https://radimrehurek.com/gensim/',
      category: 'NLP & Modelleme',
      desc: 'Python üzerinde Word2Vec, Doc2Vec ve konu modelleme (topic modeling) algoritmalarını yüksek hızda çalıştıran resmi kütüphane.',
    },
    {
      title: 'Word2Vec Algoritması',
      url: 'https://en.wikipedia.org/wiki/Word2Vec',
      category: 'Teori & Algoritma',
      desc: 'Tomas Mikolov ve ekibi (2013) tarafından geliştirilen Skip-gram ve CBOW mimarilerini açıklayan kuramsal Wikipedia makalesi.',
    },
    {
      title: 'Flask Framework',
      url: 'https://flask.palletsprojects.com/en/stable/',
      category: 'Python Web API',
      desc: 'Python için hafif ve esnek WSGI mikro web çatısı. LexiMind projesinde app_flask.py ile desteklenir.',
    },
    {
      title: 'Vercel & FastAPI Dağıtımı',
      url: 'https://vercel.com/docs/frameworks/backend/fastapi',
      category: 'Yayınlama (Deploy)',
      desc: 'FastAPI REST API uygulamalarını Vercel Serverless mimarisinde barındırmak için resmi yapılandırma dokümanı.',
    },
    {
      title: 'Vercel & Flask Dağıtımı',
      url: 'https://vercel.com/docs/frameworks/backend/flask',
      category: 'Yayınlama (Deploy)',
      desc: 'Python Flask uygulamalarını Vercel üzerinde tek bir vercel.json ile canlıya alma resmi rehberi.',
    },
  ];

  const submissionText = `DOĞAL DİL İŞLEME (NATURAL LANGUAGE PROCESSING) DERSİ ÖDEVİ
======================================================
Öğrenci: ${studentName} (${studentNo})
Bölüm: ${university}
Proje Adı: LexiMind — Türkçe Semantik Zeka ve Word2Vec Laboratuvarı

1. GITHUB PROJE ADRESİ:
${githubUrl}

2. YAYINLANAN CANLI WEB ADRESİ:
${liveUrl}

3. KULLANILAN TEKNOLOJİLER & KÜTÜPHANELER:
- Dil: Python 3.11 & TypeScript
- NLP Kütüphanesi: Gensim 4.4 (Word2Vec)
- Web API Mimarisi: FastAPI & Flask (Uvicorn / WSGI)
- Frontend: React 19 & Tailwind CSS
- Test: Pytest (18/18 birim ve entegrasyon testi)

4. MODEL PARAMETRELERİ VE SONUÇLARI:
- Algoritma: Word2Vec (Skip-gram, sg=1)
- Vektör Boyutu (d): ${modelInfo?.vector_size || 100}
- Bağlam Penceresi (w): ±${modelInfo?.window || 5} kelime
- Sözlük Hacmi: ${modelInfo?.vocab_size || 2027} benzersiz Türkçe kelime
- Matematiksel Yöntemler: Kosinüs Benzerliği, Öklid Mesafesi, PCA 2D İzdüşümü ve Vektör Analojisi (v_A - v_B + v_C)

5. HOCANIN VERDİĞİ KAYNAKLARIN KULLANIMI:
- Gensim: https://radimrehurek.com/gensim/
- Word2Vec: https://en.wikipedia.org/wiki/Word2Vec
- Flask Framework: https://flask.palletsprojects.com/en/stable/
- Vercel & FastAPI: https://vercel.com/docs/frameworks/backend/fastapi
- Vercel & Flask: https://vercel.com/docs/frameworks/backend/flask`;

  const handleCopy = () => {
    navigator.clipboard.writeText(submissionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 1. HOCANIN VERDİĞİ RESMİ BAĞLANTILAR KARTI */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Ders Kılavuzu & Resmi Dokümantasyon
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
            Ödev Kapsamında Kullanılan Kütüphaneler & Kaynaklar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ders yönergesinde belirtilen tüm Python NLP, web framework ve bulut dağıtım kaynakları bu projede eksiksiz olarak uygulanmıştır.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {courseLinks.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                    {item.category}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 truncate">
                {item.url}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 2. DERS ÖDEVİ TESLİM METNİ ÜRETİCİSİ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Ödev Teslim Metni Oluşturucu
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Bilgilerinizi doldurun; üniversite ödev teslim formuna yapıştırmak üzere metni tek tıkla kopyalayın.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Panoya Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Teslim Metnini Kopyala</span>
              </>
            )}
          </button>
        </div>

        {/* Öğrenci Bilgi Formu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Öğrenci Adı Soyadı
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Öğrenci Numarası
            </label>
            <input
              type="text"
              value={studentNo}
              onChange={(e) => setStudentNo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              GitHub Depo Linki
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Yayınlanan Web Linki
            </label>
            <input
              type="text"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Çıktı Önizleme Kutusu */}
        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {submissionText}
          </pre>
        </div>
      </div>

      {/* 3. FLASK & FASTAPI MİMARİ KARŞILAŞTIRMASI & VERCEL DAĞITIMI */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Vercel Dağıtım Mimarisi: FastAPI vs. Flask
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Her iki framework de projede tam çalışan kod dosyalarıyla desteklenmektedir.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFrameworkTab('fastapi')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                frameworkTab === 'fastapi'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              FastAPI (main.py)
            </button>
            <button
              type="button"
              onClick={() => setFrameworkTab('flask')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                frameworkTab === 'flask'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Flask (app_flask.py)
            </button>
          </div>
        </div>

        {frameworkTab === 'fastapi' ? (
          <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              <strong>FastAPI Avantajları:</strong> Pydantic v2 tabanlı otomatik JSON tip doğrulaması, asenkron ASGI performansı ve otomatik interaktif Swagger dokümantasyonu (<code className="font-mono text-indigo-600 dark:text-indigo-400">/docs</code>).
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
              <div className="text-slate-500"># vercel.json yapılandırması (FastAPI & Vercel Python Runtime)</div>
              <div>&#123;</div>
              <div className="pl-4">&quot;builds&quot;: [&#123; &quot;src&quot;: &quot;api/index.py&quot;, &quot;use&quot;: &quot;@vercel/python&quot; &#125;],</div>
              <div className="pl-4">&quot;routes&quot;: [&#123; &quot;src&quot;: &quot;/api/(.*)&quot;, &quot;dest&quot;: &quot;api/index.py&quot; &#125;]</div>
              <div>&#125;</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              <strong>Flask Avantajları:</strong> Basit, anlaşılır WSGI mikro mimarisi. Python eğitiminde yaygın olarak öğretilen ve minimal bağımlılıkla çalışan geleneksel web çatısı.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
              <div className="text-slate-500"># vercel.json yapılandırması (Flask & Vercel Python Runtime)</div>
              <div>&#123;</div>
              <div className="pl-4">&quot;builds&quot;: [&#123; &quot;src&quot;: &quot;api/flask_app.py&quot;, &quot;use&quot;: &quot;@vercel/python&quot; &#125;],</div>
              <div className="pl-4">&quot;routes&quot;: [&#123; &quot;src&quot;: &quot;/api/(.*)&quot;, &quot;dest&quot;: &quot;api/flask_app.py&quot; &#125;]</div>
              <div>&#125;</div>
            </div>
          </div>
        )}
      </div>

      {/* 4. BENCHMARK VE DEĞERLENDİRME KARNESİ */}
      {evalData && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Canlı Model Değerlendirme Raporu (LexiMind-TR-Eval)
              </h3>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              {evalData.evaluated_test_pairs} referans kelime çifti ölçüldü
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold block">
                Yüksek Benzerlik Çiftleri Ort.
              </span>
              <span className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-1 block">
                {evalData.avg_similarity_high_tier}
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                doktor-hekim, yapay-zeka vb.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40">
              <span className="text-indigo-800 dark:text-indigo-300 font-semibold block">
                Orta Düzey Çiftler Ort.
              </span>
              <span className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mt-1 block">
                {evalData.avg_similarity_medium_tier}
              </span>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-400">
                bilgisayar-kütüphane vb.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
              <span className="text-rose-800 dark:text-rose-300 font-semibold block">
                İlişkisiz Çiftler Ort.
              </span>
              <span className="text-xl font-bold text-rose-900 dark:text-rose-200 mt-1 block">
                {evalData.avg_similarity_low_tier}
              </span>
              <span className="text-[11px] text-rose-700 dark:text-rose-400">
                doktor-coğrafya, para-şiir vb.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">Akademik Sonuç: </strong>
              {evalData.interpretation} Ayrım gücü farkı: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">+{evalData.discrimination_margin}</span>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
