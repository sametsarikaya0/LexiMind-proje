import {
  HealthResponse,
  ModelInfo,
  SimilarWordsResponse,
  CompareWordsResponse,
  TextAnalysisResponse,
  VocabularyResponse,
  NetworkResponse,
  VectorProjectionResponse,
  EvaluationResponse,
  AnalogyResponse,
  CorpusStatisticsResponse,
  TrainModelParams,
  TrainModelResponse,
} from './types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) {
    throw new Error(`Sağlık kontrolü başarısız: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchModelInfo(): Promise<ModelInfo> {
  const res = await fetch(`${BASE_URL}/api/model-info`);
  if (!res.ok) {
    throw new Error(`Model bilgisi alınamadı: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchEvaluationReport(): Promise<EvaluationResponse> {
  const res = await fetch(`${BASE_URL}/api/evaluate`);
  if (!res.ok) {
    throw new Error('Değerlendirme sonuçları alınamadı.');
  }
  return res.json();
}

export async function findSimilarWords(word: string, topN: number = 10): Promise<SimilarWordsResponse> {
  const res = await fetch(`${BASE_URL}/api/similar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: word.trim(), top_n: topN }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 404) {
      return data as SimilarWordsResponse;
    }
    throw new Error(data.detail || data.message || 'Benzer kelimeler getirilemedi.');
  }
  return data;
}

export async function compareWords(word1: string, word2: string): Promise<CompareWordsResponse> {
  const res = await fetch(`${BASE_URL}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word1: word1.trim(), word2: word2.trim() }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 404) {
      return data as CompareWordsResponse;
    }
    throw new Error(data.detail || data.message || 'Kelimeler karşılaştırılamadı.');
  }
  return data;
}

export async function analyzeText(text: string): Promise<TextAnalysisResponse> {
  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Metin analizi başarısız oldu.');
  }
  return data;
}

export async function projectVectorPCA(params: {
  words?: string[];
  center_word?: string;
  top_n?: number;
}): Promise<VectorProjectionResponse> {
  const res = await fetch(`${BASE_URL}/api/vector-projection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || '2D vektör projeksiyonu hesaplanamadı.');
  }
  return data;
}

export async function fetchVocabulary(limit: number = 100, search: string = ''): Promise<VocabularyResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (search) params.append('search', search);
  const res = await fetch(`${BASE_URL}/api/vocabulary?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Sözlük verisi alınamadı.');
  }
  return res.json();
}

export async function fetchWordNetwork(word: string, topN: number = 8): Promise<NetworkResponse> {
  const params = new URLSearchParams({ word: word.trim(), top_n: topN.toString() });
  const res = await fetch(`${BASE_URL}/api/network?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Semantik ağ verisi alınamadı.');
  }
  return data;
}

export async function calculateAnalogy(
  positive: string[],
  negative: string[] = [],
  topN: number = 5
): Promise<AnalogyResponse> {
  const res = await fetch(`${BASE_URL}/api/analogy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ positive, negative, top_n: topN }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 404) {
      return data as AnalogyResponse;
    }
    throw new Error(data.detail || data.message || 'Analoji hesaplaması başarısız oldu.');
  }
  return data;
}

export async function fetchCorpusStatistics(): Promise<CorpusStatisticsResponse> {
  const res = await fetch(`${BASE_URL}/api/corpus/statistics`);
  if (!res.ok) {
    throw new Error('Derlem istatistikleri alınamadı.');
  }
  return res.json();
}

export async function trainWord2VecModel(params: TrainModelParams): Promise<TrainModelResponse> {
  const res = await fetch(`${BASE_URL}/api/model/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Model eğitimi başarısız oldu.');
  }
  return data;
}

