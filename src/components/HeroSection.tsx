import React from 'react';
import { BookOpen, Cpu, Layers, GitBranch, ArrowRight, GraduationCap, CheckCircle2 } from 'lucide-react';
import { ModelInfo } from '../types';

interface HeroSectionProps {
  modelInfo: ModelInfo | null;
  onExploreClick: () => void;
  onReportClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  modelInfo,
  onExploreClick,
  onReportClick,
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
          <span>Gensim 4.3 Word2Vec (Skip-gram)</span>
          <span aria-hidden="true">·</span>
          <span>FastAPI & Flask (Vercel / Cloud Uyumlu)</span>
        </div>

        {/* Başlık ve Açıklama */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Türkçe Anlamsal Zeka ve Word2Vec Laboratuvarı
        </h1>

        <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Bu uygulama, üniversite NLP dersinde ele alınan <strong>Gensim Word2Vec</strong> algoritması ile
          Türkçe kelimelerin çok boyutlu vektör temsillerini öğrenir. Kelimeler arasındaki kosinüs benzerliğini
          hesaplar, iki kelimeyi karşılaştırır, vektör analojisi yapar ve metin istatistikleri sunar.
        </p>

        {/* Aksiyon Butonları (Kelimeleri İncele & Ödev Notları) */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExploreClick}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Kelimeleri İncele</span>
            <ArrowRight className="w-4 h-4" />
          </button>

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
              Word2Vec (Skip-gram)
            </div>
            <div className="text-[11px] text-slate-500">sg=1 (Mikolov vd.)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Vektör Boyutu</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
              d = {modelInfo?.vector_size || 100}
            </div>
            <div className="text-[11px] text-slate-500">Continuous Vector Space</div>
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

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sözlük Dağarcığı</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
              {modelInfo?.vocab_size || 2027} Kelime
            </div>
            <div className="text-[11px] text-slate-500">Eğitilmiş Türkçe kelimeler</div>
          </div>
        </div>
      </div>
    </div>
  );
};
