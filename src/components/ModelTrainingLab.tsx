import React, { useState } from 'react';
import { trainWord2VecModel } from '../api';
import { TrainModelParams, TrainModelResponse } from '../types';
import { Play, RotateCcw, CheckCircle2, AlertCircle, Loader2, Cpu, Sliders, Award } from 'lucide-react';

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
  });

  const [useCustomCorpus, setUseCustomCorpus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<TrainModelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrain = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    const payload: TrainModelParams = {
      ...params,
      custom_text: useCustomCorpus ? params.custom_text : undefined,
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
    });
    setUseCustomCorpus(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 mb-3">
              <Sliders className="w-3.5 h-3.5" />
              <span>Gensim 4.x Word2Vec Hiperparametre Laboratuvarı</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Model Eğitimi & Parametre İnceleme
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Word2Vec modelinin mimarisini (Skip-gram vs. CBOW), vektör boyutunu, bağlam penceresini
              ve negatif örnekleme katsayısını değiştirerek modeli gerçek zamanlı eğitin.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-colors flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılan Parametrelere Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Parametre Yapılandırma Paneli */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mimari Seçimi */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Model Mimarisi (sg)</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 text-[11px] font-bold">
                {params.sg === 1 ? 'Skip-gram (Önerilen)' : 'CBOW (Bag of Words)'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setParams({ ...params, sg: 1 })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  params.sg === 1
                    ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-400 dark:border-cyan-500/50 text-cyan-800 dark:text-cyan-300'
                    : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Skip-gram (sg=1)
              </button>
              <button
                type="button"
                onClick={() => setParams({ ...params, sg: 0 })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  params.sg === 0
                    ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-400 dark:border-cyan-500/50 text-cyan-800 dark:text-cyan-300'
                    : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                CBOW (sg=0)
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Skip-gram nadir kelimeleri ve küçük derlemleri daha iyi temsil eder; CBOW ise daha hızlı yakınsar.
            </p>
          </div>

          {/* Vektör Boyutu (vector_size) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Vektör Boyutu (d)</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{params.vector_size}</span>
            </div>
            <input
              type="range"
              min="20"
              max="250"
              step="10"
              value={params.vector_size}
              onChange={(e) => setParams({ ...params, vector_size: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Kelimenin gömüldüğü latent vektör uzayının boyutu (ör. 100 boyutlu n-sphere).
            </p>
          </div>

          {/* Pencere Boyutu (window) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Bağlam Penceresi (±w)</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">±{params.window} kelime</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              value={params.window}
              onChange={(e) => setParams({ ...params, window: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Hedef kelimenin sağı ve solundan dikkate alınacak maksimum komşu mesafesi.
            </p>
          </div>

          {/* Epoch Sayısı */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Eğitim Döngüsü (Epochs)</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{params.epochs} epoch</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={params.epochs}
              onChange={(e) => setParams({ ...params, epochs: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Tüm derlem üzerinde yapılacak tam optimizasyon geçişlerinin sayısı.
            </p>
          </div>

          {/* Negatif Örnekleme (negative) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Negatif Örnekleme (k)</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{params.negative} kelime</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              value={params.negative}
              onChange={(e) => setParams({ ...params, negative: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Her pozitif çift için gradyan güncellemesinde çekilecek gürültü kelimeleri.
            </p>
          </div>

          {/* Minimum Frekans & Tohum */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Min. Frekans</label>
              <input
                type="number"
                min="1"
                max="5"
                value={params.min_count}
                onChange={(e) => setParams({ ...params, min_count: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rastgele Tohum</label>
              <input
                type="number"
                value={params.seed}
                onChange={(e) => setParams({ ...params, seed: parseInt(e.target.value, 10) || 42 })}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Özel Metin / Derlem Ekleme Seçeneği */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={useCustomCorpus}
                onChange={(e) => setUseCustomCorpus(e.target.checked)}
                className="rounded bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
              />
              <span>Özel Eğitim Metni Kullan (Opsiyonel)</span>
            </label>
            <span className="text-[11px] text-slate-500">
              İşaretlenmezse sistemdeki zengin Türkçe derlem kullanılır.
            </span>
          </div>

          {useCustomCorpus && (
            <textarea
              rows={4}
              value={params.custom_text}
              onChange={(e) => setParams({ ...params, custom_text: e.target.value })}
              placeholder="Eğitmek istediğiniz Türkçe cümleleri buraya yapıştırın (en az 2-3 cümle)..."
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          )}
        </div>

        {/* Eğitimi Başlat Butonu */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
            <span>Python & Gensim kütüphanesi doğrudan yerel makinede çalıştırılır.</span>
          </div>

          <button
            type="button"
            onClick={handleTrain}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gensim ile Eğitiliyor...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Word2Vec Modelini Eğit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <div>
            <p className="font-semibold">Eğitim Başarısız</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Eğitim Başarı Raporu */}
      {report && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Eğitim Başarıyla Tamamlandı!</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Süre: <strong className="text-slate-900 dark:text-white">{report.training_time_seconds}s</strong>
            </span>
          </div>

          {/* Rapor Metrikleri */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Sözlük Büyüklüğü</span>
              <span className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5 block">
                {report.vocabulary_size} kelime
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Mimari</span>
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-1 block">
                {report.algorithm}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Ayrım Gücü</span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {report.evaluation?.discrimination_margin ?? 'N/A'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Model Durumu</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                Diske Kaydedildi & Aktif
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
                <span>Yüksek Çiftler Ort.: <strong className="text-emerald-600 dark:text-emerald-400">{report.evaluation.avg_similarity_high_tier}</strong></span>
                <span>Orta Çiftler Ort.: <strong className="text-amber-600 dark:text-amber-400">{report.evaluation.avg_similarity_medium_tier}</strong></span>
                <span>İlişkisiz Çiftler Ort.: <strong className="text-rose-600 dark:text-rose-400">{report.evaluation.avg_similarity_low_tier}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
