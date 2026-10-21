"""
LexiMind — Academic Article Analysis Routes (app/api/analysis_routes.py)
Handles document parsing (PDF, DOCX, TXT), keyword extraction, Word2Vec semantic enrichment,
and analysis persistence in SQLite.
"""

import time
import base64
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Query

from app.schemas.analysis import (
    AnalyzeTextPayload,
    AnalysisResponse,
    AnalysisListItem,
    UserStatsResponse
)
from app.api.auth_routes import get_current_user_optional, get_current_user_required
from app.nlp.document_parser import extract_document_text, DocumentParsingError
from app.nlp.keyword_extractor import academic_extractor
from app.nlp.word2vec_service import enrich_keywords_with_related_words, get_model_information
from app.database.db import (
    db_save_analysis,
    db_get_user_analyses,
    db_get_analysis_by_id,
    db_delete_analysis,
    db_get_user_stats
)

router = APIRouter(prefix="/api/analysis", tags=["Makale Analizi"])

@router.post("", response_model=AnalysisResponse, summary="Akademik Makaleyi Analiz Et")
def analyze_article(
    payload: AnalyzeTextPayload,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    start_time = time.time()
    raw_text = ""
    doc_type = "paste"
    filename = payload.filename or "belge.txt"

    # 1. Metin veya Dosya Kaynağını Belirle
    if payload.file_content_base64:
        try:
            # Handle base64 data URLs (e.g. data:application/pdf;base64,....)
            b64_str = payload.file_content_base64
            if "," in b64_str:
                b64_str = b64_str.split(",", 1)[1]
            file_bytes = base64.b64decode(b64_str)
            
            raw_text, doc_meta = extract_document_text(file_bytes, filename)
            doc_type = doc_meta.get("format", "file")
        except DocumentParsingError as dpe:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(dpe))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Dosya işlenirken beklenmedik hata oluştu: {str(e)}"
            )
    elif payload.text and payload.text.strip():
        raw_text = payload.text.strip()
        doc_type = "paste"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lütfen analiz edilecek bir metin yapıştırın veya PDF/DOCX/TXT dosyası yükleyin."
        )

    # 2. Minimum Kelime Kontrolü
    if len(raw_text.split()) < 5:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Analiz için sağlanan metin çok kısa (en az 5-10 kelime gereklidir)."
        )

    # 3. Makale Başlığı
    article_title = payload.title.strip() if payload.title and payload.title.strip() else ""
    if not article_title:
        # Extract title from filename or first sentence
        if filename and filename != "belge.txt":
            article_title = filename.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").title()
        else:
            first_line = raw_text.split("\n", 1)[0].strip()
            article_title = (first_line[:60] + "...") if len(first_line) > 60 else first_line
    if not article_title:
        article_title = "İsimsiz Makale Analizi"

    # 4. Anahtar Kelime & Tamlama Çıkarımı
    keywords, stats = academic_extractor.extract_keywords(
        text=raw_text,
        title=article_title,
        top_n=payload.top_n,
        include_phrases=payload.include_phrases
    )

    if not keywords:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Metin üzerinde anlamlı anahtar kelime veya akademik tamlama tespit edilemedi."
        )

    # 5. Gensim Word2Vec ile Anlamsal İlişki Zenginleştirmesi
    if payload.show_related:
        keywords = enrich_keywords_with_related_words(keywords, max_related=4)
    else:
        for kw in keywords:
            kw["related_words"] = []
            kw["in_model_vocab"] = False
            kw["vocab_status"] = "Kullanıcı tercihiyle kapatıldı."

    # 6. Çok Kelimeli Tamlamalar Listesi
    phrases = [kw["term"] for kw in keywords if kw.get("is_phrase")]

    # 7. Model Bilgisi ve Süre
    duration_ms = int((time.time() - start_time) * 1000)
    model_meta = get_model_information()
    analysis_id = str(uuid.uuid4())
    now = int(time.time())

    # Raw text summary (first 500 chars)
    summary_snippet = raw_text[:350].strip() + ("..." if len(raw_text) > 350 else "")

    analysis_record = {
        "id": analysis_id,
        "user_id": current_user["id"] if current_user else None,
        "title": article_title,
        "document_type": doc_type,
        "language": payload.language or "tr",
        "word_count": stats["word_count"],
        "sentence_count": stats["sentence_count"],
        "processing_time_ms": duration_ms,
        "keywords": keywords,
        "phrases": phrases,
        "model_status": {
            "algorithm": model_meta.get("algorithm", "Word2Vec Skip-gram"),
            "vector_size": model_meta.get("vector_size", 100),
            "vocab_size": model_meta.get("vocab_size", 0),
            "engine": "Gensim Word2Vec Core",
            "extraction_method": stats.get("algorithm", "Statistical Candidate Ranker")
        },
        "warnings": stats.get("warning"),
        "created_at": now,
        "raw_text_summary": summary_snippet
    }

    # 8. Veritabanına Kaydet (Giriş yapmış veya misafir kullanıcı)
    db_save_analysis(analysis_record)

    return analysis_record

@router.get("", response_model=List[AnalysisListItem], summary="Analiz Geçmişini Listele")
def list_analyses(
    search: str = Query(default="", description="Makale başlığına göre arama"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    user_id = current_user["id"] if current_user else None
    return db_get_user_analyses(user_id=user_id, search=search, limit=limit, offset=offset)

@router.get("/stats/overview", response_model=UserStatsResponse, summary="Kullanıcı Analiz İstatistikleri")
def get_user_stats_overview(
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    user_id = current_user["id"] if current_user else None
    return db_get_user_stats(user_id=user_id)

@router.get("/{analysis_id}", response_model=AnalysisResponse, summary="Tekil Analiz Sonucunu Getir")
def get_single_analysis(
    analysis_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    user_id = current_user["id"] if current_user else None
    analysis = db_get_analysis_by_id(analysis_id, user_id=user_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="İstenen analiz kaydı bulunamadı veya bu kayda erişim izniniz yok."
        )
    return analysis

@router.delete("/{analysis_id}", summary="Analizi Sil")
def delete_single_analysis(
    analysis_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    user_id = current_user["id"] if current_user else None
    deleted = db_delete_analysis(analysis_id, user_id=user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Silinecek analiz kaydı bulunamadı."
        )
    return {"status": "success", "message": "Analiz kaydı başarıyla silindi."}
