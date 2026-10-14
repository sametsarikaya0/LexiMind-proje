import React from 'react';
import { Terminal, Github, BookOpen } from 'lucide-react';

interface FooterProps {
  onOpenDocs: () => void;
  onOpenAcademic: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDocs, onOpenAcademic }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-10 text-slate-500 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                LexiMind <span className="text-indigo-600 dark:text-indigo-400 font-normal">· Turkish Semantic Lab</span>
              </div>
              <div className="text-xs text-slate-500">
                Doğal Dil İşleme (NLP) Dersi Üniversite Dönem Projesi
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onOpenDocs}
              className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              API Swagger /docs
            </button>
            <a
              href="/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
            >
              OpenAPI JSON
            </a>
            <button
              type="button"
              onClick={onOpenAcademic}
              className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Kuramsal Metodoloji
            </button>
          </div>

          <div className="text-slate-500 font-mono text-[11px] text-center md:text-right">
            Python 3.11 · Gensim 4.3 · FastAPI REST · Word2Vec 100d
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} LexiMind. Açık kaynak akademik eğitim ve araştırma lisansı altındadır.
          </div>
          <div className="mt-2 sm:mt-0 font-mono">
            Vercel & Cloud Run Uyumlu Mimari
          </div>
        </div>
      </div>
    </footer>
  );
};
