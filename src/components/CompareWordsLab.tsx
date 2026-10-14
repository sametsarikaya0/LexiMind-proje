import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Scale, Info, AlertCircle, RefreshCw } from 'lucide-react';
import { compareWords } from '../api';
import { CompareWordsResponse } from '../types';

interface CompareWordsLabProps {
  initialWord1?: string;
  initialWord2?: string;
}

const COMPARISON_PRESETS = [
  { w1: 'bilgisayar', w2: 'yazılım', desc: 'Teknoloji' },
  { w1: 'doktor', w2: 'hastane', desc: 'Sağlık' },
  { w1: 'felsefe', w2: 'akıl', desc: 'Düşünce' },
  { w1: 'öğrenci', w2: 'üniversite', desc: 'Akademi' },
  { w1: 'güneş', w2: 'ay', desc: 'Doğa' },
  { w1: 'yapay', w2: 'zeka', desc: 'Bilişim' },
];

export const CompareWordsLab: React.FC<CompareWordsLabProps> = ({
  initialWord1 = 'bilgisayar',
  initialWord2 = 'yazılım',
}) => {
  const [word1, setWord1] = useState(initialWord1);
  const [word2, setWord2] = useState(initialWord2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareWordsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialWord1 && initialWord2) {
      setWord1(initialWord1);
      setWord2(initialWord2);
      handleCompare(initialWord1, initialWord2);
    }
  }, [initialWord1, initialWord2]);

  const handleCompare = async (w1 = word1, w2 = word2) => {
    const q1 = w1.trim();
    const q2 = w2.trim();
    if (!q1 || !q2) {
      setError('Lütfen karşılaştırılacak iki kelimeyi de giriniz.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await compareWords(q1, q2);
      setResult(data);
      if (!data.success) {
        setError(data.message || 'Kelimeler karşılaştırılamadı.');
      }
    } catch (err: any) {
      setError(err.message || 'Karşılaştırma sırasında bir hata oluştu.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = word1;
    setWord1(word2);
    setWord2(temp);
    if (result) {
      handleCompare(word2, temp);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>İki Kelimeyi Karşılaştırma (Kosinüs Benzerliği)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Gensim Word2Vec <code className="text-indigo-600 dark:text-indigo-400 font-mono">model.wv.similarity(kelime1, kelime2)</code> fonksiyonu ile iki vektör arasındaki açıyı hesaplar.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Örnek İkililer:</span>
        {COMPARISON_PRESETS.map((p) => (
          <button
            key={`${p.w1}-${p.w2}`}
            type="button"
            onClick={() => {
              setWord1(p.w1);
              setWord2(p.w2);
              handleCompare(p.w1, p.w2);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors font-mono cursor-pointer"
          >
            {p.w1} ↔ {p.w2}
          </button>
        ))}
      </div>

      {/* Form Fields */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCompare();
        }}
        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
      >
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">1. Kelime</label>
          <input
            type="text"
            value={word1}
            onChange={(e) => setWord1(e.target.value)}
            placeholder="Örn: bilgisayar"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="md:col-span-2 flex justify-center pt-2 md:pt-5">
          <button
            type="button"
            onClick={handleSwap}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Kelimeleri değiştir"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">2. Kelime</label>
          <input
            type="text"
            value={word2}
            onChange={(e) => setWord2(e.target.value)}
            placeholder="Örn: yazılım"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="md:col-span-12 mt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Hesaplanıyor...</span>
              </>
            ) : (
              <>
                <Scale className="w-4 h-4" />
                <span>Benzerlik Skorunu Hesapla</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Results */}
      {result?.success && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Kosinüs Benzerliği [cos(θ)]</div>
              <div className="mt-1 text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                {result.cosine_similarity > 0 ? `+${result.cosine_similarity.toFixed(4)}` : result.cosine_similarity.toFixed(4)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Aralık: -1.0 ile +1.0 arası</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Öklid Mesafesi (L2)</div>
              <div className="mt-1 text-2xl font-bold font-mono text-slate-900 dark:text-slate-200 tabular-nums">
                {result.euclidean_distance.toFixed(4)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Vektörler arası geometrik uzaklık</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">İlişki Düzeyi</div>
              <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {result.relation_level}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Bağlamsal yakınlık sınıfı</div>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Anlamsal Değerlendirme</span>
            </div>
            <p className="leading-relaxed">{result.interpretation}</p>
          </div>

          {/* Academic note */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong className="font-bold">Ders Notu / Uyarı: </strong>
            Kosinüs benzerliği n-boyutlu uzayda vektörler arasındaki açısal yönelimi gösterir. Bu sayısal değer kelimelerin
            %100 eşit olduğunu değil, eğitim metinlerinde benzer çevre kelimeleriyle birlikte geçtiğini ifade eder.
          </div>
        </div>
      )}
    </div>
  );
};
