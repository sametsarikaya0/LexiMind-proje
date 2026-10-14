import React, { useState } from 'react';
import { trainWord2VecModel } from '../api';
import { TrainModelParams, TrainModelResponse } from '../types';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  Sliders,
  Award,
  BookOpen,
  Sparkles,
  Layers,
  FileText,
  PlusCircle,
  Zap
} from 'lucide-react';

interface ModelTrainingLabProps {
  onModelTrained?: () => void;
}

export const ModelTrainingLab: React.FC<ModelTrainingLabProps> = ({ onModelTrained }) => {
  const [params, setParams] = useState<TrainModelParams>({
    vector_size: 100,
    window: 5,
    min_count: 1,
    sg: 1, // 1 = Skip-gram, 0 = CBOW
    negative: 5,
    epochs: 40,
    seed: 42,
    custom_text: '',
    append_to_default: true,
  });

  const [useCustomCorpus, setUseCustomCorpus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<TrainModelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Vektör boyutu hazır şablonları
  const vectorPresets = [
    { size: 30, label: '30d (Kompakt)', desc: 'Hafif & hızlı' },
    { size: 50, label: '50d (Hafif)', desc: 'Düşük bellek' },
    { size: 100, label: '100d (Standart)', desc: 'Önerilen Word2Vec' },
    { size: 150, label: '150d (Geniş)', desc: 'Yüksek ayırt edicilik' },
    { size: 200, label: '200d (Gelişmiş)', desc: 'Zengin uzay' },
    { size: 300, label: '300d (Google Standardı)', desc: 'Maksimum kapasite' },
  ];

  // Hazır özel metin şablonları
  const sampleCustomTexts = [
    {
      title: 'Yapay Zeka & Bilişim',
      text: 'Yapay zeka ve derin öğrenme modelleri büyük veri üzerinde algoritmalar ile optimize edilir. Bilgisayar mühendisliği yazılım mimarisi, veri tabanları ve makine öğrenmesi uygulamaları geliştirir. Sinir ağları karmaşık örüntüleri tanımak için katmanlar boyunca parametreleri günceller.',
    },
    {
      title: 'Tıp & Sağlık Bilimleri',
      text: 'Hastanede uzman doktor ve hemşireler hastalara tanı koyarak tedavi sürecini yönetir. Tıp fakültesinde anatomi, biyokimya ve cerrahi disiplinleri klinik uygulamalarla öğretilir. Aşılar, antibiyotikler ve ilaçlar bağışıklık sistemini patojenlere karşı güçlendirir.',
    },
    {
      title: 'Hukuk & Adalet',
      text: 'Adalet sarayında hakim ve savcılar anayasa, kanunlar ve içtihatlar ışığında hüküm verir. Avukatlar müvekkillerinin haklarını mahkemede savunur. Hukuk devleti ilkesi bireysel hak ve özgürlüklerin teminatıdır.',
    },
  ];

  const handleTrain = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    const payload: TrainModelParams = {
      ...params,
      custom_text: useCustomCorpus ? params.custom_text : undefined,
      append_to_default: useCustomCorpus ? params.append_to_default : true,
    };

    try {
      const res = await trainWord2VecModel(payload);
      setReport(res);
      if (onModelTrained) {
        onModelTrained();
      }
    } catch (err: any) {
      setError(err?.message || 'Model eğitimi sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = () => {
    setParams({
      vector_size: 100,
      window: 5,
      min_count: 1,
      sg: 1,
      negative: 5,
      epochs: 40,
      seed: 42,
      custom_text: '',
      append_to_default: true,
    });
    setUseCustomCorpus(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Açıklama */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-3">
              <Sliders className="w-3.5 h-3.5" />
              <span>Gensim 4.x Word2Vec Dinamik Hiperparametre Laboratuvarı</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sözlük Dağarcığı & Vektör Boyutu Yapılandırması
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              İstediğiniz zaman <strong>vektör boyutunu (d)</strong>, <strong>sözlük dağarcığını</strong>,
              bağlam penceresini ve mimariyi (Skip-gram vs. CBOW) değiştirip modeli anında yeniden eğitebilirsiniz.
              Yeni eğitilen model tüm uygulamada hemen aktif olur.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-colors flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılanlara Sıfırla</span>
          </button>
        </div>
      </div>

      {/* 1. VEKTÖR BOYUTU YAPILANDIRMASI */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              1. Vektör Boyutu (Vector Dimension - d)
            </h3>
          </div>
          <span className="font-mono text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg border border-indigo-200 dark:border-indigo-800/50">
            d = {params.vector_size} Boyut
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Her Türkçe kelimenin gömüldüğü latent vektör uzayının boyutudur. Yüksek boyutlar daha zengin anlamsal
          nüansları yakalar; küçük boyutlar ise daha hızlı hesaplanır ve düşük bellek tüketir.
        </p>

        {/* Hızlı Ön Ayar Butonları */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
          {vectorPresets.map((vp) => (
            <button
              key={vp.size}
              type="button"
              onClick={() => setParams({ ...params, vector_size: vp.size })}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                params.vector_size === vp.size
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold">{vp.label}</div>
              <div
                className={`text-[10px] mt-0.5 ${
                  params.vector_size === vp.size ? 'text-indigo-100' : 'text-slate-500'
                }`}
              >
                {vp.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Hassas Kaydırıcı (Slider) */}
        <div className="pt-2 space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Minimum (20d)</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{params.vector_size} Boyut</span>
            <span>Maksimum (300d)</span>
          </div>
          <input
            type="range"
            min="20"
            max="300"
            step="10"
            value={params.vector_size}
            onChange={(e) => setParams({ ...params, vector_size: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* 2. SÖZLÜK DAĞARCIĞI VE DERLEM SEÇİMİ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              2. Sözlük Dağarcığı & Eğitim Derlemi
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            Zengin Türkçe Korpus (~2.027+ Kelime)
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Word2Vec modelinin öğrendiği kelime dağarcığını yönetin. Standart Türkçe derleme kendi kelime ve
          cümlelerinizi ekleyebilir veya tamamen özel bir veri kümesiyle eğitebilirsiniz.
        </p>

        {/* Özel Metin / Kelime Ekleme Anahtarı */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={useCustomCorpus}
                onChange={(e) => setUseCustomCorpus(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <span>Sözlük Dağarcığına Özel Kelime / Cümle Ekle</span>
            </label>
            <span className="text-[11px] text-slate-500">
              Kendi uzmanlık alanınıza veya ödev konusuna göre yeni kelimeler tanımlayın.
            </span>
          </div>

          {useCustomCorpus && (
            <div className="space-y-3 pt-2">
              {/* Dağarcık Birleştirme Modu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setParams({ ...params, append_to_default: true })}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    params.append_to_default
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Mevcut Dağarcığı Genişlet (Önerilen)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Mevcut 2.000+ Türkçe kelimeyi korur, girdiğiniz yeni kelimeleri de sözlüğe ekler.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setParams({ ...params, append_to_default: false })}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    !params.append_to_default
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Yalnızca Özel Metni Kullan</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sadece aşağıdaki kutudaki metni eğitir, sözlük sadece bu metindeki kelimelerden oluşur.
                  </p>
                </button>
              </div>

              {/* Hızlı Örnek Şablonları */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Hazır Örnek Yükle:
                </span>
                {sampleCustomTexts.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setParams({ ...params, custom_text: sample.text })}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>

              {/* Metin Giriş Alanı */}
              <textarea
                rows={4}
                value={params.custom_text}
                onChange={(e) => setParams({ ...params, custom_text: e.target.value })}
                placeholder="Eğitmek istediğiniz Türkçe cümleleri buraya yapıştırın veya yazın (Örn: 'Kuantum bilgisayarları süperpozisyon ve dolanıklık prensipleri ile çalışır. Kriptografi ve simülasyon alanlarında çığır açmaktadır.')..."
                className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. DİĞER HİPERPARAMETRELER (PENCERE, MİMARİ, EPOCH, MİN-COUNT) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            3. Model Mimarisi & Optimizasyon Parametreleri
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Mimari Seçimi */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Model Mimarisi</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
                {params.sg === 1 ? 'Skip-gram (sg=1)' : 'CBOW (sg=0)'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setParams({ ...params, sg: 1 })}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer text-center ${
                  params.sg === 1
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Skip-gram
              </button>
              <button
                type="button"
                onClick={() => setParams({ ...params, sg: 0 })}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer text-center ${
                  params.sg === 0
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                CBOW
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Skip-gram nadir kelimeleri daha iyi temsil eder; CBOW ise daha hızlıdır.
            </p>
          </div>

          {/* Bağlam Penceresi (window) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Pencere (±w)</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">±{params.window} kelime</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              value={params.window}
              onChange={(e) => setParams({ ...params, window: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 leading-tight">
              Hedef kelimenin sağından ve solundan taranacak komşu mesafesi.
            </p>
          </div>

          {/* Epoch Sayısı */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Eğitim Döngüsü</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{params.epochs} epoch</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={params.epochs}
              onChange={(e) => setParams({ ...params, epochs: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 leading-tight">
              Tüm derlem üzerindeki tam geçiş sayısı (30-50 önerilir).
            </p>
          </div>

          {/* Min Frekans (min_count) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Min. Frekans (Eşik)</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{params.min_count}</span>
            </div>
            <select
              value={params.min_count}
              onChange={(e) => setParams({ ...params, min_count: parseInt(e.target.value, 10) })}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold cursor-pointer"
            >
              <option value="1">1 (Tüm benzersiz kelimeler - En geniş dağarcık)</option>
              <option value="2">2 (En az 2 kez geçen kelimeler)</option>
              <option value="3">3 (En az 3 kez geçen kelimeler)</option>
            </select>
            <p className="text-[10px] text-slate-500 leading-tight">
              1 seçildiğinde tekil kelimeler de sözlüğe eklenir.
            </p>
          </div>
        </div>

        {/* Eğitimi Başlat Barı */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span>
              Eğitim doğrudan Python <strong>Gensim Word2Vec</strong> kütüphanesi üzerinde yürütülür.
            </span>
          </div>

          <button
            type="button"
            onClick={handleTrain}
            disabled={loading}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Word2Vec Modeli Eğitiliyor ({params.vector_size}d)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Modeli Yeniden Eğit ve Güncelle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hata Bildirimi */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <div>
            <p className="font-semibold">Eğitim Başarısız</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Başarı Raporu */}
      {report && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Yeni Model Başarıyla Eğitildi ve Uygulamada Aktif Edildi!
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Eğitim Süresi: <strong className="text-slate-900 dark:text-white">{report.training_time_seconds}s</strong>
            </span>
          </div>

          {/* Rapor Metrikleri */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Sözlük Dağarcığı</span>
              <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                {report.vocabulary_size} kelime
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Vektör Boyutu</span>
              <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                d = {report.parameters?.vector_size || params.vector_size}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Mimari & Epoch</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                {report.algorithm} ({report.parameters?.epochs || params.epochs} ep)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Sistem Durumu</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                Tüm Laboratuvarda Aktif
              </span>
            </div>
          </div>

          {/* Benchmark Değerlendirme Özeti */}
          {report.evaluation && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-300 font-semibold">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Türkçe Semantik Doğrulama Testi (LexiMind-TR-Eval)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {report.evaluation.interpretation}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                <span>
                  Yüksek Çiftler Ort.:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {report.evaluation.avg_similarity_high_tier}
                  </strong>
                </span>
                <span>
                  Orta Çiftler Ort.:{' '}
                  <strong className="text-amber-600 dark:text-amber-400">
                    {report.evaluation.avg_similarity_medium_tier}
                  </strong>
                </span>
                <span>
                  İlişkisiz Çiftler Ort.:{' '}
                  <strong className="text-rose-600 dark:text-rose-400">
                    {report.evaluation.avg_similarity_low_tier}
                  </strong>
                </span>
                <span>
                  Ayrım Gücü Marjı:{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    +{report.evaluation.discrimination_margin}
                  </strong>
                </span>
              </div>
            </div>
          )}

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>
              Artık <strong>Kelime Laboratuvarı</strong>, <strong>2D Vektör Haritası</strong> ve{' '}
              <strong>Sözlük Dağarcığı</strong> sekmelerinde yeni eğittiğiniz Word2Vec modelini doğrudan
              test edebilirsiniz!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
