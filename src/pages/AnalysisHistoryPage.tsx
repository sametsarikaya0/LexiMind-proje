import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Trash2,
  FileText,
  Clock,
  ExternalLink,
  AlertTriangle,
  FilePlus,
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';
import { AnalysisSummaryItem, PageRoute } from '../types';
import { fetchAnalysisHistory, deleteAnalysisById } from '../api';

interface AnalysisHistoryPageProps {
  onSelectAnalysis: (id: string) => void;
  onNavigate: (page: PageRoute) => void;
}

export const AnalysisHistoryPage: React.FC<AnalysisHistoryPageProps> = ({
  onSelectAnalysis,
  onNavigate,
}) => {
  const [history, setHistory] = useState<AnalysisSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [itemToDelete, setItemToDelete] = useState<AnalysisSummaryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchAnalysisHistory(search);
      setHistory(data);
    } catch (err) {
      console.warn('Geçmiş alınırken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [search]);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deleteAnalysisById(itemToDelete.id);
      setItemToDelete(null);
      await loadHistory();
    } catch (err) {
      alert('Analiz silinirken bir hata oluştu.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Başlık ve Arama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Analiz Geçmişi</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Önceden analiz ettiğiniz akademik makaleler ve çıkarılan anahtar kelime kayıtları.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Makale başlığı ara..."
              className="pl-8 pr-3 py-2 rounded-xl bg-[#151923] border border-[#1E2433] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-52 sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => onNavigate('new-analysis')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Yeni Analiz</span>
          </button>
        </div>
      </div>

      {/* Liste İçeriği */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto mb-2" />
          <span>Analiz geçmişi yükleniyor...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#151923] border border-[#1E2433] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#1C2230] flex items-center justify-center mx-auto text-slate-400">
            <History className="w-6 h-6 text-slate-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              {search ? 'Arama Kriterine Uygun Analiz Bulunamadı' : 'Kayıtlı Analiz Bulunmuyor'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {search
                ? 'Farklı bir arama terimi deneyebilir veya yeni bir makale analizi başlatabilirsiniz.'
                : 'Akademik bir makale yükleyip analiz ettiğinizde sonuçlar burada kronolojik olarak listelenecektir.'}
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
                  <th className="py-3 px-4 font-semibold">Hacim</th>
                  <th className="py-3 px-4 font-semibold">Öne Çıkan Terimler</th>
                  <th className="py-3 px-4 font-semibold">Tarih</th>
                  <th className="py-3 px-4 font-semibold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2433]">
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#1C2230] transition-colors cursor-pointer group"
                    onClick={() => onSelectAnalysis(item.id)}
                  >
                    <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="uppercase text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#10131B] border border-[#1E2433] text-slate-300">
                        {item.document_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {item.word_count.toLocaleString('tr-TR')} kelime
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {item.top_keywords.slice(0, 4).join(', ') || `${item.keyword_count} terim`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectAnalysis(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          İncele ↗
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          title="Analizi Sil"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#151923] border border-[#1E2433] shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Analiz Kaydını Sil?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Bu işlem geri alınamaz.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#10131B] p-3 rounded-xl border border-[#1E2433]">
              <strong>"{itemToDelete.title}"</strong> başlıklı analiz kaydı ve tüm ilişkili anahtar kelimeler sistemden kalıcı olarak silinecektir.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#171C28] border border-[#1E2433] cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Evet, Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
