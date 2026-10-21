"""
LexiMind — Word Explorer & Model Routes (app/api/word_routes.py)
"""

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from typing import List, Optional

from app.nlp.word2vec_service import get_word_similarity, get_model_information
from nlp.service import nlp_service

router = APIRouter(prefix="/api", tags=["Word2Vec & Sözlük"])

class CompareRequest(BaseModel):
    word1: str = Field(..., min_length=1, max_length=50)
    word2: str = Field(..., min_length=1, max_length=50)

class AnalogyRequest(BaseModel):
    positive: List[str] = Field(..., min_length=1)
    negative: Optional[List[str]] = Field(default=[])
    top_n: int = Field(default=5, ge=1, le=20)

class VectorProjectionRequest(BaseModel):
    words: Optional[List[str]] = None
    center_word: Optional[str] = None
    top_n: int = Field(default=12, ge=3, le=30)

class TrainModelRequest(BaseModel):
    vector_size: int = Field(default=100, ge=10, le=300)
    window: int = Field(default=5, ge=1, le=15)
    min_count: int = Field(default=1, ge=1, le=20)
    sg: int = Field(default=1, ge=0, le=1)
    negative: int = Field(default=5, ge=2, le=20)
    epochs: int = Field(default=40, ge=2, le=100)
    seed: int = Field(default=42, ge=0)
    custom_text: Optional[str] = Field(default=None, max_length=100000)
    append_to_default: Optional[bool] = Field(default=True)

@router.get("/words/{word}/similar", summary="Word Explorer — Semantik Komşular")
def explore_word(
    word: str,
    top_n: int = Query(default=10, ge=1, le=30)
):
    try:
        return get_word_similarity(word=word, top_n=top_n)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/model/info", summary="Word2Vec Model Bilgileri ve Metaveri")
def get_model_info_endpoint():
    return get_model_information()

@router.post("/similar", summary="Benzer Kelimeleri Bul")
def similar_alias(word: str = Query(...), top_n: int = Query(default=10)):
    return get_word_similarity(word=word, top_n=top_n)

@router.post("/compare", summary="İki Kelimeyi Karşılaştır")
def compare_words(payload: CompareRequest):
    return nlp_service.compare_words(payload.word1, payload.word2)

@router.post("/analogy", summary="Vektör Analojisi")
def word_analogy(payload: AnalogyRequest):
    return nlp_service.get_analogy(positive=payload.positive, negative=payload.negative or [], top_n=payload.top_n)

@router.post("/vector-projection", summary="2D PCA Vektör Projeksiyonu")
def vector_projection(payload: VectorProjectionRequest):
    return nlp_service.project_word_vectors(words=payload.words, center_word=payload.center_word, top_n=payload.top_n)

@router.post("/model/train", summary="Modeli Yeniden Eğit")
def train_model(payload: TrainModelRequest):
    params = {
        "vector_size": payload.vector_size,
        "window": payload.window,
        "min_count": payload.min_count,
        "sg": payload.sg,
        "negative": payload.negative,
        "epochs": payload.epochs,
        "seed": payload.seed,
        "workers": 2,
        "compute_loss": True
    }
    return nlp_service.train_custom_model(
        params=params,
        custom_text=payload.custom_text,
        append_to_default=payload.append_to_default if payload.append_to_default is not None else True
    )
