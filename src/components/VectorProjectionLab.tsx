import React, { useState, useEffect } from 'react';
import { Compass, RefreshCw, Info, Layers, Search, Sparkles } from 'lucide-react';
import { projectVectorPCA } from '../api';
import { VectorProjectionResponse } from '../types';

interface VectorProjectionLabProps {
  initialCenterWord?: string;
  onSelectWord: (word: string) => void;
  onCompareWords: (w1: string, w2: string) => void;
}

const PRESET_CLUSTERS = [
  { name: 'Teknoloji & Bilişim', center: 'bilgisayar' },
  { name: 'Sağlık & Tıp', center: 'doktor' },
  { name: 'Hukuk & Adalet', center: 'adalet' },
  { name: 'Akademi & Eğitim', center: 'öğrenci' },
  { name: 'Felsefe & Akıl', center: 'felsefe' },
  { name: 'Edebiyat & Sanat', center: 'edebiyat' },
];

export const VectorProjectionLab: React.FC<VectorProjectionLabProps> = ({
  initialCenterWord = 'bilgisayar',
  onSelectWord,
  onCompareWords,
}) => {
  const [centerWord, setCenterWord] = useState(initialCenterWord);
  const [customWords, setCustomWords] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VectorProjectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  useEffect(() => {
    loadProjection(initialCenterWord);
  }, [initialCenterWord]);

  const loadProjection = async (center = centerWord, wordListStr = customWords) => {
    setLoading(true);
    setError(null);
    try {
      let wordsArr: string[] | undefined = undefined;
      if (wordListStr.trim()) {
        wordsArr = wordListStr
          .split(/[,;\s]+/)
          .map((w) => w.trim())
          .filter((w) => w.length > 1);
      }

      const res = await projectVectorPCA({
        center_word: center.trim() || undefined,
        words: wordsArr && wordsArr.length > 0 ? wordsArr : undefined,
        top_n: 14,
      });
      setData(res);
    } catch (err: any) {
      setError(err?.message || '2D vektör projeksiyonu oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const svgWidth = 640;
  const svgHeight = 440;
  const padding = 50;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-1">
          <span>AKADEMİK BOYUT İNDİRGEME ANALİZİ (PCA / SVD)</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Kelime Vektörlerini 2 Boyutta Görselleştirme (PCA)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          100 boyutlu Word2Vec vektörleri, <strong>Temel Bileşen Analizi (PCA / SVD)</strong> ile
          en yüksek bilgi taşıyan ilk iki temel bileşene (PC1, PC2) izdüşürülür.
          Uzaklıklar gerçek matematiksel vektör ayrışımına dayanır.
        </p>
      </div>

      {/* Preset Topics */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Örnek Kümeler:</span>
        {PRESET_CLUSTERS.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => {
              setCenterWord(c.center);
              setCustomWords('');
              loadProjection(c.center, '');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-300 transition-colors cursor-pointer"
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Merkez Kelime
          </label>
          <input
            type="text"
            value={centerWord}
            onChange={(e) => setCenterWord(e.target.value)}
            placeholder="Örn: bilgisayar"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-6">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Özel Kelimeler (İsteğe bağlı, virgülle ayırın)
          </label>
          <input
            type="text"
            value={customWords}
            onChange={(e) => setCustomWords(e.target.value)}
            placeholder="Örn: doktor, hastane, tedavi, ilaç, virüs..."
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2 flex items-end">
          <button
            type="button"
            onClick={() => loadProjection()}
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'İzdüşür'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* 2D PCA Scatter Canvas */}
      {data && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          {/* Telemetry info */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              Yöntem: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{data.method}</span>
            </div>
            <div>
              Kelime Sayısı: <span className="text-slate-900 dark:text-white font-semibold">{data.word_count}</span>
            </div>
            <div>
              Açıklanan 2D Varyans:{' '}
              <span className="text-purple-600 dark:text-purple-400 font-semibold">
                %{(data.explained_variance_ratio * 100).toFixed(1)}
              </span>
            </div>
          </div>

          {/* SVG Plot */}
          <div className="w-full flex justify-center overflow-x-auto bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full max-w-[640px] h-auto select-none"
              style={{ minHeight: '340px' }}
            >
              {/* Axes and Grid */}
              <line
                x1={padding}
                y1={svgHeight / 2}
                x2={svgWidth - padding}
                y2={svgHeight / 2}
                stroke="#cbd5e1"
                className="dark:stroke-slate-800"
                strokeWidth="1.5"
              />
              <line
                x1={svgWidth / 2}
                y1={padding}
                x2={svgWidth / 2}
                y2={svgHeight - padding}
                stroke="#cbd5e1"
                className="dark:stroke-slate-800"
                strokeWidth="1.5"
              />

              {/* Axis Labels */}
              <text
                x={svgWidth - padding + 5}
                y={svgHeight / 2 + 4}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                PC1 (X)
              </text>
              <text
                x={svgWidth / 2 - 20}
                y={padding - 10}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                PC2 (Y)
              </text>

              {/* Data Points */}
              {data.points.map((pt) => {
                const cx = (svgWidth / 2) + (pt.x / 110) * ((svgWidth - 2 * padding) / 2);
                const cy = (svgHeight / 2) - (pt.y / 110) * ((svgHeight - 2 * padding) / 2);
                const isHovered = hoveredPoint === pt.word;
                const isCenter = pt.is_center;

                return (
                  <g
                    key={pt.word}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt.word)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => onSelectWord(pt.word)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isCenter ? 7 : isHovered ? 6 : 4.5}
                      fill={isCenter ? '#4f46e5' : isHovered ? '#8b5cf6' : '#0284c7'}
                      stroke={isCenter ? '#ffffff' : '#0f172a'}
                      strokeWidth={1.5}
                      className="transition-all"
                    />

                    {/* Word Label */}
                    <text
                      x={cx}
                      y={cy - 8}
                      fill={isCenter ? '#4f46e5' : isHovered ? '#8b5cf6' : '#475569'}
                      className="dark:fill-slate-200"
                      fontSize={isCenter ? '11' : '10'}
                      fontWeight={isCenter || isHovered ? '700' : '500'}
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {pt.word}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Academic explanation of dimension reduction */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2 border border-slate-200 dark:border-slate-800">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <strong>Boyut İndirgeme Yöntemi Açıklaması: </strong>
              Yüksek boyutlu (100D) vektörlerin tamamını tek bir ekranda doğrudan algılamak insan gözü için imkansızdır.
              PCA algoritması, veri matrisinin kovaryansını koruyarak en çok varyasyonu açıklayan 2 ortogonal bileşeni seçer.
              Bu grafikte birbirine yakın kümelenen kelimeler, 100 boyutlu uzayda da birbirine yakın anlamsal doğrultulara sahiptir.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
