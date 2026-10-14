import React from 'react';
import { BookOpen, Cpu, Layers, GitBranch, ArrowRight, GraduationCap, Sliders, Settings } from 'lucide-react';
import { ModelInfo } from '../types';

interface HeroSectionProps {
  modelInfo: ModelInfo | null;
  onExploreClick: () => void;
  onReportClick: () => void;
  onCustomizeModel?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  modelInfo,
  onExploreClick,
  onReportClick,
  onCustomizeModel,
}) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Üst Bilgi Satırı (Zero-Pill Temiz Tipografi) */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Doğal Dil İşleme (NLP) Bitirme / Dönem Projesi</span>
          <span aria-hidden="true">·</span>
          <span>Python 3.11</span>
          <span aria-hidden="true">·</span>
          <span>Gensim 4.3 Word2Vec</span>
          <span aria-hidden="true">·</span>
          <span>FastAPI & Flask (Vercel Uyumlu)</span>
        </div>

        {/* Başlık ve Açıklama */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Türkçe Anlamsal Zeka ve Word2Vec Laboratuvarı
        </h1>

        <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Bu uygulama, üniversite NLP dersinde ele alınan <strong>Gensim Word2Vec</strong> algoritması ile
          Türkçe kelimelerin çok boyutlu vektör temsillerini öğrenir. Kelimeler arasındaki kosinüs benzerliğini
          hesaplar, iki kelimeyi karşılaştırır, vektör analojisi yapar ve dinamik olarak sözlük dağarcığı ve vektör boyutunu özelleştirmenize olanak tanır.
        </p>

        {/* Aksiyon Butonları (Kelimeleri İncele, Sözlük/Vektör Ayarla & Ödev Notları) */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExploreClick}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Kelimeleri İncele</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onCustomizeModel && (
            <button
              type="button"
              onClick={onCustomizeModel}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Sözlük & Vektör Boyutunu Değiştir</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReportClick}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Ödev Notları & Kaynaklar</span>
          </button>
        </div>

        {/* Model Parametre Kartları */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>Algoritma</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
              Word2Vec ({modelInfo?.algorithm?.includes('CBOW') ? 'CBOW' : 'Skip-gram'})
            </div>
            <div className="text-[11px] text-slate-500">Gensim 4.x Çekirdeği</div>
          </div>

          <div
            onClick={onCustomizeModel}
            className={`p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs ${
              onCustomizeModel ? 'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors' : ''
            }`}
            title="Vektör boyutunu değiştirmek için tıklayın"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Vektör Boyutu</span>
              </span>
              {onCustomizeModel && <Settings className="w-3 h-3 text-slate-400" />}
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
              d = {modelInfo?.vector_size || 100}
            </div>
            <div className="text-[11px] text-slate-500">Değiştirmek için tıkla ↗</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
              <span>Bağlam Penceresi</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
              w = ±{modelInfo?.window || 5} kelime
            </div>
            <div className="text-[11px] text-slate-500">Çevre kelime mesafesi</div>
          </div>

          <div
            onClick={onCustomizeModel}
            className={`p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs ${
              onCustomizeModel ? 'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors' : ''
            }`}
            title="Sözlük dağarcığını değiştirmek için tıklayın"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sözlük Dağarcığı</span>
              </span>
              {onCustomizeModel && <Settings className="w-3 h-3 text-slate-400" />}
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {modelInfo?.vocab_size || 2027} Kelime
            </div>
            <div className="text-[11px] text-slate-500">Genişletmek için tıkla ↗</div>
          </div>
        </div>
      </div>
    </div>
  );
};
