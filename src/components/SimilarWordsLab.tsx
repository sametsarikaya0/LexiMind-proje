import React, { useState } from 'react';
import { Search, ArrowRight, GitBranch, RefreshCw, AlertCircle } from 'lucide-react';
import { findSimilarWords } from '../api';
import { SimilarWordsResponse } from '../types';

interface SimilarWordsLabProps {
  onCompareWith: (word1: string, word2: string) => void;
  onExploreInNetwork: (word: string) => void;
}

const PRESET_WORDS = [
  'yapay',
  'bilgisayar',
  'öğrenci',
  'sağlık',
  'adalet',
  'güneş',
  'felsefe',
  'para',
  'edebiyat',
  'yazılımcı',
];

export const SimilarWordsLab: React.FC<SimilarWordsLabProps> = ({
  onCompareWith,
  onExploreInNetwork,
}) => {
  const [word, setWord] = useState('yapay');
  const [topN, setTopN] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimilarWordsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (targetWord?: string, count?: number) => {
    const query = (targetWord !== undefined ? targetWord : word).trim();
    const n = count !== undefined ? count : topN;
    if (!query) {
      setError('Lütfen aranacak bir Türkçe kelime giriniz.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await findSimilarWords(query, n);
      setResult(data);
      if (!data.found) {
        setError(data.message || `'${query}' sözlükte bulunamadı.`);
      }
    } catch (err: any) {
      setError(err.message || 'Benzer kelimeler getirilirken bir hata oluştu.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      {/* Module Title */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            1. En Benzer Kelimeleri Bulma
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Gensim Word2Vec <code className="text-cyan-300 font-mono">model.wv.most_similar()</code> metodunu kullanarak kosinüs benzerliği en yüksek kelimeleri listeler.
          </p>
        </div>

        {/* Top-N Segmented Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-md self-start md:self-center">
          <span className="text-xs text-slate-400 px-2 font-mono">Adet:</span>
          {[5, 10, 20].map((num) => (
            <button
              key={num}
              onClick={() => {
                setTopN(num);
                if (result?.found) handleSearch(undefined, num);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                topN === num
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form & Presets */}
      <div className="mt-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Türkçe kelime yazın (örn: bilgisayar, yapay, öğrenci)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold rounded-md text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Hesaplanıyor...</span>
              </>
            ) : (
              <>
                <span>Benzerleri Getir</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Example Chips */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap text-xs text-slate-400">
          <span className="text-slate-500">Deneyebileceğiniz kelimeler:</span>
          {PRESET_WORDS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setWord(p);
                handleSearch(p);
              }}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-slate-700 transition-colors font-mono"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Error / Not Found Message */}
      {error && !loading && (
        <div className="mt-5 p-3.5 rounded-md bg-rose-950/30 border border-rose-800/60 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-rose-300">{error}</div>
            {result?.suggestions && result.suggestions.length > 0 && (
              <div className="mt-1 text-xs text-slate-300">
                <span>Model sözlüğündeki benzer kelimeler: </span>
                <div className="inline-flex gap-1.5 mt-1">
                  {result.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setWord(s);
                        handleSearch(s);
                      }}
                      className="underline text-cyan-400 hover:text-cyan-300 font-mono"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      {result?.found && (
        <div className="mt-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400 font-mono">
            <div>
              ARANAN KELİME: <span className="text-cyan-400 font-bold">{result.word}</span>
            </div>
            <button
              onClick={() => onExploreInNetwork(result.word)}
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Ağ Grafiğinde Aç</span>
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {result.similar_words.map((item, index) => {
              const barWidth = Math.max(5, Math.min(100, Math.round(item.score * 100)));
              return (
                <div
                  key={item.word}
                  className="p-2.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-3 sm:w-1/3">
                    <span className="font-mono text-xs text-slate-500 w-5">
                      {(index + 1)}.
                    </span>
                    <span className="font-semibold text-slate-100 text-sm">
                      {item.word}
                    </span>
                  </div>

                  {/* Similarity Bar */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-cyan-400 tabular-nums w-14 text-right">
                      {item.score.toFixed(4)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end text-xs shrink-0">
                    <button
                      onClick={() => onCompareWith(result.word, item.word)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      title="Bu iki kelimeyi karşılaştır"
                    >
                      Karşılaştır
                    </button>
                    <button
                      onClick={() => onExploreInNetwork(item.word)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      title="Ağ grafiğinde incele"
                    >
                      Ağda Gör
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
