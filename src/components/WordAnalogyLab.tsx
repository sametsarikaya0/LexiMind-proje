import React, { useState } from 'react';
import { calculateAnalogy } from '../api';
import { AnalogyResponse } from '../types';
import { Sparkles, Plus, Minus, ArrowRight, HelpCircle, Loader2, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

interface WordAnalogyLabProps {
  onSelectWord?: (word: string) => void;
  onCompareWith?: (w1: string, w2: string) => void;
}

export const WordAnalogyLab: React.FC<WordAnalogyLabProps> = ({ onSelectWord, onCompareWith }) => {
  const [positiveWord1, setPositiveWord1] = useState<string>('bilgisayar');
  const [negativeWord, setNegativeWord] = useState<string>('donanım');
  const [positiveWord2, setPositiveWord2] = useState<string>('algoritma');
  const [topN, setTopN] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalogyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      title: 'Yazılım ve Donanım',
      p1: 'bilgisayar',
      neg: 'donanım',
      p2: 'yazılım',
      note: 'Teknoloji bileşen analojisi',
    },
    {
      title: 'Meslek & Kurum',
      p1: 'doktor',
      neg: 'hastane',
      p2: 'okul',
      note: 'Kurumsal bağlam analojisi',
    },
    {
      title: 'Bilim & Teori',
      p1: 'fizik',
      neg: 'deney',
      p2: 'felsefe',
      note: 'Düşünce ve yöntem analojisi',
    },
    {
      title: 'Yapay Zeka & Veri',
      p1: 'öğrenme',
      neg: 'insan',
      p2: 'makine',
      note: 'Sistemik öğrenme analojisi',
    },
  ];

  const handleRunAnalogy = async (p1 = positiveWord1, neg = negativeWord, p2 = positiveWord2) => {
    if (!p1.trim() || !p2.trim()) {
      setError('En az iki pozitif kelime belirtilmelidir.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const posList = [p1.trim(), p2.trim()];
    const negList = neg.trim() ? [neg.trim()] : [];

    try {
      const data = await calculateAnalogy(posList, negList, topN);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Analoji hesaplaması sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setPositiveWord1(preset.p1);
    setNegativeWord(preset.neg);
    setPositiveWord2(preset.p2);
    handleRunAnalogy(preset.p1, preset.neg, preset.p2);
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Açıklama */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vektör Aritmetiği & Doğrusal Kompozisyon</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Kelime İlişki & Analoji Gezgini
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Word2Vec modelinin en dikkat çekici özelliklerinden biri olan vektör toplamı ve farkı
              üzerinden semantik analojileri inceleyin. Matematiksel formül: <span className="font-mono text-cyan-300">v_hedef ≈ (v_A - v_B) + v_C</span>.
            </p>
          </div>

          {/* Hızlı Şablonlar */}
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analoji Denklem Girdisi */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
          {/* Kelime A (Pozitif) */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pozitif Referans (Kelime A)</span>
            </label>
            <input
              type="text"
              value={positiveWord1}
              onChange={(e) => setPositiveWord1(e.target.value)}
              placeholder="ör. bilgisayar"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Eksi İşareti */}
          <div className="flex items-center justify-center pt-4 md:pt-6 text-slate-500 font-bold text-lg">
            <Minus className="w-5 h-5 text-rose-400" />
          </div>

          {/* Kelime B (Negatif) */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Minus className="w-3.5 h-3.5 text-rose-400" />
              <span>Çıkarılacak Boyut (Kelime B)</span>
            </label>
            <input
              type="text"
              value={negativeWord}
              onChange={(e) => setNegativeWord(e.target.value)}
              placeholder="ör. donanım"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Artı İşareti */}
          <div className="flex items-center justify-center pt-4 md:pt-6 text-slate-500 font-bold text-lg">
            <Plus className="w-5 h-5 text-emerald-400" />
          </div>

          {/* Kelime C (Pozitif) */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Eklenecek Hedef (Kelime C)</span>
            </label>
            <input
              type="text"
              value={positiveWord2}
              onChange={(e) => setPositiveWord2(e.target.value)}
              placeholder="ör. yazılım"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Kontrol Çubuğu */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-400 whitespace-nowrap">Sonuç Sayısı (K):</span>
            <input
              type="range"
              min="1"
              max="15"
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value, 10))}
              className="w-32 accent-cyan-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-cyan-400 w-6">{topN}</span>
          </div>

          <button
            type="button"
            onClick={() => handleRunAnalogy()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Hesaplanıyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analojiyi Çözümle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hata Durumu */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold">İşlem Başarısız</p>
            <p className="text-xs mt-0.5 text-rose-400">{error}</p>
          </div>
        </div>
      )}

      {/* Kelime Bulunamadı Durumu */}
      {result && !result.success && (
        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Sözlük Kapsamı Dışında</p>
            <p className="text-xs text-amber-400/90">{result.message}</p>
            {result.missing_words && result.missing_words.length > 0 && (
              <p className="text-xs font-mono text-amber-200 mt-2">
                Eksik Kelimeler: {result.missing_words.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Başarılı Analoji Sonuçları */}
      {result && result.success && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Vektör Bağıntısı</span>
                <h3 className="text-lg font-bold text-white font-mono mt-0.5">
                  {result.equation} ≈ ?
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Gensim Word2Vec most_similar vektör izdüşümü</span>
              </div>
            </div>

            {/* Sonuç Kartları */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.results.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      {item.percentage_display}
                    </span>
                  </div>

                  <div className="my-3">
                    <h4 className="text-base font-bold text-white capitalize">{item.word}</h4>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, item.score * 100))}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                      Kosinüs Skoru: {item.score}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                    {onSelectWord && (
                      <button
                        type="button"
                        onClick={() => onSelectWord(item.word)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Benzerlerini Gör
                      </button>
                    )}
                    {onCompareWith && (
                      <button
                        type="button"
                        onClick={() => onCompareWith(positiveWord1, item.word)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium ml-auto"
                      >
                        Karşılaştır
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bilimsel Yorum Kutusu */}
            {result.scientific_explanation && (
              <div className="mt-6 p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-slate-300 text-xs flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-cyan-300">Akademik Not & Sınırlılık: </span>
                  {result.scientific_explanation}
                  <span className="block mt-1 text-slate-400">
                    Önemli: Word2Vec statik vektör uzayında analojiler geometriğe dayanır. Her analoji insan zihnindeki dilbilgisel kesinlikte sonuç vermeyebilir; bu derlemin içeriğine ve pencere büyüklüğüne sıkı sıkıya bağlıdır.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
