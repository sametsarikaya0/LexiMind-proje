import React from 'react';
import { Terminal, Github, BookOpen, Shield, FileText, Cookie } from 'lucide-react';
import { PageRoute } from '../types';

interface FooterProps {
  onOpenDocs: () => void;
  onOpenAcademic?: () => void;
  onNavigate?: (page: PageRoute) => void;
  onOpenCookieSettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDocs,
  onOpenAcademic,
  onNavigate,
  onOpenCookieSettings,
}) => {
  return (
    <footer className="border-t border-[#1E2433] bg-[#0E1118]/80 py-10 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-800/80 flex items-center justify-center text-indigo-400 font-bold">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">
                LexiMind <span className="text-indigo-400 font-normal">· Turkish Academic NLP Lab</span>
              </div>
              <div className="text-xs text-slate-500">
                Doğal Dil İşleme Dersi Üniversite Projesi • Gensim Word2Vec & Anahtar Kelime Analizi
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs">
            <button
              type="button"
              onClick={onOpenDocs}
              className="hover:text-indigo-300 transition-colors cursor-pointer"
            >
              API Swagger /docs
            </button>
            <a
              href="/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-300 transition-colors"
            >
              OpenAPI JSON
            </a>
            {onNavigate && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('terms')}
                  className="hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Koşullar
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Gizlilik
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('cookies')}
                  className="hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Çerezler
                </button>
              </>
            )}
            {onOpenCookieSettings && (
              <button
                type="button"
                onClick={onOpenCookieSettings}
                className="hover:text-indigo-300 transition-colors cursor-pointer text-indigo-400"
              >
                Çerez Tercihleri
              </button>
            )}
          </div>

          <div className="text-slate-500 font-mono text-[11px] text-center md:text-right">
            Python 3.11 · Gensim 4.3 · FastAPI REST · Word2Vec
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1E2433] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} LexiMind. Üniversite Doğal Dil İşleme (NLP) Eğitim ve Araştırma Platformu.
          </div>
          <div className="mt-2 sm:mt-0 font-mono text-slate-500">
            Makalelerden Anlamlı Bilgiye
          </div>
        </div>
      </div>
    </footer>
  );
};
