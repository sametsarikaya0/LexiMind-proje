export interface ModelInfo {
  status: string;
  algorithm: string;
  vector_size: number;
  window: number;
  min_count: number;
  negative_sampling?: number;
  sg: number;
  epochs: number;
  vocab_size: number;
  corpus_description: string;
  academic_note?: string;
  known_limitations?: string[];
  training_metadata?: Record<string, any>;
  framework_versions?: Record<string, string>;
  similarity_metric?: string;
  distance_metric?: string;
  vector_format?: string;
  engine?: string;
}

export interface SimilarWordItem {
  word: string;
  score: number;
  percentage_display?: string;
  percentage?: string;
  similarity?: number;
}

export interface SimilarWordsResponse {
  found: boolean;
  word: string;
  original_query?: string;
  match_type?: string;
  resolution_note?: string;
  top_n: number;
  similar_words: SimilarWordItem[];
  vector_norm?: number;
  message?: string;
  suggestions?: string[];
}

export interface CompareWordsResponse {
  success: boolean;
  word1: string;
  word2: string;
  original_word1?: string;
  original_word2?: string;
  resolution_note?: string;
  cosine_similarity: number;
  euclidean_distance: number;
  relation_level: string;
  interpretation: string;
  academic_disclaimer: string;
  message?: string;
  missing_words?: string[];
}

export interface TopWordFrequency {
  word: string;
  count: number;
  frequency_ratio: number;
}

export interface TextAnalysisResponse {
  total_characters: number;
  total_sentences?: number;
  total_words: number;
  unique_words: number;
  in_vocab_words: number;
  vocabulary_coverage_percent: number;
  top_words: TopWordFrequency[];
  cleaned_text_preview: string;
  sample_tokens: string[];
  text_vector_norm?: number | null;
  closest_semantic_topics?: Array<{ word: string; score: number }>;
}

export interface NetworkNode {
  id: string;
  label: string;
  group: 'center' | 'neighbor';
  weight: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number;
}

export interface NetworkResponse {
  center_word: string;
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface ProjectionPoint {
  word: string;
  x: number;
  y: number;
  raw_x: number;
  raw_y: number;
  is_center?: boolean;
}

export interface VectorProjectionResponse {
  method: string;
  dimension: number;
  word_count: number;
  explained_variance_ratio: number;
  points: ProjectionPoint[];
  center_word?: string | null;
}

export interface EvaluationSample {
  pair: string;
  similarity: number;
  tier: string;
  category: string;
}

export interface EvaluationResponse {
  status: string;
  benchmark_name: string;
  total_test_pairs: number;
  evaluated_test_pairs: number;
  avg_similarity_high_tier: number;
  avg_similarity_medium_tier: number;
  avg_similarity_low_tier: number;
  discrimination_margin: number;
  is_theoretically_sound: boolean;
  interpretation: string;
  samples: EvaluationSample[];
}

export interface VocabularyResponse {
  total_vocabulary_size: number;
  filtered_count: number;
  words: string[];
}

export interface HealthResponse {
  status: string;
  service: string;
  model_loaded: boolean;
  environment: string;
  database?: string;
}

export interface AnalogyResultItem {
  word: string;
  score: number;
  percentage_display: string;
}

export interface AnalogyResponse {
  success: boolean;
  positive: string[];
  negative: string[];
  equation?: string;
  top_n?: number;
  results: AnalogyResultItem[];
  scientific_explanation?: string;
  message?: string;
  missing_words?: string[];
}

export interface CorpusStatsWord {
  word: string;
  count: number;
  frequency_percentage: number;
}

export interface CorpusStatisticsResponse {
  status: string;
  corpus_name: string;
  source_description: string;
  raw_lines_count: number;
  clean_sentences_count: number;
  total_tokens_count: number;
  unique_words_count: number;
  type_token_ratio: number;
  average_sentence_length_tokens: number;
  top_frequent_words: CorpusStatsWord[];
  sample_sentences: string[];
  linguistic_note: string;
}

export interface TrainModelParams {
  vector_size: number;
  window: number;
  min_count: number;
  sg: number;
  negative: number;
  epochs: number;
  seed: number;
  custom_text?: string;
  append_to_default?: boolean;
}

export interface TrainModelResponse {
  status: string;
  algorithm: string;
  parameters: Record<string, any>;
  corpus_statistics: Record<string, any>;
  vocabulary_size: number;
  training_time_seconds: number;
  saved_path: string;
  evaluation: EvaluationResponse;
}

export type AppTheme = 'dark' | 'light';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  subtitle: string;
  badgeBg: string;
  previewBg: string;
  accentColor: string;
  isDark: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  created_at: number;
  updated_at?: number;
  settings?: Record<string, any>;
}

export interface AuthResponseData {
  status: string;
  message: string;
  token: string;
  user: UserProfile;
}

export interface KeywordRelatedWord {
  word: string;
  similarity: number;
  percentage: string;
}

export interface KeywordResult {
  rank: number;
  term: string;
  score: number;
  frequency: number;
  is_phrase: boolean;
  context?: string;
  related_words?: KeywordRelatedWord[];
  in_model_vocab?: boolean;
  vocab_status?: string;
}

export interface AnalysisRecord {
  id: string;
  user_id?: number | null;
  title: string;
  document_type: string;
  language: string;
  word_count: number;
  sentence_count: number;
  processing_time_ms: number;
  keywords: KeywordResult[];
  phrases: string[];
  model_status: Record<string, any>;
  warnings?: string | null;
  created_at: number;
  raw_text_summary?: string;
}

export interface AnalysisSummaryItem {
  id: string;
  user_id?: number | null;
  title: string;
  document_type: string;
  word_count: number;
  sentence_count: number;
  processing_time_ms: number;
  keyword_count: number;
  top_keywords: string[];
  created_at: number;
}

export interface UserDashboardStats {
  total_analyses: number;
  total_extracted_keywords: number;
  processed_documents: number;
  most_recent_article?: {
    id: string;
    title: string;
    created_at: number;
  } | null;
}

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
}

export type PageRoute =
  | 'dashboard'
  | 'new-analysis'
  | 'analysis-result'
  | 'history'
  | 'words'
  | 'model'
  | 'profile'
  | 'settings'
  | 'terms'
  | 'privacy'
  | 'cookies'
  | 'login'
  | 'register'
  | 'forgot-password';
