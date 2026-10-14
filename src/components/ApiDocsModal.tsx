import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, Terminal, Code2 } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const curlSimilar = `curl -X POST "http://127.0.0.1:8001/api/similar" \\
  -H "Content-Type: application/json" \\
  -d '{"word": "yapay", "top_n": 5}'`;

  const pythonExample = `import requests

url = "http://127.0.0.1:8001/api/compare"
payload = {"word1": "bilgisayar", "word2": "yazılım"}
res = requests.post(url, json=payload)
data = res.json()

print(f"Kosinüs Benzerliği: {data['cosine_similarity']}")
print(f"İlişki Düzeyi: {data['relation_level']}")`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">LexiMind REST API & Swagger Dokümantasyonu</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">FastAPI v1.2.0 · OpenAPI 3.1.0 · Uvicorn</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Quick Swagger Link */}
          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between">
            <div>
              <div className="font-semibold text-indigo-900 dark:text-indigo-300">İnteraktif Swagger UI & Redoc</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                FastAPI tarafından otomatik oluşturulan interaktif API test konsolunu tarayıcınızda açın.
              </div>
            </div>
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <span>Swagger /docs Aç</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Endpoints Table */}
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2 font-semibold">
              MEVCUT ENDPOINT&apos;LER
            </h4>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 font-mono text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="p-2.5">Metot</th>
                    <th className="p-2.5">Uç Nokta</th>
                    <th className="p-2.5">Açıklama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                  <tr>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">GET</td>
                    <td className="p-2.5 text-slate-900 dark:text-slate-200">/api/health</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 font-sans">Sunucu ve model sağlık kontrolü</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">GET</td>
                    <td className="p-2.5 text-slate-900 dark:text-slate-200">/api/model-info</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 font-sans">Vektör boyutu, pencere ve mimari</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-indigo-600 dark:text-indigo-400 font-bold">POST</td>
                    <td className="p-2.5 text-slate-900 dark:text-slate-200">/api/similar</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 font-sans">En yakın komşu kelimeler (kosinüs)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-indigo-600 dark:text-indigo-400 font-bold">POST</td>
                    <td className="p-2.5 text-slate-900 dark:text-slate-200">/api/compare</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 font-sans">İki kelimenin kosinüs ve Öklid skoru</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-indigo-600 dark:text-indigo-400 font-bold">POST</td>
                    <td className="p-2.5 text-slate-900 dark:text-slate-200">/api/analogy</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 font-sans">Vektör aritmetiği ile analoji sorgusu</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-indigo-600 dark:text-indigo-400 font-bold">POST</td>
                    <td className="p-2.5 text-slate-900 dark:text-slate-200">/api/analyze</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 font-sans">Karakter, kelime, frekans ve token analizi</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">GET</td>
                    <td className="p-2.5 text-slate-900 dark:text-slate-200">/api/vocabulary</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 font-sans">Model sözlük listesi ve arama</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">GET</td>
                    <td className="p-2.5 text-slate-900 dark:text-slate-200">/api/corpus/statistics</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 font-sans">Derlem istatistikleri ve frekans analizi</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-indigo-600 dark:text-indigo-400 font-bold">POST</td>
                    <td className="p-2.5 text-slate-900 dark:text-slate-200">/api/vector-projection</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 font-sans">Kelime vektörlerinin 2D PCA izdüşümü</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">GET</td>
                    <td className="p-2.5 text-slate-900 dark:text-slate-200">/api/network</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 font-sans">Ağ grafiği düğüm ve bağlantı matrisi</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* cURL Example */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">cURL ÖRNEĞİ (/api/similar)</span>
              <button
                type="button"
                onClick={() => handleCopy(curlSimilar, 'curl')}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {copiedKey === 'curl' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto">
              {curlSimilar}
            </pre>
          </div>

          {/* Python Requests Example */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">PYTHON REQUESTS ÖRNEĞİ</span>
              <button
                type="button"
                onClick={() => handleCopy(pythonExample, 'py')}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {copiedKey === 'py' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto">
              {pythonExample}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
