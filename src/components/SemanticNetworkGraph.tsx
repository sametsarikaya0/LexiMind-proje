import React, { useState, useEffect } from 'react';
import { Network, RefreshCw, GitBranch, Table, Info, Search } from 'lucide-react';
import { fetchWordNetwork } from '../api';
import { NetworkResponse } from '../types';

interface SemanticNetworkGraphProps {
  initialWord?: string;
  onSelectWord: (word: string) => void;
}

const PRESET_CENTER_WORDS = ['bilgisayar', 'yapay', 'doktor', 'öğrenci', 'adalet', 'felsefe', 'edebiyat'];

export const SemanticNetworkGraph: React.FC<SemanticNetworkGraphProps> = ({
  initialWord = 'bilgisayar',
  onSelectWord,
}) => {
  const [inputWord, setInputWord] = useState(initialWord);
  const [topN, setTopN] = useState(8);
  const [data, setData] = useState<NetworkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');

  useEffect(() => {
    loadNetwork(initialWord);
  }, [initialWord]);

  const loadNetwork = async (w = inputWord, n = topN) => {
    if (!w.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWordNetwork(w.trim(), n);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Semantik ağ verisi getirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const width = 640;
  const height = 440;
  const cx = width / 2;
  const cy = height / 2;

  // Calculate 2D circular node positions
  const nodePositions: Record<string, { x: number; y: number; label: string; weight: number }> = {};
  if (data && data.nodes.length > 0) {
    nodePositions[data.center_word] = { x: cx, y: cy, label: data.center_word, weight: 1.0 };
    const peripheral = data.nodes.filter((n) => n.id !== data.center_word);
    const radius = Math.min(width, height) * 0.38;
    const angleStep = (2 * Math.PI) / (peripheral.length || 1);

    peripheral.forEach((node, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      nodePositions[node.id] = { x, y, label: node.label, weight: node.weight };
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            ÇOK BOYUTLU UZAYDA KELİME AĞI GRAFİĞİ
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Semantik Kelime Ağı Grafiği
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gensim Word2Vec vektör benzerliklerinden doğrudan hesaplanan gerçek semantik düğüm ve kenarlar.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl self-start md:self-center">
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'graph'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Ağ Grafiği</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tablo Görünümü</span>
          </button>
        </div>
      </div>

      {/* Controls Form */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadNetwork();
          }}
          className="flex items-center gap-2 flex-1 max-w-md"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="Merkez kelime yazın..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Ağı Oluştur'}
          </button>
        </form>

        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-500 font-semibold">Örnekler:</span>
          {PRESET_CENTER_WORDS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => {
                setInputWord(w);
                loadNetwork(w);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 font-mono text-xs cursor-pointer"
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Interactive Graph View */}
      {data && viewMode === 'graph' && (
        <div className="mt-6 relative bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 overflow-hidden flex flex-col items-center justify-center">
          {/* Legend / Overlay Note */}
          <div className="absolute top-3 left-4 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>Düğüme tıklayarak o kelimeyi merkeze alabilirsiniz.</span>
          </div>

          <div className="w-full overflow-x-auto flex justify-center">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full max-w-[640px] h-auto select-none"
              style={{ minHeight: '340px' }}
            >
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Background Concentric Guide Circles */}
              <circle cx={cx} cy={cy} r={110} fill="none" stroke="#cbd5e1" className="dark:stroke-slate-800" strokeDasharray="3 3" />
              <circle cx={cx} cy={cy} r={165} fill="none" stroke="#cbd5e1" className="dark:stroke-slate-800" strokeDasharray="3 3" />

              {/* Links (Edges) with real cosine similarity weights */}
              {data.links.map((link, i) => {
                const s = nodePositions[link.source];
                const t = nodePositions[link.target];
                if (!s || !t) return null;

                const isConnectedToHovered =
                  hoveredNode && (link.source === hoveredNode || link.target === hoveredNode);
                const strokeWidth = Math.max(1, link.value * 3.5);
                const opacity = isConnectedToHovered ? 1.0 : Math.max(0.25, link.value);

                return (
                  <g key={`link-${i}`}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke="url(#edgeGrad)"
                      strokeWidth={strokeWidth}
                      strokeOpacity={opacity}
                    />
                    {(isConnectedToHovered || link.value > 0.6) && (
                      <text
                        x={(s.x + t.x) / 2}
                        y={(s.y + t.y) / 2 - 4}
                        fill="#6366f1"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                        textAnchor="middle"
                        className="pointer-events-none font-bold"
                      >
                        {link.value.toFixed(2)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {Object.entries(nodePositions).map(([id, pos]) => {
                const isCenter = id === data.center_word;
                const isHovered = hoveredNode === id;
                const r = isCenter ? 26 : 18;

                return (
                  <g
                    key={id}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() => setHoveredNode(id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => {
                      if (!isCenter) {
                        setInputWord(id);
                        loadNetwork(id);
                        onSelectWord(id);
                      }
                    }}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r}
                      fill={isCenter ? '#4f46e5' : isHovered ? '#8b5cf6' : '#e2e8f0'}
                      className={isCenter ? '' : 'dark:fill-slate-800'}
                      stroke={isCenter ? '#ffffff' : '#94a3b8'}
                      strokeWidth={isCenter ? 2.5 : 1.5}
                    />

                    {/* Word label inside or below */}
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      fill={isCenter ? '#ffffff' : '#0f172a'}
                      className={`pointer-events-none ${isCenter ? '' : 'dark:fill-slate-100'}`}
                      fontSize={isCenter ? '11' : '10'}
                      fontWeight={isCenter ? '700' : '600'}
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {pos.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="w-full mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Düğüm Sayısı: {data.nodes.length}</span>
            <span>Kenar Sayısı: {data.links.length}</span>
            <span>Ölçüt: Word2Vec Skip-gram Kosinüs Matrisi</span>
          </div>
        </div>
      )}

      {/* Accessible Table View Fallback */}
      {data && viewMode === 'table' && (
        <div className="mt-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono">
              <tr>
                <th className="p-3">Başlangıç Kelimesi</th>
                <th className="p-3">Hedef Kelime</th>
                <th className="p-3">Kosinüs Benzerliği</th>
                <th className="p-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
              {data.links.map((link, idx) => (
                <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{link.source}</td>
                  <td className="p-3 text-indigo-600 dark:text-indigo-400">{link.target}</td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {link.value.toFixed(4)}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        const target = link.target === data.center_word ? link.source : link.target;
                        setInputWord(target);
                        loadNetwork(target);
                      }}
                      className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      Merkez Yap
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
