import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Database,
  BarChart3,
  Award,
  RefreshCw,
  GitBranch
} from 'lucide-react';
import { fetchModelInfo, fetchEvaluationReport } from '../api';
import { ModelInfo, EvaluationResponse, PageRoute } from '../types';
import { ModelTrainingLab } from '../components/ModelTrainingLab';
import { VocabularyExplorer } from '../components/VocabularyExplorer';
import { CorpusExplorerLab } from '../components/CorpusExplorerLab';

interface ModelInfoPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const ModelInfoPage: React.FC<ModelInfoPageProps> = ({ onNavigate }) => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [evalReport, setEvalReport] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'overview' | 'training' | 'vocab' | 'corpus'>('overview');

  const loadData = async () => {
    setLoading(true);
    try {
      const [info, ev] = await Promise.all([
        fetchModelInfo().catch(() => null),
        fetchEvaluationReport().catch(() => null),
      ]);
      if (info) setModelInfo(info);
      if (ev) setEvalReport(ev);
    } catch (e) {
      console.warn('Model verileri alınırken hata:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2433] pb-6">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Cpu className="w-4 h-4" />
            <span>NLP Mimarisi & Model Şeffaflığı</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Model Mimarisi & Hiperparametreler
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            LexiMind sisteminde kullanılan Gensim Word2Vec gömme motorunun yapılandırması,
            eğitim derlemi, akademik anahtar kelime çıkarım mimarisi ve canlı değerlendirme metrikleri.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 rounded-xl bg-[#141824] border border-[#232A3B] self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setSubTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Genel Bakış & Metrikler</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('training')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'training'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>⚙️ Vektör Boyutu & Model Eğit</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('vocab')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'vocab'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Model Sözlüğü</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('corpus')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'corpus'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Derlem İstatistikleri</span>
          </button>
        </div>
      </div>

      {subTab === 'overview' && (
        <div className="space-y-8">
          {/* Metodolojik Fark Kartı (Keyword Extraction vs Word Embeddings) */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-[#151923] to-[#151923] border border-indigo-500/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex-shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-bold text-white">
                  Önemli Metodolojik Ayrım: Anahtar Kelime Çıkarımı ve Word2Vec Arasındaki Fark
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong>Word2Vec tek başına tek bir belgeden anahtar kelime çıkarım algoritması değildir.</strong> Word2Vec, 
                  büyük metin koleksiyonlarında kelimelerin eş-oluşum (co-occurrence) dağılımlarını öğrenerek sözcükleri vektör 
                  uzayında modeller. LexiMind'de makale analizi için istatistiksel ve graf-tabanlı aday skorlama 
                  (YAKE / TextRank prensipleriyle kelime frekansı, konum ağırlığı ve n-gram tamlama tespiti) kullanılırken; 
                  <strong> Gensim Word2Vec</strong> ise çıkarılan bu anahtar kelimelerin anlamsal yakınlarını keşfetmek, 
                  akademik kavram komşuluklarını haritalamak ve analoji kurmak için devreye girer.
                </p>
              </div>
            </div>
          </div>

          {/* Gerçek Model Parametreleri Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#151923] border border-[#232A3B]">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Vektör Boyutu (Dimension)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{modelInfo?.vector_size || 100}d</span>
                <span className="text-xs text-indigo-400 font-medium">Float32 Vektörler</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Her kelime uzayda {modelInfo?.vector_size || 100} sayılık diziyle temsil edilir.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#151923] border border-[#232A3B]">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Sözlük Büyüklüğü (Vocabulary)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400">{modelInfo?.vocab_size ? modelInfo.vocab_size.toLocaleString('tr-TR') : 'Yükleniyor...'}</span>
                <span className="text-xs text-slate-400 font-medium">kelime</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Modelin vektör uzayında sakladığı benzersiz Türkçe terim hacmi.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#151923] border border-[#232A3B]">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Pencere Boyutu (Window Size)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">±{modelInfo?.window || 5}</span>
                <span className="text-xs text-slate-400 font-medium">sağ ve sol bağlam</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Kelimenin sağından ve solundan taranan eş-oluşum penceresi.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#151923] border border-[#232A3B]">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Mimari & Örnekleme</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-cyan-400">Skip-gram</span>
                <span className="text-xs text-slate-400 font-medium">Neg. Samp. k=5</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Nadir kelimelerde yüksek başarı sağlayan SG mimarisi.</p>
            </div>
          </div>

          {/* Değerlendirme Seti Benchmark Raporu */}
          {evalReport && (
            <div className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    {evalReport.benchmark_name || 'Türkçe Semantik Değerlendirme Benchmarkı'}
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                  Ayrım Marjı: +{(evalReport.discrimination_margin || 0).toFixed(4)}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-400">
                {evalReport.interpretation || 'Model doğrulaması başarıyla tamamlandı.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#0F121A] border border-[#1E2433]">
                  <span className="text-xs text-slate-400 block">Yüksek Benzerlik Grubu</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {(evalReport.avg_similarity_high_tier || 0).toFixed(4)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">Eş anlam / ilişkili kavramlar</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0F121A] border border-[#1E2433]">
                  <span className="text-xs text-slate-400 block">Orta Benzerlik Grubu</span>
                  <span className="text-lg font-bold text-indigo-400">
                    {(evalReport.avg_similarity_medium_tier || 0).toFixed(4)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">Aynı alan terimleri</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0F121A] border border-[#1E2433]">
                  <span className="text-xs text-slate-400 block">İlişkisiz Kelime Çiftleri</span>
                  <span className="text-lg font-bold text-slate-400">
                    {(evalReport.avg_similarity_low_tier || 0).toFixed(4)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">Rastgele kelime çiftleri</span>
                </div>
              </div>
            </div>
          )}

          {/* Bilinen Sınırlılıklar & Akademik Notlar */}
          <div className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>Dürüst Metrikler ve Bilinen Sınırlılıklar</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 list-disc list-inside">
              <li>
                <strong>Eğitim Derlemi Hacmi:</strong> Bu demonstrasyon modeli ~2.400 benzersiz terim içeren akademik Türkçe derlemle eğitilmiştir. İnternetin tamamı üzerinde eğitilmiş milyarlarca parametreli ticari bir LLM değildir.
              </li>
              <li>
                <strong>Sözlük Dışı (OOV) Kelimeler:</strong> Sözlükte yer almayan kelimeler için sahte skor üretilmez; arayüzde açıkça sözlük dışı olduğu belirtilir.
              </li>
              <li>
                <strong>Sondan Eklemeli Yapı:</strong> Türkçe'nin zengin çekim eki yapısı sebebiyle aynı kökten türeyen biçimler ayrı sözlük girdisi olarak öğrenilebilir.
              </li>
              <li>
                <strong>Statik Vektör Doğası:</strong> Word2Vec her kelimeye tek bir sabit vektör atar; "yüz" (sayı, çehre, eylem) gibi çok anlamlı kelimelerin anlamları tek bir vektörde birleşir.
              </li>
            </ul>
          </div>
        </div>
      )}

      {subTab === 'training' && (
        <div className="space-y-6">
          <ModelTrainingLab onModelTrained={loadData} />
        </div>
      )}

      {subTab === 'vocab' && (
        <div className="space-y-6">
          <VocabularyExplorer onSelectWord={() => onNavigate('words')} onCompareWith={() => onNavigate('words')} />
        </div>
      )}

      {subTab === 'corpus' && (
        <div className="space-y-6">
          <CorpusExplorerLab onSelectWord={() => onNavigate('words')} />
        </div>
      )}
    </div>
  );
};
