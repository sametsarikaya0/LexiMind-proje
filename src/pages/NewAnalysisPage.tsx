import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FilePlus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Sparkles,
  BookOpen,
  ArrowRight,
  Zap
} from 'lucide-react';
import { PageRoute, AnalysisRecord } from '../types';
import { analyzeArticle } from '../api';

interface NewAnalysisPageProps {
  onNavigate: (page: PageRoute) => void;
  onAnalysisSuccess: (analysis: AnalysisRecord) => void;
}

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({
  onNavigate,
  onAnalysisSuccess,
}) => {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [title, setTitle] = useState('');
  const [pasteText, setPasteText] = useState('');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis Parameters
  const [topN, setTopN] = useState<number>(10);
  const [includePhrases, setIncludePhrases] = useState<boolean>(true);
  const [showRelated, setShowRelated] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('tr');

  // Loading & Progress Stage
  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Realistic Academic Sample Texts
  const sampleAcademicArticles = [
    {
      title: 'Türkçe Doğal Dil İşleme ve Vektör Temsilleri',
      text: `Doğal dil işleme (NLP) ve derin öğrenme algoritmaları modern bilişim sistemlerinin en dinamik araştırma alanlarından birini oluşturmaktadır. 
Özellikle büyük ölçekli metin derlemleri üzerinde eğitilen Word2Vec ve dönüştürücü (transformer) mimarileri, kelimeler arasındaki anlamsal ilişkileri yüksek boyutlu vektör uzaylarında başarıyla modellemektedir. 
Bu araştırmada, Türkçe akademik makalelerden anahtar kelime çıkarımı ve semantik benzerlik tespiti deneysel olarak incelenmiştir. 
Türkçe'nin sondan eklemeli morfolojik yapısı, kök-ek ayrımını ve çok kelimeli tamlamaların doğru tespitini zorunlu kılmaktadır. 
Deneysel sonuçlar, çok kelimeli tamlama çıkarımının literatür tarama süreçlerinde konu özgüllüğünü belirgin biçimde artırdığını doğrulamaktadır.`,
    },
    {
      title: 'Yapay Zeka ve Klinik Tanı Destek Sistemleri',
      text: `Sağlık bilişimi ve yapay zeka teknolojileri, modern tıp uygulamalarında klinik karar destek sistemlerinin temel omurgasını meydana getirmektedir. 
Hastanelerde toplanan elektronik sağlık kayıtları, radyolojik görüntüler ve laboratuvar sonuçları, derin öğrenme modelleri aracılığıyla erken tanı ve risk sınıflandırmasında kullanılmaktadır. 
Uzman hekim ve sağlık personelinin iş yükünü hafifletmeyi hedefleyen bu sistemler, biyomedikal veri analitiğinde yüksek doğruluk oranlarına ulaşmıştır. 
Sonuç olarak, veri mahremiyeti ve algoritmik şeffaflık ilkeleri korunarak geliştirilen klinik modeller, hasta bakım kalitesini yükseltmektedir.`,
    },
  ];

  const handleFileChange = (file: File) => {
    setError(null);
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(ext)) {
      setError(`Geçersiz dosya formatı (${ext}). Yalnızca PDF, DOCX ve TXT dosyaları kabul edilir.`);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Dosya boyutu çok büyük (Maksimum 15 MB desteklenir).');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      setError('Dosya okunurken bir hata oluştu.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const wordCount = pasteText.trim() ? pasteText.trim().split(/\s+/).length : 0;
  const charCount = pasteText.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'upload' && !selectedFile) {
      setError('Lütfen analiz edilecek bir PDF, DOCX veya TXT dosyası seçin.');
      return;
    }
    if (mode === 'paste' && (!pasteText.trim() || wordCount < 5)) {
      setError('Lütfen analiz için en az 5-10 kelimelik bir metin girin.');
      return;
    }

    setLoading(true);
    setProgressStage('Metin okunuyor ve karakterler normalleştiriliyor...');

    try {
      const step1Timer = setTimeout(() => {
        setProgressStage('Türkçe etkisiz kelimeler ayıklanıyor ve cümleler ayrıştırılıyor...');
      }, 400);

      const step2Timer = setTimeout(() => {
        setProgressStage('Aday anahtar kelimeler ve çok kelimeli tamlamalar çıkarılıyor...');
      }, 900);

      const step3Timer = setTimeout(() => {
        setProgressStage('Gensim Word2Vec anlamsal ilişkileri ve kosinüs benzerliği taranıyor...');
      }, 1400);

      const result = await analyzeArticle({
        title: title.trim() || (selectedFile ? selectedFile.name : 'İsimsiz Analiz'),
        text: mode === 'paste' ? pasteText.trim() : undefined,
        file_content_base64: mode === 'upload' && fileBase64 ? fileBase64 : undefined,
        filename: mode === 'upload' && selectedFile ? selectedFile.name : 'belge.txt',
        top_n: topN,
        include_phrases: includePhrases,
        show_related: showRelated,
        language: language,
      });

      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);

      onAnalysisSuccess(result);
    } catch (err: any) {
      setError(err?.message || 'Makale analizi sırasında beklenmedik bir hata oluştu.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Başlık Alanı */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Yeni Makale Analizi</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Akademik makalenizi PDF, DOCX veya TXT olarak yükleyin ya da metin editörüne doğrudan yapıştırın.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Giriş Modu Seçimi (Clean Segmented Control) */}
        <div className="flex items-center gap-1 p-1 bg-[#151923] border border-[#1E2433] rounded-xl max-w-sm">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'upload'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Belge Yükle (PDF / DOCX)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('paste')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'paste'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Metin Yapıştır</span>
          </button>
        </div>

        {/* Makale Başlığı (Opsiyonel) */}
        <div className="p-5 rounded-2xl bg-[#151923] border border-[#1E2433] space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Makale / Belge Başlığı <span className="text-slate-500 font-normal">(Opsiyonel)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Türkçe Doğal Dil İşleme ve Makine Öğrenmesi Üzerine Bir Araştırma"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#10131B] border border-[#1E2433] text-white text-xs placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        {/* MOD A: Belge Yükleme Alanı */}
        {mode === 'upload' && (
          <div className="p-6 rounded-2xl bg-[#151923] border border-[#1E2433] space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-[#1E2433] hover:border-indigo-500/50 hover:bg-[#1C2230]/50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    Dosyayı buraya sürükleyip bırakın veya <span className="text-indigo-400 underline">göz atın</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Desteklenen formatlar: <strong>PDF</strong>, <strong>DOCX</strong>, <strong>TXT</strong> (Maksimum 15 MB)
                  </p>
                </div>
                <span className="text-[11px] text-slate-500">
                  Metin katmanı içeren dijital akademik belgeler önerilir.
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#10131B] border border-[#1E2433] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold font-mono text-xs uppercase">
                    {selectedFile.name.split('.').pop()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || 'Belge'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  title="Dosyayı Kaldır"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* MOD B: Metin Yapıştırma Alanı */}
        {mode === 'paste' && (
          <div className="p-6 rounded-2xl bg-[#151923] border border-[#1E2433] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300">
                Makale Metni / Bildiri Özeti
              </label>

              {/* Hazır Örnek Makale Butonları */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Örnek Ekle:
                </span>
                {sampleAcademicArticles.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(sample.title);
                      setPasteText(sample.text);
                    }}
                    className="px-2 py-0.5 rounded text-[11px] bg-[#10131B] hover:bg-[#1C2230] border border-[#1E2433] text-indigo-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {sample.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={9}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Makalenizin tam metnini veya özet kısmını buraya yapıştırın (başlık, giriş, yöntem, tartışma bölümleri)..."
              className="w-full p-4 rounded-xl bg-[#10131B] border border-[#1E2433] text-white text-xs leading-relaxed placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors font-mono"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
              <div className="flex items-center gap-4">
                <span>{wordCount.toLocaleString('tr-TR')} Kelime</span>
                <span>·</span>
                <span>{charCount.toLocaleString('tr-TR')} Karakter</span>
              </div>
              {pasteText && (
                <button
                  type="button"
                  onClick={() => setPasteText('')}
                  className="text-rose-400 hover:text-rose-300 underline cursor-pointer"
                >
                  Metni Temizle
                </button>
              )}
            </div>
          </div>
        )}

        {/* Analiz Parametreleri & Ayarlar */}
        <div className="p-6 rounded-2xl bg-[#151923] border border-[#1E2433] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white pb-2 border-b border-[#1E2433]">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Analiz Parametreleri & Çıkarım Ayarları</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            {/* Terim Sayısı (5, 10, 15, 20) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Terim Sayısı
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTopN(num)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      topN === num
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                        : 'bg-[#10131B] border-[#1E2433] text-slate-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Çok Kelimeli Tamlamalar (N-Gram) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Çok Kelimeli Tamlamalar
              </label>
              <button
                type="button"
                onClick={() => setIncludePhrases(!includePhrases)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                  includePhrases
                    ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
                    : 'bg-[#10131B] border-[#1E2433] text-slate-400'
                }`}
              >
                <span>Bigram / Trigram</span>
                <span className="font-mono text-[11px] font-bold">
                  {includePhrases ? 'AÇIK' : 'KAPALI'}
                </span>
              </button>
            </div>

            {/* Word2Vec Anlamsal İlişkiler */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Word2Vec İlişkileri
              </label>
              <button
                type="button"
                onClick={() => setShowRelated(!showRelated)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                  showRelated
                    ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
                    : 'bg-[#10131B] border-[#1E2433] text-slate-400'
                }`}
              >
                <span>Semantik Komşuluk</span>
                <span className="font-mono text-[11px] font-bold">
                  {showRelated ? 'AÇIK' : 'KAPALI'}
                </span>
              </button>
            </div>

            {/* Dil Seçimi */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Metin Dili
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-[#10131B] border border-[#1E2433] text-white text-xs font-semibold cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                <option value="tr">Türkçe (Öncelikli)</option>
                <option value="en">İngilizce</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hata Bildirimi */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-bold">Hata Oluştu</p>
              <p className="mt-0.5 text-rose-200">{error}</p>
            </div>
          </div>
        )}

        {/* Ana Aksiyon ve Yükleme Durumu */}
        <div className="space-y-3 pt-2">
          {loading && (
            <div className="p-4 rounded-xl bg-[#10131B] border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400 flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="font-bold text-white block">Analiz Yürütülüyor...</span>
                <span className="text-slate-400">{progressStage}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Makale İşleniyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Makaleyi Analiz Et</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
