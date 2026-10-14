import React, { useState, useEffect } from 'react';
import { fetchCorpusStatistics } from '../api';
import { CorpusStatisticsResponse } from '../types';
import { Database, Search, FileText, BarChart3, Loader2, AlertCircle, BookOpen } from 'lucide-react';

interface CorpusExplorerLabProps {
  onSelectWord?: (word: string) => void;
}

export const CorpusExplorerLab: React.FC<CorpusExplorerLabProps> = ({ onSelectWord }) => {
  const [stats, setStats] = useState<CorpusStatisticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [minFrequency, setMinFrequency] = useState<number>(1);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchCorpusStatistics();
        setStats(data);
      } catch (err: any) {
        setError(err?.message || 'Derlem istatistikleri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500 dark:text-cyan-400 mx-auto mb-3" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Türkçe eğitim derlemi ve frekans istatistikleri taranıyor...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
        <div>
          <p className="font-semibold">Derlem İstatistikleri Alınamadı</p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error || 'Sunucu yanıt vermedi.'}</p>
        </div>
      </div>
    );
  }

  const filteredWords = stats.top_frequent_words.filter((item) => {
    const matchesSearch = item.word.toLowerCase().includes(searchFilter.toLowerCase().trim());
    const matchesFreq = item.count >= minFrequency;
    return matchesSearch && matchesFreq;
  });

  return (
    <div className="space-y-6">
      {/* Üst Bilgi Kartı */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-3">
              <Database className="w-3.5 h-3.5" />
              <span>Gerçek Türkçe Eğitim Derlemi Analizi</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Derlem Gezgini & Kelime Frekans Analitiği
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Word2Vec modelinin eğitildiği Türkçe veri tabanının hacmini, cümle yapısını,
              belirteç (token) yoğunluğunu ve kelime sıklıklarını inceleyin.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-left md:text-right">
            <span className="text-[11px] text-slate-500 block uppercase font-mono">Derlem Kaynağı</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-300">{stats.corpus_name}</span>
          </div>
        </div>

        {/* 5 Temel Sayısal Metrik */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Temiz Cümle</span>
            <span className="text-lg md:text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5 block">
              {stats.clean_sentences_count.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">tekrarsız satır</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Toplam Belirteç</span>
            <span className="text-lg md:text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {stats.total_tokens_count.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">token hacmi</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Benzersiz Kelime</span>
            <span className="text-lg md:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {stats.unique_words_count.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">sözlük dağarcığı</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Type-Token Oranı</span>
            <span className="text-lg md:text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
              {stats.type_token_ratio}
            </span>
            <span className="text-[11px] text-slate-500">morfolojik çeşitlilik (TTR)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Ortalama Cümle</span>
            <span className="text-lg md:text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5 block">
              {stats.average_sentence_length_tokens}
            </span>
            <span className="text-[11px] text-slate-500">kelime / cümle</span>
          </div>
        </div>
      </div>

      {/* Frekans Dağılımı ve Kelime Arama */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">En Sık Geçen Türkçe Kelimeler (Zipf Dağılımı)</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Arama */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Kelime filtrele..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none w-40 sm:w-48 transition-colors"
              />
            </div>

            {/* Min Frekans */}
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>Min Frekans:</span>
              <input
                type="number"
                min="1"
                max="50"
                value={minFrequency}
                onChange={(e) => setMinFrequency(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-14 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Frekans Grid Listesi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredWords.length > 0 ? (
            filteredWords.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 w-5">#{idx + 1}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 truncate transition-colors">
                    {item.word}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div className="w-16 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, item.frequency_percentage * 15)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 w-8">
                    {item.count}
                  </span>
                  {onSelectWord && (
                    <button
                      type="button"
                      onClick={() => onSelectWord(item.word)}
                      className="text-[11px] px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/60 hover:bg-cyan-200 dark:hover:bg-cyan-800/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/40 transition-colors cursor-pointer"
                      title="Bu kelimenin Word2Vec benzerlerini incele"
                    >
                      Vektör
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-slate-500 text-xs">
              Arama kriterlerine uygun kelime bulunamadı.
            </div>
          )}
        </div>
      </div>

      {/* Örnek Derlem Cümleleri ve Akademik Ayrım */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Örnek Cümleler */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Temizlenmiş Örnek Derlem Cümleleri
            </h3>
          </div>
          <div className="space-y-2">
            {stats.sample_sentences.map((sent, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed"
              >
                <span className="text-slate-400 dark:text-slate-600 mr-2 font-bold">[{idx + 1}]</span>
                {sent}
              </div>
            ))}
          </div>
        </div>

        {/* Akademik Açıklama */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Frekans vs. Semantik Yakınlık Ayrımı
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {stats.linguistic_note}
            </p>
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                <strong className="text-cyan-700 dark:text-cyan-300">F. R. Firth (1957):</strong> &ldquo;Bir kelimeyi, arkadaşlık ettiği diğer kelimelerden tanırsınız.&rdquo;
              </p>
              <p>
                Word2Vec, iki kelimenin salt ne kadar sık geçtiğini değil, aynı bağlam pencerelerinde (Context Window ±w) birbirini öngörme olasılığını optimize eder. Dolayısıyla düşük frekanslı iki kelime bile aynı bağlamda bulunuyorsa yüksek kosinüs benzerliğine sahip olabilir.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            Türkçe dilinin zengin morfolojik yapısı nedeniyle kök-ek ayrıştırması (Stemming/Lemmatization) uygulanmayan kelimelerde her çekim eki ayrı bir sözlük öğesi oluşturur.
          </div>
        </div>
      </div>
    </div>
  );
};
