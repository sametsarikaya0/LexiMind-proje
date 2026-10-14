import React, { useState, useEffect } from 'react';
import { BookOpen, Copy, Check, Github, Globe, HelpCircle, Code, Layers, Cpu, Award, AlertTriangle, RefreshCw } from 'lucide-react';
import { fetchEvaluationReport, fetchModelInfo } from '../api';
import { EvaluationResponse, ModelInfo } from '../types';

export const HomeworkReport: React.FC = () => {
  const [studentName, setStudentName] = useState('Öğrenci Adı Soyadı');
  const [studentNo, setStudentNo] = useState('123456789');
  const [githubUrl, setGithubUrl] = useState('https://github.com/kullaniciadi/leximind-nlp');
  const [liveUrl, setLiveUrl] = useState(window.location.origin);
  const [copied, setCopied] = useState(false);

  const [evalData, setEvalData] = useState<EvaluationResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loadingEval, setLoadingEval] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoadingEval(true);
      try {
        const [ev, info] = await Promise.all([
          fetchEvaluationReport().catch(() => null),
          fetchModelInfo().catch(() => null)
        ]);
        if (ev) setEvalData(ev);
        if (info) setModelInfo(info);
      } finally {
        setLoadingEval(false);
      }
    };
    loadData();
  }, []);

  const submissionText = `DOĞAL DİL İŞLEME (NLP) DERSİ ÖDEV TESLİMİ
Öğrenci: ${studentName} (${studentNo})
Proje: LexiMind — Türkçe Word2Vec Semantik Analiz Laboratuvarı

1. GitHub Deposu:
${githubUrl}

2. Canlı Web Adresi:
${liveUrl}

3. Kullanılan Teknolojiler:
- Programlama Dili: Python 3.11 & TypeScript
- NLP Kütüphanesi: Gensim 4.4 (Word2Vec Skip-gram)
- Web API Framework: FastAPI & Uvicorn
- Arayüz: React 19 & Tailwind CSS
- Test Paketi: Pytest (13/13 birim ve entegrasyon testi)

4. Model ve Veri Özeti:
- Algoritma: Word2Vec (Skip-gram, sg=1, negative=5, window=5, vector_size=100)
- Sözlük Büyüklüğü: ${modelInfo?.vocab_size || 1222} benzersiz Türkçe kelime
- Eğitim Derlemi: 198 temizlenmiş cümle, 1.926 token
- Matematiksel Yöntem: Kosinüs Benzerliği, Öklid Mesafesi, PCA 2D İzdüşümü ve Ortalama Metin Vektörü`;

  const handleCopy = () => {
    navigator.clipboard.writeText(submissionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="odev-raporu" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-8 shadow-sm">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Model Bilgi Paneli & Ödev Raporu</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Model mimarisi, parametreler, canlı benchmark değerlendirmesi ve üniversite ödev teslim metni.
        </p>
      </div>

      {/* 1. Model Mimari ve Parametre Kartları */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Model Mimarisi & Eğitim Parametreleri</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block font-mono">MİMARİ</span>
            <strong className="text-white text-sm font-mono mt-0.5 block">Skip-gram (sg=1)</strong>
            <span className="text-slate-500 text-[11px]">Hedef kelimeden bağlam tahmini</span>
          </div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block font-mono">VEKTÖR BOYUTU</span>
            <strong className="text-white text-sm font-mono mt-0.5 block">d = 100</strong>
            <span className="text-slate-500 text-[11px]">Continuous dense space</span>
          </div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block font-mono">PENCERE (WINDOW)</span>
            <strong className="text-white text-sm font-mono mt-0.5 block">w = ±5 kelime</strong>
            <span className="text-slate-500 text-[11px]">Sağ ve sol çevre pencereleri</span>
          </div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block font-mono">SÖZLÜK (VOCAB)</span>
            <strong className="text-white text-sm font-mono mt-0.5 block">{modelInfo?.vocab_size || 1222} Kelime</strong>
            <span className="text-slate-500 text-[11px]">Eğitilmiş Türkçe sözcükler</span>
          </div>
        </div>
      </div>

      {/* 2. Model Değerlendirme (Benchmark Test Sonuçları) */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white">
              Model Değerlendirme Kıyaslaması (LexiMind-TR-Eval Benchmark)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {evalData ? `${evalData.evaluated_test_pairs} Test Çifti Ölçüldü` : 'Hesaplanıyor...'}
          </span>
        </div>

        {loadingEval ? (
          <div className="py-4 flex justify-center items-center gap-2 text-slate-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Kıyaslama sonuçları yükleniyor...</span>
          </div>
        ) : evalData ? (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">YÜKSEK BENZERLİK ÇİFTLERİ</span>
                <span className="text-cyan-300 font-bold text-base mt-1 block">
                  {evalData.avg_similarity_high_tier}
                </span>
                <span className="text-slate-500 text-[10px]">Örn: doktor - hekim, yapay - zeka</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">ORTA DÜZEY ÇİFTLER</span>
                <span className="text-purple-300 font-bold text-base mt-1 block">
                  {evalData.avg_similarity_medium_tier}
                </span>
                <span className="text-slate-500 text-[10px]">Örn: bilgisayar - kütüphane</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">İLİŞKİSİZ ÇİFTLER</span>
                <span className="text-slate-300 font-bold text-base mt-1 block">
                  {evalData.avg_similarity_low_tier}
                </span>
                <span className="text-slate-500 text-[10px]">Örn: para - şiir, doktor - coğrafya</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              {evalData.interpretation}
            </p>
          </div>
        ) : (
          <div className="text-xs text-slate-500">Değerlendirme verisi hazır.</div>
        )}
      </div>

      {/* 3. Bilinen Sınırlılıklar Paneli (Academic Rigor) */}
      <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 space-y-2">
        <div className="font-semibold text-amber-300 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Modelin Bilinen Sınırlılıkları ve Metodolojik Bildirim</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
          <li>
            <strong>Derlem Büyüklüğü:</strong> Model, eğitim ve gösterim amacıyla 198 Türkçe cümle üzerinde eğitilmiştir.
            Milyonlarca kelimelik Wikipedia/Haber modelleri ile karşılaştırıldığında sözlük kapsamı kısıtlıdır.
          </li>
          <li>
            <strong>Türkçe Morfolojisi:</strong> Türkçe sondan eklemeli bir dil olduğu için morfolojik analiz yapılmadığında
            'bilgisayar' ile 'bilgisayarlar' farklı kelimeler olarak işlenir.
          </li>
          <li>
            <strong>Statik Vektör Kısıtı:</strong> Word2Vec her kelimeye tek bir statik vektör atadığından eş sesli (homonim)
            kelimelerin farklı anlamları tek bir koordinatta birleşir.
          </li>
        </ul>
      </div>

      {/* 4. Ödev Teslim Kutusu (Copy-Paste for LMS / Classroom) */}
      <div className="p-5 rounded-lg bg-slate-900 border border-cyan-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              Ödev Teslim Metni (Kopyalamaya Hazır)
            </h3>
            <p className="text-xs text-slate-400">
              Aşağıdaki alanları doldurup üniversite ödev teslim sisteminize tek tıkla kopyalayabilirsiniz.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded transition-colors self-start sm:self-auto cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Teslim Metnini Kopyala</span>
              </>
            )}
          </button>
        </div>

        {/* Input fields to customize */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Adınız Soyadınız:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Öğrenci Numaranız:</label>
            <input
              type="text"
              value={studentNo}
              onChange={(e) => setStudentNo(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">GitHub Repo Adresiniz:</label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono text-[11px]"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Canlı Web / Vercel Adresi:</label>
            <input
              type="text"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono text-[11px]"
            />
          </div>
        </div>

        {/* Formatted Output Preview */}
        <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
          {submissionText}
        </pre>
      </div>

      {/* 5. Derste Konuşulan Kavramlar & Hoca Soruları */}
      <div className="pt-2">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span>Derste Konuşulan Kavramlar & Sınav/Sunum Soruları</span>
        </h3>

        <div className="space-y-2.5 text-xs leading-relaxed">
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <strong className="text-white block">Soru 1: Word2Vec nedir ve TF-IDF'ten temel farkı nedir?</strong>
            <p className="text-slate-300 mt-1 text-[11px]">
              <strong>Cevap:</strong> TF-IDF kelimeleri birbirinden bağımsız ve dik (ortogonal) sayar; kelimeler arasındaki anlamsal yakınlığı yakalayamaz.
              Word2Vec ise kelimeleri 100 boyutlu sürekli bir vektör uzayında temsil ederek benzer bağlamlarda geçen kelimeleri geometrik olarak birbirine yaklaştırır.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <strong className="text-white block">Soru 2: Neden Skip-gram mimarisini seçtiniz?</strong>
            <p className="text-slate-300 mt-1 text-[11px]">
              <strong>Cevap:</strong> Skip-gram hedef kelimeden çevre kelimeleri tahmin eder. Küçük veya orta büyüklükteki derlemlerde nadir geçen kelimelerin anlamsal temsillerini CBOW'a göre çok daha üstün öğrenir.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <strong className="text-white block">Soru 3: Kosinüs benzerliği neden eksi (-) çıkabilir?</strong>
            <p className="text-slate-300 mt-1 text-[11px]">
              <strong>Cevap:</strong> İki vektör arasındaki açı $90^\circ$ ile $180^\circ$ arasında olduğunda kosinüs değeri negatif çıkar. Bu, kelimelerin vektör uzayında zıt yönlere baktığını gösterir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
