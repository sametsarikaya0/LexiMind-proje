import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WordLab } from './components/WordLab';
import { TextAnalysisLab } from './components/TextAnalysisLab';
import { VectorProjectionLab } from './components/VectorProjectionLab';
import { SemanticNetworkGraph } from './components/SemanticNetworkGraph';
import { CorpusExplorerLab } from './components/CorpusExplorerLab';
import { VocabularyExplorer } from './components/VocabularyExplorer';
import { ModelTrainingLab } from './components/ModelTrainingLab';
import { HomeworkResources } from './components/HomeworkResources';
import { AcademicMethodology } from './components/AcademicMethodology';
import { ApiDocsModal } from './components/ApiDocsModal';
import { StudentGuideModal } from './components/StudentGuideModal';
import { Footer } from './components/Footer';
import { fetchHealth, fetchModelInfo } from './api';
import { ModelInfo, AppTheme } from './types';
import {
  Sparkles,
  FileText,
  Compass,
  Database,
  GraduationCap
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('leximind_theme');
    if (saved === 'light' || saved === 'parchment' || saved === 'slate-clean') {
      return 'light';
    }
    return 'dark';
  });

  const [activeTab, setActiveTab] = useState<string>('words');
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [isStudentGuideOpen, setIsStudentGuideOpen] = useState<boolean>(false);

  // Görselleştirme alt sekmesi: 'pca' (2D harita) veya 'network' (ilişki ağı)
  const [visualsSubTab, setVisualsSubTab] = useState<'pca' | 'network'>('pca');
  // Derlem alt sekmesi: 'stats' (istatistikler) veya 'vocab' (sözlük) veya 'training' (eğitim)
  const [corpusSubTab, setCorpusSubTab] = useState<'stats' | 'vocab' | 'training'>('stats');

  // Ortak kelime durumu
  const [selectedWord, setSelectedWord] = useState<string>('bilgisayar');

  // Tema değişikliklerini HTML özniteliklerine ve localStorage'a yansıt
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('leximind_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const refreshModelInfo = async () => {
    try {
      const info = await fetchModelInfo();
      setModelInfo(info);
    } catch (e) {
      console.warn('Word2Vec model bilgisi yenilenirken hata:', e);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const health = await fetchHealth();
        if (health.status === 'ok' || health.status === 'healthy') {
          setIsBackendHealthy(true);
        }
      } catch (e) {
        console.warn('FastAPI sağlık kontrolü bekleniyor:', e);
      }
      refreshModelInfo();
    };

    initApp();

    const interval = setInterval(async () => {
      try {
        const health = await fetchHealth();
        if (health.status === 'ok' || health.status === 'healthy') {
          setIsBackendHealthy(true);
          if (!modelInfo) {
            refreshModelInfo();
          }
        }
      } catch {
        // Yeniden dene
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const scrollToWorkspace = () => {
    setTimeout(() => {
      const el = document.getElementById('main-workspace');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleExploreInNetwork = (word: string) => {
    setSelectedWord(word);
    setActiveTab('visuals');
    setVisualsSubTab('network');
    scrollToWorkspace();
  };

  const isDark = theme === 'dark';

  const mainTabs = [
    { id: 'words', label: '1. Kelime Laboratuvarı', icon: Sparkles, desc: 'Benzerlik, Karşılaştırma, Analoji' },
    { id: 'text', label: '2. Metin Analizi', icon: FileText, desc: 'Kelime Frekansı & Vektör' },
    { id: 'visuals', label: '3. Görsel Harita & Ağ', icon: Compass, desc: '2D PCA & Semantik Ağ' },
    { id: 'corpus', label: '4. Sözlük, Vektör & Model Eğitimi', icon: Database, desc: 'Dağarcık & Vektör Boyutu' },
    { id: 'homework', label: '5. Ödev & Kaynaklar', icon: GraduationCap, desc: 'Ders Bağlantıları & Rapor' },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans ${
        isDark ? 'text-slate-100 bg-[#09090b]' : 'text-slate-900 bg-[#f8fafc]'
      }`}
      style={{ backgroundColor: 'var(--theme-bg, #09090b)' }}
    >
      {/* Üst Menü */}
      <Navbar
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenStudentGuide={() => setIsStudentGuideOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          scrollToWorkspace();
        }}
        isBackendHealthy={isBackendHealthy}
        theme={theme}
        onSelectTheme={(t) => setTheme(t)}
      />

      {/* Proje Başlığı ve Özet Bilgi */}
      <HeroSection
        modelInfo={modelInfo}
        onExploreClick={() => {
          setActiveTab('words');
          scrollToWorkspace();
        }}
        onCustomizeModel={() => {
          setActiveTab('corpus');
          setCorpusSubTab('training');
          scrollToWorkspace();
        }}
        onReportClick={() => {
          setActiveTab('homework');
          scrollToWorkspace();
        }}
      />

      {/* Ana Çalışma Alanı */}
      <main id="main-workspace" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Kullanıcı Dostu 5 Ana Sekme Çubuğu */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-start p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                    <span className="font-bold text-xs sm:text-sm tracking-tight truncate">
                      {tab.label}
                    </span>
                  </div>
                  <span className={`text-[10px] mt-0.5 truncate hidden sm:block ${
                    isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {tab.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. KELİME LABORATUVARI (Benzerlik, Karşılaştırma, Analoji) */}
        {activeTab === 'words' && (
          <WordLab onExploreInNetwork={handleExploreInNetwork} />
        )}

        {/* 2. METİN ANALİZİ */}
        {activeTab === 'text' && (
          <TextAnalysisLab />
        )}

        {/* 3. GÖRSEL HARİTA & AĞ */}
        {activeTab === 'visuals' && (
          <div className="space-y-6">
            {/* Alt Sekme Seçici */}
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisualsSubTab('pca')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    visualsSubTab === 'pca'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  2D Vektör Uzayı Haritası (PCA)
                </button>
                <button
                  type="button"
                  onClick={() => setVisualsSubTab('network')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    visualsSubTab === 'network'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Semantik İlişki Ağı Grafiği
                </button>
              </div>
            </div>

            {visualsSubTab === 'pca' ? (
              <VectorProjectionLab
                initialCenterWord={selectedWord}
                onSelectWord={(w) => setSelectedWord(w)}
                onCompareWords={(w1, w2) => {
                  setActiveTab('words');
                }}
              />
            ) : (
              <SemanticNetworkGraph
                initialWord={selectedWord}
                onSelectWord={(w) => setSelectedWord(w)}
              />
            )}
          </div>
        )}

        {/* 4. TÜRKÇE DERLEM & SÖZLÜK */}
        {activeTab === 'corpus' && (
          <div className="space-y-6">
            {/* Alt Sekme Seçici */}
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCorpusSubTab('stats')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  corpusSubTab === 'stats'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Derlem İstatistikleri & Frekans
              </button>
              <button
                type="button"
                onClick={() => setCorpusSubTab('vocab')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  corpusSubTab === 'vocab'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Model Sözlük Dağarcığı
              </button>
              <button
                type="button"
                onClick={() => setCorpusSubTab('training')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  corpusSubTab === 'training'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⚙️ Sözlük & Vektör Boyutunu Değiştir
              </button>
            </div>

            {corpusSubTab === 'stats' && (
              <CorpusExplorerLab onSelectWord={(w) => {
                setSelectedWord(w);
                setActiveTab('words');
              }} />
            )}

            {corpusSubTab === 'vocab' && (
              <VocabularyExplorer
                onSelectWord={(w) => {
                  setSelectedWord(w);
                  setActiveTab('words');
                }}
                onCompareWith={() => setActiveTab('words')}
              />
            )}

            {corpusSubTab === 'training' && (
              <ModelTrainingLab onModelTrained={refreshModelInfo} />
            )}
          </div>
        )}

        {/* 5. ÖDEV NOTLARI & KAYNAKLAR */}
        {activeTab === 'homework' && (
          <div className="space-y-8">
            <HomeworkResources />
            <AcademicMethodology />
          </div>
        )}
      </main>

      {/* Altbilgi */}
      <Footer
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenAcademic={() => {
          setActiveTab('homework');
          scrollToWorkspace();
        }}
      />

      {/* API Dokümantasyon Modalı */}
      <ApiDocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />

      {/* Öğrenci & Geliştirici Kılavuzu Modalı */}
      <StudentGuideModal isOpen={isStudentGuideOpen} onClose={() => setIsStudentGuideOpen(false)} />
    </div>
  );
}
