import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import { fetchVocabulary } from '../api';
import { VocabularyResponse } from '../types';

interface VocabularyExplorerProps {
  onSelectWord: (word: string) => void;
  onCompareWith?: (word: string) => void;
}

export const VocabularyExplorer: React.FC<VocabularyExplorerProps> = ({
  onSelectWord,
  onCompareWith,
}) => {
  const [data, setData] = useState<VocabularyResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVocab();
  }, []);

  const loadVocab = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchVocabulary(120, search);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Sözlük listesi getirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadVocab(searchTerm);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Modelin Eğitilmiş Türkçe Kelime Dağarcığı (Vocabulary)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Word2Vec modelinin 100 boyutlu ağırlık matrisinde kayıtlı tüm Türkçe kök ve gövde sözcükleri.
          Herhangi bir kelimeye tıklayarak anında en benzer kelimelerini aratabilirsiniz.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sözlükte kelime ara (örn: yapay, yazılım)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 self-start sm:self-center">
          Toplam Sözlük:{' '}
          <span className="text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
            {data?.total_vocabulary_size || 2027}
          </span>{' '}
          kelime
          {searchTerm && (
            <span className="ml-2 text-slate-400">
              (Eşleşen: {data?.filtered_count || 0})
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Words Grid */}
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {data.words.map((w: string) => (
              <button
                key={w}
                type="button"
                onClick={() => onSelectWord(w)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">
                  {w}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
              </button>
            ))}
          </div>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">
              Gösterilen ilk {data.words.length} kelime. Daha fazlası için yukarıdaki arama kutusunu kullanabilirsiniz.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
