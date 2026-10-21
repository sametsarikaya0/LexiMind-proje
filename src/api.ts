/**
 * LexiMind — API Client Integration (src/api.ts)
 * Configurable backend URL with automatic token attachment and comprehensive error handling.
 */

import {
  HealthResponse,
  ModelInfo,
  SimilarWordsResponse,
  CompareWordsResponse,
  TextAnalysisResponse,
  VectorProjectionResponse,
  VocabularyResponse,
  NetworkResponse,
  AnalogyResponse,
  CorpusStatisticsResponse,
  EvaluationResponse,
  TrainModelParams,
  TrainModelResponse,
  UserProfile,
  AuthResponseData,
  AnalysisRecord,
  AnalysisSummaryItem,
  UserDashboardStats,
} from './types';

export const BASE_URL = import.meta.env.VITE_API_URL || '';

// Token Management
export const TOKEN_STORAGE_KEY = 'leximind_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ----------------- Auth API -----------------

export async function registerUser(payload: {
  full_name: string;
  email: string;
  password: string;
  terms_accepted: boolean;
}): Promise<AuthResponseData> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Kayıt işlemi başarısız.');
  }
  if (data.token) {
    setStoredToken(data.token);
  }
  return data;
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthResponseData> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Giriş yapılamadı.');
  }
  if (data.token) {
    setStoredToken(data.token);
  }
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch {
    // Ignore network error during logout
  } finally {
    clearStoredToken();
  }
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) {
        clearStoredToken();
      }
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

export async function updateUserProfile(payload: {
  full_name?: string;
  settings?: Record<string, any>;
}): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/user/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Profil güncellenemedi.');
  }
  return data;
}

export async function changeUserPassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<{ status: string; message: string }> {
  const res = await fetch(`${BASE_URL}/api/user/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Parola değiştirilemedi.');
  }
  return data;
}

export async function deleteUserAccount(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/user/account`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Hesap silinemedi.');
  }
  clearStoredToken();
}

export async function requestForgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

// ----------------- Article Analysis API -----------------

export async function analyzeArticle(payload: {
  title?: string;
  text?: string;
  file_content_base64?: string;
  filename?: string;
  top_n: number;
  include_phrases: boolean;
  show_related: boolean;
  language?: string;
}): Promise<AnalysisRecord> {
  const res = await fetch(`${BASE_URL}/api/analysis`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Makale analizi başarısız oldu.');
  }
  return data;
}

export async function fetchAnalysisHistory(
  search: string = '',
  limit: number = 50,
  offset: number = 0
): Promise<AnalysisSummaryItem[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (search.trim()) {
    params.append('search', search.trim());
  }
  const res = await fetch(`${BASE_URL}/api/analysis?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Analiz geçmişi alınamadı.');
  }
  return res.json();
}

export async function fetchAnalysisById(id: string): Promise<AnalysisRecord> {
  const res = await fetch(`${BASE_URL}/api/analysis/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Analiz kaydı bulunamadı.');
  }
  return data;
}

export async function deleteAnalysisById(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/analysis/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Analiz kaydı silinemedi.');
  }
}

export async function fetchDashboardStats(): Promise<UserDashboardStats> {
  try {
    const res = await fetch(`${BASE_URL}/api/analysis/stats/overview`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return {
        total_analyses: 0,
        total_extracted_keywords: 0,
        processed_documents: 0,
        most_recent_article: null,
      };
    }
    return res.json();
  } catch {
    return {
      total_analyses: 0,
      total_extracted_keywords: 0,
      processed_documents: 0,
      most_recent_article: null,
    };
  }
}

// ----------------- Word Explorer & Word2Vec API -----------------

export async function exploreWordSimilar(
  word: string,
  topN: number = 10
): Promise<SimilarWordsResponse> {
  const params = new URLSearchParams({ top_n: topN.toString() });
  const res = await fetch(`${BASE_URL}/api/words/${encodeURIComponent(word.trim())}/similar?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 404) {
      return data as SimilarWordsResponse;
    }
    throw new Error(data.detail || data.message || 'Semantik komşuluk araması başarısız.');
  }
  return data;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) {
    throw new Error(`Sağlık kontrolü başarısız: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchModelInfo(): Promise<ModelInfo> {
  const res = await fetch(`${BASE_URL}/api/model/info`);
  if (!res.ok) {
    // Fallback to legacy endpoint if needed
    const fallback = await fetch(`${BASE_URL}/api/model-info`);
    if (!fallback.ok) {
      throw new Error('Model bilgisi alınamadı.');
    }
    return fallback.json();
  }
  return res.json();
}

export async function fetchSimilarWords(
  word: string,
  topN: number = 10
): Promise<SimilarWordsResponse> {
  return exploreWordSimilar(word, topN);
}

export async function compareWords(
  word1: string,
  word2: string
): Promise<CompareWordsResponse> {
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

export async function fetchVocabulary(
  limit: number = 100,
  search: string = ''
): Promise<VocabularyResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (search) params.append('search', search);
  const res = await fetch(`${BASE_URL}/api/vocabulary?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Sözlük verisi alınamadı.');
  }
  return res.json();
}

export async function fetchCorpusStatistics(): Promise<CorpusStatisticsResponse> {
  const res = await fetch(`${BASE_URL}/api/corpus/statistics`);
  if (!res.ok) {
    throw new Error('Derlem istatistikleri alınamadı.');
  }
  return res.json();
}

export async function findSimilarWords(
  word: string,
  topN: number = 10
): Promise<SimilarWordsResponse> {
  try {
    const res = await fetch(`${BASE_URL}/api/similar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: word.trim(), top_n: topN }),
    });
    const data = await res.json();
    if (res.ok) {
      return data as SimilarWordsResponse;
    }
  } catch {
    // fallback to GET endpoint
  }
  return exploreWordSimilar(word, topN);
}

export async function analyzeText(text: string): Promise<TextAnalysisResponse> {
  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Metin analizi başarısız.');
  }
  return data;
}

export async function projectVectorPCA(payload: {
  center_word?: string;
  words?: string[];
  top_n?: number;
}): Promise<VectorProjectionResponse> {
  const res = await fetch(`${BASE_URL}/api/vector-projection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Vektör projeksiyonu oluşturulamadı.');
  }
  return data;
}

export async function fetchWordNetwork(
  word: string,
  topN: number = 8
): Promise<NetworkResponse> {
  const params = new URLSearchParams({ word: word.trim(), top_n: topN.toString() });
  const res = await fetch(`${BASE_URL}/api/network?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Semantik ağ verisi getirilemedi.');
  }
  return data;
}

export async function fetchEvaluationReport(): Promise<EvaluationResponse> {
  const res = await fetch(`${BASE_URL}/api/evaluate`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Değerlendirme raporu alınamadı.');
  }
  return data;
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
