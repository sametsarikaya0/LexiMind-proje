import React, { useState } from 'react';
import { BarChart3, RefreshCw, Type, Hash, Layers, CheckCircle2, Compass } from 'lucide-react';
import { analyzeText } from '../api';
import { TextAnalysisResponse } from '../types';

const SAMPLE_TEXTS = [
  {
    title: 'Yapay Zeka & NLP',
    content:
      'Doğal dil işleme ve yapay zeka günümüz teknolojisinin en temel yapı taşlarıdır. Derin öğrenme sinir ağları ile kelimelerin anlamsal ilişkilerini vektör uzayında modeller.',
  },
  {
    title: 'Akademik & Üniversite',
    content:
      'Üniversite öğrencileri kütüphanede ders çalışır ve tez araştırmaları yürütür. Profesör ve öğretmenler bilimsel makaleler yayınlar.',
  },
  {
    title: 'Tıp & Sağlık',
    content:
      'Doktor ve hekim hastanede hastaları muayene eder ve tedavi uygular. Tıbbi araştırmalar insan sağlığını korumayı amaçlar.',
  },
];

export const TextAnalysisLab: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_TEXTS[0].content);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TextAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (inputText?: string) => {
    const target = (inputText !== undefined ? inputText : text).trim();
    if (!target) {
      setError('Lütfen analiz edilecek bir metin giriniz.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeText(target);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Metin analizi sırasında bir hata oluştu.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>2. Metin Analizi & Ortalama Metin Vektörü (Centroid)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Türkçe metnin cümle, kelime ve benzersiz token sayılarını hesaplar, frekans dağılımını gösterir
          ve metindeki kelime vektörlerinin ağırlık merkezini (ortalama embedding) çıkarır.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Örnek Metinler:</span>
        {SAMPLE_TEXTS.map((s) => (
          <button
            key={s.title}
            type="button"
            onClick={() => {
              setText(s.content);
              handleAnalyze(s.content);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-300 transition-colors cursor-pointer"
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Textarea Form */}
      <div>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Analiz edilecek Türkçe metni buraya yazın..."
          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-sans"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {text.length} karakter · {text.trim() ? text.trim().split(/\s+/).length : 0} kelime
          </span>
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={loading || !text.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analiz Ediliyor...</span>
              </>
            ) : (
              <>
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Metni Analiz Et</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && !loading && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5 pt-2">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-indigo-500" />
                <span>Karakter</span>
              </div>
              <div className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-white">
                {result.total_characters}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Cümle Sayısı</span>
              </div>
              <div className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-white">
                {result.total_sentences || 1}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-indigo-500" />
                <span>Toplam Kelime</span>
              </div>
              <div className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-white">
                {result.total_words}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Benzersiz Kelime</span>
              </div>
              <div className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-white">
                {result.unique_words}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Model Kapsaması</div>
              <div className="mt-1 text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                %{result.vocabulary_coverage_percent.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {result.in_vocab_words}/{result.total_words} bilinen kelime
              </div>
            </div>
          </div>

          {/* Document Mean Vector / Centroid Representation */}
          {result.text_vector_norm !== undefined && result.text_vector_norm !== null && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-indigo-200 dark:border-indigo-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Ortalama Metin Vektörü (Mean Centroid Embedding)
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  ||v_text||: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{result.text_vector_norm}</span> (L2 Norm)
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Metindeki bilinen kelimelerin Word2Vec vektörleri toplanıp ortalaması alınarak metnin tek bir bileşke temsil vektörü üretilmiştir.
              </p>

              {result.closest_semantic_topics && result.closest_semantic_topics.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Metin Vektörünün En Yakın Olduğu Sözcükler:
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {result.closest_semantic_topics.map((t) => (
                      <span
                        key={t.word}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 shadow-2xs"
                      >
                        <span className="font-semibold">{t.word}</span>
                        <span className="text-slate-400 font-normal">({(t.score * 100).toFixed(1)}%)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Word Frequency Distribution */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-3">
              En Sık Kullanılan Kelimeler (Frekans)
            </h3>
            {result.top_words.length === 0 ? (
              <div className="text-xs text-slate-500">Kelime bulunamadı.</div>
            ) : (
              <div className="space-y-2">
                {result.top_words.map((item, idx) => {
                  const maxCount = result.top_words[0].count;
                  const percentOfMax = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.word} className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400 font-mono w-4">{idx + 1}.</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 w-28 truncate font-mono">
                        {item.word}
                      </span>
                      <div className="flex-1 h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded transition-all duration-300"
                          style={{ width: `${percentOfMax}%` }}
                        />
                      </div>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold tabular-nums w-12 text-right">
                        {item.count} kez
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preprocessed Tokens */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono font-semibold">
              ÇIKARILAN KELİME BELİRTEÇLERİ (TOKENLAR):
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {result.sample_tokens.map((token, i) => (
                <span
                  key={`${token}-${i}`}
                  className="px-2 py-0.5 rounded-md text-xs font-mono bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  {token}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
