import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  RotateCcw,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  ExternalLink,
  Share2,
  FileText
} from 'lucide-react';
import { AnalysisRecord, KeywordResult, PageRoute } from '../types';

interface AnalysisResultsPageProps {
  analysis: AnalysisRecord;
  onReanalyze: () => void;
  onNavigate: (page: PageRoute) => void;
}

export const AnalysisResultsPage: React.FC<AnalysisResultsPageProps> = ({
  analysis,
  onReanalyze,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'single' | 'phrase'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'frequency'>('rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [expandedContextIndex, setExpandedContextIndex] = useState<number | null>(null);

  // Filter and sort keywords
  const filteredKeywords = analysis.keywords
    .filter((kw) => {
      const matchesSearch = kw.term.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterType === 'single') return !kw.is_phrase;
      if (filterType === 'phrase') return kw.is_phrase;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'rank') comparison = a.rank - b.rank;
      else if (sortBy === 'score') comparison = b.score - a.score;
      else if (sortBy === 'frequency') comparison = b.frequency - a.frequency;
      return sortAsc ? comparison : -comparison;
    });

  const handleCopyTerm = (term: string) => {
    navigator.clipboard.writeText(term);
    setCopiedId(term);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const text = analysis.keywords
      .map((k) => `${k.rank}. ${k.term} (Skor: ${k.score}, Frekans: ${k.frequency})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportCSV = () => {
    const header = 'Sıra,Anahtar Kelime,Tür,Önem Skoru,Frekans,Word2Vec İlişkili Kelimeler,Bağlam Cümlesi\n';
    const rows = analysis.keywords.map((k) => {
      const type = k.is_phrase ? 'Tamlama' : 'Tekil Kelime';
      const related = (k.related_words || []).map((r) => `${r.word} (${r.percentage})`).join('; ');
      const cleanContext = (k.context || '').replace(/"/g, '""');
      return `${k.rank},"${k.term}","${type}",${k.score},${k.frequency},"${related}","${cleanContext}"`;
    });
    const blob = new Blob(['\uFEFF' + header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leximind_analiz_${analysis.title.replace(/\s+/g, '_').toLowerCase()}.csv`;
    link.click();
  };

  const handleExportTXT = () => {
    let content = `LEXIMIND — AKADEMİK MAKALE ANALİZ RAPORU\n`;
    content += `==========================================\n`;
    content += `Makale Başlığı: ${analysis.title}\n`;
    content += `Analiz Tarihi: ${new Date(analysis.created_at * 1000).toLocaleString('tr-TR')}\n`;
    content += `Kelime Hacmi: ${analysis.word_count} kelime | Cümle Sayısı: ${analysis.sentence_count}\n`;
    content += `İşlem Süresi: ${analysis.processing_time_ms} ms\n`;
    content += `==========================================\n\n`;
    content += `ÇIKARILAN ANAHTAR KELİMELER VE TAMLAMALAR:\n\n`;
    analysis.keywords.forEach((k) => {
      content += `${k.rank}. ${k.term.toUpperCase()} [${k.is_phrase ? 'Tamlama' : 'Kelime'}]\n`;
      content += `   · Önem Skoru: ${k.score} | Frekans: ${k.frequency}\n`;
      if (k.related_words && k.related_words.length > 0) {
        content += `   · Word2Vec İlişkili: ${k.related_words.map((r) => `${r.word} (${r.percentage})`).join(', ')}\n`;
      }
      if (k.context) {
        content += `   · Bağlam: "${k.context}"\n`;
      }
      content += `\n`;
    });
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leximind_analiz_${analysis.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. Header & Actions Bar */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151923] border border-[#1E2433] space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            {/* Quiet Unboxed Metadata (Zero-pill) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-indigo-400 uppercase tracking-wider font-mono">
                {analysis.document_type} Belgesi
              </span>
              <span aria-hidden="true">·</span>
              <span>{new Date(analysis.created_at * 1000).toLocaleDateString('tr-TR')}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{analysis.processing_time_ms} ms işlem süresi</span>
              <span aria-hidden="true">·</span>
              <span>Gensim Word2Vec Destekli</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {analysis.title}
            </h1>

            {analysis.raw_text_summary && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                {analysis.raw_text_summary}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-[#1C2230] hover:bg-[#252D40] text-slate-200 text-xs font-semibold border border-[#1E2433] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>CSV İndir</span>
            </button>

            <button
              type="button"
              onClick={handleExportTXT}
              className="px-3 py-2 rounded-xl bg-[#1C2230] hover:bg-[#252D40] text-slate-200 text-xs font-semibold border border-[#1E2433] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>TXT İndir</span>
            </button>

            <button
              type="button"
              onClick={onReanalyze}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Yeniden Analiz Et</span>
            </button>
          </div>
        </div>

        {/* 2. Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#1E2433]">
          <div className="p-3 rounded-xl bg-[#10131B] border border-[#1E2433]">
            <span className="text-[11px] text-slate-400 block font-medium">Toplam Kelime</span>
            <span className="text-base sm:text-lg font-bold font-mono text-white mt-0.5 block">
              {analysis.word_count.toLocaleString('tr-TR')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#10131B] border border-[#1E2433]">
            <span className="text-[11px] text-slate-400 block font-medium">Cümle Sayısı</span>
            <span className="text-base sm:text-lg font-bold font-mono text-white mt-0.5 block">
              {analysis.sentence_count.toLocaleString('tr-TR')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#10131B] border border-[#1E2433]">
            <span className="text-[11px] text-slate-400 block font-medium">Çıkarılan Terimler</span>
            <span className="text-base sm:text-lg font-bold font-mono text-indigo-400 mt-0.5 block">
              {analysis.keywords.length} Terim
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#10131B] border border-[#1E2433]">
            <span className="text-[11px] text-slate-400 block font-medium">Word2Vec Durumu</span>
            <span className="text-xs font-bold text-emerald-400 mt-1 block truncate">
              {analysis.model_status?.algorithm || 'Aktif & Yüklü'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Visual Relevance Weight Preview (Anti-slop clean badges based on real scores) */}
      <div className="p-6 rounded-2xl bg-[#151923] border border-[#1E2433] space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Anlamsal Ağırlık Dağılımı
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Boyut ve renk doygunluğu hesaplanan istatistiksel önem skorunu yansıtır.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {analysis.keywords.map((kw) => {
            const isHigh = kw.score >= 0.85;
            const isMed = kw.score >= 0.65;
            return (
              <span
                key={kw.term}
                onClick={() => handleCopyTerm(kw.term)}
                title={`Skor: ${kw.score} · Frekans: ${kw.frequency} · Kopyalamak için tıklayın`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isHigh
                    ? 'bg-indigo-950/60 border-indigo-500/60 text-white shadow-xs'
                    : isMed
                    ? 'bg-[#1C2230] border-[#2D3748] text-slate-200'
                    : 'bg-[#10131B] border-[#1E2433] text-slate-400'
                }`}
              >
                <span>{kw.term}</span>
                <span className="text-[10px] opacity-60 font-mono">#{kw.rank}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* 4. Keyword Table with Search, Filter & Sort */}
      <div className="p-6 rounded-2xl bg-[#151923] border border-[#1E2433] space-y-4 shadow-sm">
        {/* Table Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2433]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Anahtar Kelimeler ve Tamlamalar Tablosu
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Terim ara..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#10131B] border border-[#1E2433] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
              />
            </div>

            {/* Filter Toggle (All, Single, Phrases) */}
            <div className="flex items-center gap-1 p-0.5 bg-[#10131B] border border-[#1E2433] rounded-lg">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tümü ({analysis.keywords.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('single')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  filterType === 'single' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Kelimeler
              </button>
              <button
                type="button"
                onClick={() => setFilterType('phrase')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  filterType === 'phrase' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tamlamalar
              </button>
            </div>

            {/* Copy All Button */}
            <button
              type="button"
              onClick={handleCopyAll}
              className="px-3 py-1.5 rounded-xl bg-[#1C2230] hover:bg-[#252D40] text-slate-300 hover:text-white border border-[#1E2433] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Kopyalandı' : 'Tümünü Kopyala'}</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2433] text-slate-400 bg-[#10131B]">
                <th
                  onClick={() => {
                    if (sortBy === 'rank') setSortAsc(!sortAsc);
                    else { setSortBy('rank'); setSortAsc(true); }
                  }}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-white w-12"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Anahtar Kelime / Tamlama</th>
                <th
                  onClick={() => {
                    if (sortBy === 'score') setSortAsc(!sortAsc);
                    else { setSortBy('score'); setSortAsc(false); }
                  }}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Önem Skoru</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'frequency') setSortAsc(!sortAsc);
                    else { setSortBy('frequency'); setSortAsc(false); }
                  }}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Frekans</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Word2Vec Anlamsal Komşular</th>
                <th className="py-3 px-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2433]">
              {filteredKeywords.map((item, idx) => (
                <React.Fragment key={item.term}>
                  <tr className="hover:bg-[#1C2230]/70 transition-colors group">
                    <td className="py-3.5 px-3 font-mono text-slate-500 font-bold">
                      {item.rank}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {item.term}
                        </span>
                        {item.is_phrase && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
                            Tamlama
                          </span>
                        )}
                      </div>
                      {item.context && (
                        <button
                          type="button"
                          onClick={() => setExpandedContextIndex(expandedContextIndex === idx ? null : idx)}
                          className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 mt-1 cursor-pointer"
                        >
                          <span>{expandedContextIndex === idx ? 'Bağlamı Gizle' : 'Metin Bağlamını Gör'}</span>
                          {expandedContextIndex === idx ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">
                          {item.score.toFixed(3)}
                        </span>
                        <div className="w-16 h-1.5 bg-[#10131B] rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            style={{ width: `${Math.min(100, item.score * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {item.frequency} kez
                    </td>

                    <td className="py-3.5 px-4">
                      {item.related_words && item.related_words.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.related_words.map((rel) => (
                            <span
                              key={rel.word}
                              onClick={() => {
                                onNavigate('words');
                              }}
                              title={`Word2Vec Benzerlik: ${rel.percentage}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#10131B] border border-[#1E2433] text-slate-300 hover:border-indigo-500/50 hover:text-white transition-colors cursor-pointer text-[11px]"
                            >
                              <span>{rel.word}</span>
                              <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                                {rel.percentage}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          {item.vocab_status || 'Model sözlüğünde yok (OOV)'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopyTerm(item.term)}
                        title="Terimi Kopyala"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#10131B] transition-colors cursor-pointer"
                      >
                        {copiedId === item.term ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Context Accordion Row */}
                  {expandedContextIndex === idx && item.context && (
                    <tr className="bg-[#10131B]/80">
                      <td colSpan={6} className="p-4 border-t border-[#1E2433]">
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-indigo-400 block">
                            Metin İçi Doğrudan Bağlam Cümlesi:
                          </span>
                          <p className="text-xs text-slate-300 font-mono leading-relaxed bg-[#151923] p-3 rounded-xl border border-[#1E2433]">
                            "{item.context}"
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Collapsible Methodological Explanation (Section 8 Requirement) */}
      <div className="rounded-2xl border border-[#1E2433] bg-[#151923] overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-[#1C2230] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white">Bu Analiz Nasıl Yapıldı? (Akademik Metodoloji)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kullanılan NLP algoritmaları, Gensim Word2Vec'in rolü ve metodolojik sınırlar.
              </p>
            </div>
          </div>
          {isMethodologyOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {isMethodologyOpen && (
          <div className="p-6 border-t border-[#1E2433] bg-[#10131B] text-xs space-y-4 leading-relaxed text-slate-300">
            <div>
              <h4 className="font-bold text-white text-sm mb-1">1. Metin Ön İşleme ve Türkçe Morfolojik Filtreleme</h4>
              <p>
                Yüklenen veya yapıştırılan akademik makaleden ilk olarak atıf parantezleri (örn. [1, 2], [Smith et al., 2021]),
                DOI linkleri ve yazım gürültüleri ayıklanır. Türkçe'deki noktalı/noktasız harfler (ç, ğ, ı, İ, ö, ş, ü) korunarak
                küçük harf dönüşümü yapılır. Türkçe akademik stop-words (bağlaçlar, edatlar, zamirler ve dolgu ifadeleri) elenerek
                cümle sınırları güvenle tespit edilir.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-1">2. Anahtar Kelime & Tamlama Çıkarımı (YAKE & TextRank)</h4>
              <p>
                Tekil kelimelerin (unigram) yanı sıra iki kelimeli (bigram) ve üç kelimeli (trigram) akademik tamlamalar
                aday olarak toplanır. Adaylar; terim frekansı (TF), makale başlığı ve girişindeki konumsal öncelik (positional weight),
                cümleler arası yayılım (sentence dispersion) ve adayların cümle içindeki bilgi yoğunluğu dikkate alınarak
                bileşik bir formülle puanlanır. Benzer veya alt parça olan adaylar tekrara düşmemek için elenir.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-1">3. Gensim Word2Vec'in Rolü & Metodolojik Ayrım</h4>
              <p>
                <strong>Önemli Metodolojik Bilgi:</strong> Word2Vec algoritması tek başına tek bir belgeden anahtar kelime
                çıkarmak için tasarlanmamıştır; kelimelerin bağlamsal dağılımını (Distributional Hypothesis) latent vektör uzayında
                temsil eder. LexiMind'da anahtar kelime çıkarımı istatistiksel/grafiksel yöntemlerle yapılırken,
                <strong> Gensim Word2Vec</strong> çıkarılan bu anahtar kelimelerin anlamsal olarak en yakın olduğu komşu terimleri
                ve kosinüs benzerliğini hesaplamak amacıyla kullanılır.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-1">4. Model Kapsamı ve İnsani Değerlendirme</h4>
              <p>
                Gensim Word2Vec modelimiz akademik derlem üzerinde eğitilmiştir. Eğer bir anahtar kelime eğitim derleminde
                yer almıyorsa, sistem sahte skorlar üretmek yerine dürüstçe <em>"Model sözlüğünde yok (OOV)"</em> durumunu raporlar.
                Otomatik çıkarılan terimler araştırmacı için güçlü bir öneri ve filtreleme aracıdır; nihai akademik değerlendirmede
                uzman gözüyle incelenmelidir.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
