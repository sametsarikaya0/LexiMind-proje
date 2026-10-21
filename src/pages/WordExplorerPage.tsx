import React, { useState } from 'react';
import {
  Compass,
  Search,
  Scale,
  Sparkles,
  GitBranch,
  Layers,
  HelpCircle,
  Cpu,
  BarChart2
} from 'lucide-react';
import { WordLab } from '../components/WordLab';
import { VectorProjectionLab } from '../components/VectorProjectionLab';
import { SemanticNetworkGraph } from '../components/SemanticNetworkGraph';
import { PageRoute } from '../types';

interface WordExplorerPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const WordExplorerPage: React.FC<WordExplorerPageProps> = ({ onNavigate }) => {
  const [subTab, setSubTab] = useState<'words' | 'projection' | 'network'>('words');
  const [activeWord, setActiveWord] = useState<string>('bilgisayar');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Başlık ve Tanıtım */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2433] pb-6">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>Gensim Word2Vec Semantik Laboratuvarı</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Kelime Gezgini & Vektör Uzayı
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Eğitilmiş Word2Vec modeli üzerinde kosinüs benzerliği, yönsel vektör cebiri (analoji),
            2D PCA izdüşümü ve etkileşimli anlamsal ilişki ağını keşfedin.
          </p>
        </div>

        {/* Sekme Değiştirici */}
        <div className="flex items-center p-1 rounded-xl bg-[#141824] border border-[#232A3B] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setSubTab('words')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'words'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Benzerlik & Analoji</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('projection')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'projection'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>2D PCA İzdüşümü</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('network')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'network'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Semantik Ağ Grafiği</span>
          </button>
        </div>
      </div>

      {/* Alt İçerik */}
      {subTab === 'words' && (
        <WordLab
          onExploreInNetwork={(w) => {
            setActiveWord(w);
            setSubTab('network');
          }}
        />
      )}

      {subTab === 'projection' && (
        <div className="space-y-6">
          <VectorProjectionLab
            initialCenterWord={activeWord}
            onSelectWord={(w) => {
              setActiveWord(w);
              setSubTab('words');
            }}
            onCompareWords={() => {
              setSubTab('words');
            }}
          />
        </div>
      )}

      {subTab === 'network' && (
        <div className="space-y-6">
          <SemanticNetworkGraph
            initialWord={activeWord}
            onSelectWord={(w) => {
              setActiveWord(w);
            }}
          />
        </div>
      )}
    </div>
  );
};
