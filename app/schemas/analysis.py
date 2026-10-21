"""
LexiMind — Academic Analysis Schemas (app/schemas/analysis.py)
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RelatedWordItem(BaseModel):
    word: str
    similarity: float
    percentage: str

class KeywordResultItem(BaseModel):
    rank: int
    term: str
    score: float
    frequency: int
    is_phrase: bool
    context: Optional[str] = ""
    related_words: Optional[List[RelatedWordItem]] = []
    in_model_vocab: Optional[bool] = False
    vocab_status: Optional[str] = ""

class AnalyzeTextPayload(BaseModel):
    title: Optional[str] = Field(default="", max_length=200, description="Makale veya belge başlığı")
    text: Optional[str] = Field(default=None, max_length=500000, description="Analiz edilecek makale metni")
    file_content_base64: Optional[str] = Field(default=None, description="Yüklenen dosyanın base64 içeriği (PDF/DOCX/TXT)")
    filename: Optional[str] = Field(default="belge.txt", description="Dosya adı")
    top_n: int = Field(default=10, ge=5, le=30, description="Çıkarılacak anahtar kelime sayısı")
    include_phrases: bool = Field(default=True, description="Çok kelimeli tamlamaları dahil et")
    show_related: bool = Field(default=True, description="Word2Vec ile anlamsal yakın kelimeleri hesapla")
    language: Optional[str] = Field(default="tr", description="Dil seçimi (tr veya en)")

class AnalysisResponse(BaseModel):
    id: str
    title: str
    document_type: str
    language: str
    word_count: int
    sentence_count: int
    processing_time_ms: int
    keywords: List[KeywordResultItem]
    phrases: List[str]
    model_status: Dict[str, Any]
    warnings: Optional[str] = None
    created_at: int
    raw_text_summary: Optional[str] = ""

class AnalysisListItem(BaseModel):
    id: str
    user_id: Optional[int] = None
    title: str
    document_type: str
    word_count: int
    sentence_count: int
    processing_time_ms: int
    keyword_count: int
    top_keywords: List[str]
    created_at: int

class UserStatsResponse(BaseModel):
    total_analyses: int
    total_extracted_keywords: int
    processed_documents: int
    most_recent_article: Optional[Dict[str, Any]] = None
