import React, { useState } from 'react';
import { Search, Scale, Sparkles, ArrowRight, Check, AlertCircle, Loader2, HelpCircle, Layers, Plus, Minus } from 'lucide-react';
import { findSimilarWords, compareWords, calculateAnalogy } from '../api';
import { SimilarWordsResponse, CompareWordsResponse, AnalogyResponse } from '../types';

interface WordLabProps {
  onExploreInNetwork?: (word: string) => void;
}

const QUICK_EXAMPLES = [
  'bilgisayar',
  'yapay',
  'yazılım',
  'doktor',
  'algoritma',
  'sağlık',
  'adalet',
  'öğrenci',
  'üniversite',
  'felsefe',
  'ekonomi',
  'edebiyat',
  'hastane',
  'türkiye',
  'güneş',
];

const ANALOGY_PRESETS = [
  { label: 'Bilgisayar - Donanım + Algoritma', p1: 'bilgisayar', neg: 'donanım', p2: 'algoritma' },
  { label: 'Doktor - Hastane + Okul', p1: 'doktor', neg: 'hastane', p2: 'okul' },
  { label: 'Hekim - Tedavi + Ders', p1: 'hekim', neg: 'tedavi', p2: 'ders' },
  { label: 'Fizik - Deney + Felsefe', p1: 'fizik', neg: 'deney', p2: 'felsefe' },
  { label: 'Yazılım - Kod + Hukuk', p1: 'yazılım', neg: 'kod', p2: 'hukuk' },
];

