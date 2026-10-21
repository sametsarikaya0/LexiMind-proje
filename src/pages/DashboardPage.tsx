import React, { useEffect, useState } from 'react';
import {
  FilePlus,
  History,
  Compass,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PageRoute, UserProfile, UserDashboardStats, AnalysisSummaryItem } from '../types';
import { fetchDashboardStats, fetchAnalysisHistory } from '../api';

interface DashboardPageProps {
  onNavigate: (page: PageRoute) => void;
  currentUser: UserProfile | null;
  onSelectAnalysis: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  currentUser,
  onSelectAnalysis,
}) => {
  const [stats, setStats] = useState<UserDashboardStats>({
    total_analyses: 0,
    total_extracted_keywords: 0,
    processed_documents: 0,
    most_recent_article: null,
  });
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [statsData, historyData] = await Promise.all([
          fetchDashboardStats(),
          fetchAnalysisHistory('', 5, 0),
        ]);
        setStats(statsData);
        setRecentAnalyses(historyData);
      } catch (err) {
        console.warn('Dashboard verisi yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [currentUser]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '—';
    return new Date(timestamp * 1000).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Welcome Section */}
      <div className="rounded-2xl p-6 sm:p-8 bg-[#151923] border border-[#1E2433] relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span>Akıllı Makale Analizi & Türkçe Doğal Dil İşleme</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {currentUser ? `Merhaba, ${currentUser.full_name}` : "Merhaba, LexiMind'e Hoş Geldin."}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            LexiMind, akademik makalelerinizden YAKE ve TextRank esintili istatistiksel algoritmalarla
            anahtar kelime ve çok kelimeli tamlamaları otomatik çıkarır; <strong>Gensim Word2Vec</strong> gömme
            modeliyle kelimeler arası anlamsal ilişkileri keşfetmenizi sağlar.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('new-analysis')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Yeni Analiz Başlat</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="px-5 py-2.5 rounded-xl bg-[#1C2230] hover:bg-[#252D40] text-slate-200 font-medium text-xs sm:text-sm border border-[#1E2433] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>Analiz Geçmişim</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Genuine Statistics Cards (Zero-pill, derived straight from database) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#151923] border border-[#1E2433]">
          <span className="text-xs text-slate-400 block font-medium">Toplam Analiz</span>
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1 block">
            {stats.total_analyses}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Sistemde kayıtlı analiz</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#151923] border border-[#1E2433]">
          <span className="text-xs text-slate-400 block font-medium">Çıkarılan Terimler</span>
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-400 mt-1 block">
            {stats.total_extracted_keywords}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Anahtar kelime & tamlama</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#151923] border border-[#1E2433]">
          <span className="text-xs text-slate-400 block font-medium">İşlenen Belgeler</span>
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400 mt-1 block">
            {stats.processed_documents}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">PDF, DOCX & Metin</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#151923] border border-[#1E2433] flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Son Analiz</span>
            <span className="text-sm font-bold text-white mt-1 block truncate">
              {stats.most_recent_article?.title || 'Henüz analiz yok'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block font-mono">
            {stats.most_recent_article?.created_at
              ? formatDate(stats.most_recent_article.created_at)
              : 'Analiz başlattığınızda görünür'}
          </span>
        </div>
      </div>

      {/* 3. Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white tracking-tight">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('new-analysis')}
            className="p-4 rounded-xl bg-[#151923] hover:bg-[#1C2230] border border-[#1E2433] hover:border-indigo-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white block">Belge Yükle (PDF / DOCX)</span>
            <span className="text-[11px] text-slate-400 mt-1 block leading-tight">
              Sürükle-bırak ile akademik makalenizi anında ayrıştırın.
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('new-analysis')}
            className="p-4 rounded-xl bg-[#151923] hover:bg-[#1C2230] border border-[#1E2433] hover:border-indigo-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white block">Metin Yapıştır & İncele</span>
            <span className="text-[11px] text-slate-400 mt-1 block leading-tight">
              Özet veya makale metnini doğrudan editöre girin.
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('words')}
            className="p-4 rounded-xl bg-[#151923] hover:bg-[#1C2230] border border-[#1E2433] hover:border-cyan-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white block">Word Explorer (Gezgin)</span>
            <span className="text-[11px] text-slate-400 mt-1 block leading-tight">
              Gensim Word2Vec modelinde kelime semantiği ve kosinüs benzerliği.
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('model')}
            className="p-4 rounded-xl bg-[#151923] hover:bg-[#1C2230] border border-[#1E2433] hover:border-indigo-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white block">Model Mimarisi & Ayarlar</span>
            <span className="text-[11px] text-slate-400 mt-1 block leading-tight">
              Vektör boyutu (d), sözlük dağarcığı ve hiperparametreler.
            </span>
          </button>
        </div>
      </div>

      {/* 4. Recent Analyses Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Son Yapılan Analizler</h3>
          </div>
          {recentAnalyses.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Tümünü Gör ({recentAnalyses.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-8 rounded-2xl bg-[#151923] border border-[#1E2433] text-center text-slate-400 text-xs">
            Analiz verileri yükleniyor...
          </div>
        ) : recentAnalyses.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#151923] border border-[#1E2433] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#1C2230] flex items-center justify-center mx-auto text-slate-400">
              <FilePlus className="w-6 h-6 text-slate-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Henüz Bir Makale Analiz Edilmedi</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                PDF veya DOCX formatındaki akademik makalenizi yükleyerek ya da metin yapıştırarak ilk analizinizi hemen başlatabilirsiniz.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('new-analysis')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>İlk Analizi Başlat</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#1E2433] bg-[#151923] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2433] text-slate-400 bg-[#10131B]">
                    <th className="py-3 px-4 font-semibold">Makale Başlığı</th>
                    <th className="py-3 px-4 font-semibold">Format</th>
                    <th className="py-3 px-4 font-semibold">Kelime Hacmi</th>
                    <th className="py-3 px-4 font-semibold">Anahtar Kelimeler</th>
                    <th className="py-3 px-4 font-semibold">Tarih</th>
                    <th className="py-3 px-4 font-semibold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2433]">
                  {recentAnalyses.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#1C2230] transition-colors cursor-pointer group"
                      onClick={() => onSelectAnalysis(item.id)}
                    >
                      <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="uppercase text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#10131B] border border-[#1E2433] text-slate-300">
                          {item.document_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {item.word_count.toLocaleString('tr-TR')} kelime
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {item.top_keywords.slice(0, 3).join(', ') || `${item.keyword_count} terim`}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAnalysis(item.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Sonuçları Gör ↗
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