export const WordLab: React.FC<WordLabProps> = ({ onExploreInNetwork }) => {
  const [activeSubTab, setActiveSubTab] = useState<'similar' | 'compare' | 'analogy'>('similar');

  // Similar Words State
  const [queryWord, setQueryWord] = useState<string>('yapay');
  const [topN, setTopN] = useState<number>(10);
  const [loadingSimilar, setLoadingSimilar] = useState<boolean>(false);
  const [similarResult, setSimilarResult] = useState<SimilarWordsResponse | null>(null);
  const [similarError, setSimilarError] = useState<string | null>(null);

  // Compare Words State
  const [compWord1, setCompWord1] = useState<string>('bilgisayar');
  const [compWord2, setCompWord2] = useState<string>('yazılım');
  const [loadingCompare, setLoadingCompare] = useState<boolean>(false);
  const [compareResult, setCompareResult] = useState<CompareWordsResponse | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Analogy State
  const [posWord1, setPosWord1] = useState<string>('bilgisayar');
  const [negWord, setNegWord] = useState<string>('donanım');
  const [posWord2, setPosWord2] = useState<string>('algoritma');
  const [loadingAnalogy, setLoadingAnalogy] = useState<boolean>(false);
  const [analogyResult, setAnalogyResult] = useState<AnalogyResponse | null>(null);
  const [analogyError, setAnalogyError] = useState<string | null>(null);

  // Initial load
  React.useEffect(() => {
    handleSearchSimilar('yapay', 10);
  }, []);

  // Handlers
  const handleSearchSimilar = async (targetWord?: string, count?: number) => {
    const q = (targetWord !== undefined ? targetWord : queryWord).trim();
    const n = count !== undefined ? count : topN;
    if (!q) {
      setSimilarError('Lütfen aranacak bir Türkçe kelime giriniz.');
      return;
    }

    setQueryWord(q);
    setLoadingSimilar(true);
    setSimilarError(null);
    try {
      const data = await findSimilarWords(q, n);
      setSimilarResult(data);
      if (!data.found) {
        setSimilarError(data.message || `'${q}' sözlükte bulunamadı.`);
      }
    } catch (err: any) {
      setSimilarError(err?.message || 'Benzer kelimeler aranırken bir hata oluştu.');
      setSimilarResult(null);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleRunCompare = async (w1?: string, w2?: string) => {
    const wordA = (w1 !== undefined ? w1 : compWord1).trim();
    const wordB = (w2 !== undefined ? w2 : compWord2).trim();
    if (!wordA || !wordB) {
      setCompareError('Lütfen karşılaştırılacak iki kelimeyi de giriniz.');
      return;
    }

    setCompWord1(wordA);
    setCompWord2(wordB);
    setLoadingCompare(true);
    setCompareError(null);
    try {
      const data = await compareWords(wordA, wordB);
      setCompareResult(data);
      if (!data.success) {
        setCompareError(data.message || 'Kelimelerden biri veya ikisi sözlükte bulunamadı.');
      }
    } catch (err: any) {
      setCompareError(err?.message || 'Karşılaştırma sırasında bir hata oluştu.');
      setCompareResult(null);
    } finally {
      setLoadingCompare(false);
    }
  };

  const handleRunAnalogy = async (p1?: string, neg?: string, p2?: string) => {
    const posA = (p1 !== undefined ? p1 : posWord1).trim();
    const negA = (neg !== undefined ? neg : negWord).trim();
    const posB = (p2 !== undefined ? p2 : posWord2).trim();

    if (!posA || !posB) {
      setAnalogyError('En az iki pozitif kelime belirtilmelidir.');
      return;
    }

    setPosWord1(posA);
    setNegWord(negA);
    setPosWord2(posB);
    setLoadingAnalogy(true);
    setAnalogyError(null);
    try {
      const posList = [posA, posB];
      const negList = negA ? [negA] : [];
      const data = await calculateAnalogy(posList, negList, 5);
      setAnalogyResult(data);
      if (!data.success) {
        setAnalogyError(data.message || 'Analoji hesaplanamadı.');
      }
    } catch (err: any) {
      setAnalogyError(err?.message || 'Analoji sırasında hata oluştu.');
      setAnalogyResult(null);
    } finally {
      setLoadingAnalogy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 3 Alt Sekme Seçici */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 shadow-sm">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('similar')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'similar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>En Benzer Kelimeler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('compare')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'compare'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>İki Kelimeyi Karşılaştır</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('analogy')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'analogy'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Kelime Analojisi (Aritmetik)</span>
          </button>
        </div>
      </div>

      {/* Hızlı Örnek Kelimeler Çubuğu */}
      <div className="bg-slate-100/80 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
          <span>Hızlı Deneme:</span>
        </span>
        {QUICK_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              if (activeSubTab === 'similar') {
                handleSearchSimilar(example);
              } else if (activeSubTab === 'compare') {
                handleRunCompare(compWord1, example);
              } else {
                setPosWord1(example);
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-300/80 dark:border-slate-700 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            {example}
          </button>
        ))}
      </div>

      {/* 1. SEKME: EN BENZER KELİMELER */}
      {activeSubTab === 'similar' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Gensim Word2Vec ile En Yakın Kelimeleri Bul
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Bir Türkçe kelime yazın. Model, 100 boyutlu latent vektör uzayında açısı en dar (kosinüs benzerliği en yüksek) komşu kelimeleri listeler.
            </p>
          </div>

          {/* Arama Formu */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSimilar();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                value={queryWord}
                onChange={(e) => setQueryWord(e.target.value)}
                placeholder="Örn: yapay, bilgisayar, doktor, adalet..."
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={topN}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setTopN(val);
                  if (queryWord.trim()) handleSearchSimilar(queryWord, val);
                }}
                className="px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={5}>En yakın 5 kelime</option>
                <option value={10}>En yakın 10 kelime</option>
                <option value={15}>En yakın 15 kelime</option>
                <option value={20}>En yakın 20 kelime</option>
              </select>

              <button
                type="submit"
                disabled={loadingSimilar}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {loadingSimilar ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Aranıyor...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Benzerleri Bul</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Hata Bildirimi */}
          {similarError && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold">Kelime Bulunamadı</p>
                <p className="mt-0.5">{similarError}</p>
                {similarResult?.suggestions && similarResult.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium">Bunu mu demek istediniz?</span>
                    {similarResult.suggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleSearchSimilar(sug)}
                        className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 text-amber-900 dark:text-amber-200 font-mono text-xs font-medium cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sonuç Listesi */}
          {similarResult && similarResult.found && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase font-bold text-slate-400 font-mono">Aranan:</span>
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono uppercase">
                    &ldquo;{similarResult.word}&rdquo;
                  </span>
                  {similarResult.resolution_note && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      ✓ {similarResult.resolution_note}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-mono">
                    (Vektör Normu: {similarResult.vector_norm})
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {similarResult.similar_words.length} adet en yakın semantik komşu listelendi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {similarResult.similar_words.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {item.percentage_display} Benzerlik
                      </span>
                    </div>

                    <div className="my-2.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                        {item.word}
                      </h3>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, Math.min(100, item.score * 100))}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1 block">
                        Kosinüs Skoru: {item.score}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleSearchSimilar(item.word)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                      >
                        Bunu İncele →
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCompWord1(similarResult.word);
                          setCompWord2(item.word);
                          setActiveSubTab('compare');
                          handleRunCompare(similarResult.word, item.word);
                        }}
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                      >
                        Karşılaştır
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SEKME: İKİ KELİMEYİ KARŞILAŞTIR */}
      {activeSubTab === 'compare' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              İki Kelimenin Vektör Benzerliğini Karşılaştır
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Word2Vec uzayında iki kelimenin aralarındaki açıyı (Kosinüs Benzerliği) ve L2 mesafesini (Öklid Uzaklığı) hesaplayarak anlamsal yakınlığı ölçün.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                1. Kelime
              </label>
              <input
                type="text"
                value={compWord1}
                onChange={(e) => setCompWord1(e.target.value)}
                placeholder="Örn: bilgisayar"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                2. Kelime
              </label>
              <input
                type="text"
                value={compWord2}
                onChange={(e) => setCompWord2(e.target.value)}
                placeholder="Örn: yazılım"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleRunCompare()}
              disabled={loadingCompare}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {loadingCompare ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Hesaplanıyor...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  <span>Kelimeleri Karşılaştır</span>
                </>
              )}
            </button>
          </div>

          {compareError && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold">Karşılaştırma Yapılamadı</p>
                <p className="mt-0.5">{compareError}</p>
              </div>
            </div>
          )}

          {compareResult && compareResult.success && (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 capitalize">
                      {compareResult.word1}
                    </span>
                    <span className="text-slate-400 font-bold">⟷</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 capitalize">
                      {compareResult.word2}
                    </span>
                  </div>
                  {compareResult.resolution_note && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      ✓ {compareResult.resolution_note}
                    </span>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  İlişki Seviyesi: {compareResult.relation_level}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Kosinüs Benzerliği (Cosine Similarity)</span>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {compareResult.cosine_similarity}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${Math.max(0, Math.min(100, compareResult.cosine_similarity * 100))}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Aralık: -1.0 (Zıt) ile +1.0 (Aynı)</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Öklid Mesafesi (Euclidean Distance)</span>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {compareResult.euclidean_distance}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-3 block">
                    Vektörler arasındaki doğrusal L2 uzaklığı. Sayı küçüldükçe kelimeler uzayda birbirine yaklaşır.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-indigo-900 dark:text-indigo-300">Anlamsal Yorum:</p>
                <p className="mt-1 leading-relaxed">{compareResult.interpretation}</p>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {compareResult.academic_disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. SEKME: KELİME ANALOJİSİ (ARİTMETİK) */}
      {activeSubTab === 'analogy' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Word2Vec Vektör Aritmetiği & Analoji Gezgini
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Word2Vec&apos;in en ünlü yeteneği olan yönsel vektör toplama ve çıkarma formülü: <code className="font-mono text-indigo-600 dark:text-indigo-400">v_hedef ≈ (v_A - v_B) + v_C</code>
            </p>
          </div>

          {/* Hazır Analoji Şablonları */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-500 py-1 font-medium">Örnek Bağıntılar:</span>
            {ANALOGY_PRESETS.map((pr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPosWord1(pr.p1);
                  setNegWord(pr.neg);
                  setPosWord2(pr.p2);
                  handleRunAnalogy(pr.p1, pr.neg, pr.p2);
                }}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors font-medium cursor-pointer"
              >
                {pr.label}
              </button>
            ))}
          </div>

          {/* Analoji Giriş Alanları */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5 items-center">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Kelime A (Pozitif)
              </label>
              <input
                type="text"
                value={posWord1}
                onChange={(e) => setPosWord1(e.target.value)}
                placeholder="Örn: bilgisayar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-center text-rose-500 font-bold text-lg pt-4 md:pt-6">
              <Minus className="w-5 h-5" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Kelime B (Çıkarılacak)
              </label>
              <input
                type="text"
                value={negWord}
                onChange={(e) => setNegWord(e.target.value)}
                placeholder="Örn: donanım"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-center text-emerald-500 font-bold text-lg pt-4 md:pt-6">
              <Plus className="w-5 h-5" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Kelime C (Eklenecek)
              </label>
              <input
                type="text"
                value={posWord2}
                onChange={(e) => setPosWord2(e.target.value)}
                placeholder="Örn: algoritma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => handleRunAnalogy()}
              disabled={loadingAnalogy}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {loadingAnalogy ? (
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

          {analogyError && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold">İşlem Başarısız</p>
                <p className="mt-0.5">{analogyError}</p>
              </div>
            </div>
          )}

          {analogyResult && analogyResult.success && (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase">Formül:</span>
                  <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {analogyResult.equation} ≈ ?
                  </div>
                </div>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  Gensim most_similar vektör izdüşümü
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {analogyResult.results.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {item.percentage_display}
                      </span>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                        {item.word}
                      </h4>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${Math.max(0, Math.min(100, item.score * 100))}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                        Kosinüs: {item.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {analogyResult.scientific_explanation && (
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-indigo-900 dark:text-indigo-300">Akademik Not: </span>
                  {analogyResult.scientific_explanation}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
