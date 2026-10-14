"""
LexiMind — Turkish Semantic Intelligence Lab
FastAPI Ana Uygulama Sunucusu (main.py)

Tüm endpoint'ler Pydantic validasyonu, güvenli CORS yapılandırması
ve zengin hata yönetimi ile hazırlanmıştır.
"""

import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from nlp.service import nlp_service

# FastAPI Uygulaması
app = FastAPI(
    title="LexiMind — Turkish Semantic Intelligence Lab API",
    description="Word2Vec ve Gensim tabanlı Türkçe anlamsal zeka, kelime vektörü, PCA 2D izdüşüm, analoji ve metin analiz API servisi.",
    version="1.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Yapılandırması
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Pydantic İstek ve Yanıt Modelleri -----------------

class SimilarWordRequest(BaseModel):
    word: str = Field(..., min_length=1, max_length=50, description="Benzerleri aranacak Türkçe kelime", json_schema_extra={"example": "yapay"})
    top_n: int = Field(default=10, ge=1, le=50, description="Döndürülecek en yakın kelime sayısı", json_schema_extra={"example": 10})

class CompareWordsRequest(BaseModel):
    word1: str = Field(..., min_length=1, max_length=50, description="Birinci Türkçe kelime", json_schema_extra={"example": "bilgisayar"})
    word2: str = Field(..., min_length=1, max_length=50, description="İkinci Türkçe kelime", json_schema_extra={"example": "yazılım"})

class AnalogyRequest(BaseModel):
    positive: List[str] = Field(..., min_length=1, max_length=10, description="Pozitif referans kelimeler (toplanacak)", json_schema_extra={"example": ["türkiye", "paris"]})
    negative: Optional[List[str]] = Field(default=[], max_length=10, description="Negatif referans kelimeler (çıkarılacak)", json_schema_extra={"example": ["ankara"]})
    top_n: int = Field(default=5, ge=1, le=20, description="Döndürülecek en yakın kelime sayısı", json_schema_extra={"example": 5})

class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000, description="Analiz edilecek Türkçe metin", json_schema_extra={"example": "Doğal dil işleme ve yapay zeka günümüz teknolojisinin temelidir."})

class VectorProjectionRequest(BaseModel):
    words: Optional[List[str]] = Field(default=None, max_length=50, description="İzdüşümü alınacak kelimeler listesi", json_schema_extra={"example": ["bilgisayar", "yazılım", "doktor", "hastane"]})
    center_word: Optional[str] = Field(default=None, max_length=50, description="Merkez kelime ve komşuları", json_schema_extra={"example": "bilgisayar"})
    top_n: int = Field(default=12, ge=3, le=30, description="Merkez kelime için komşu sayısı", json_schema_extra={"example": 12})

class TrainModelRequest(BaseModel):
    vector_size: int = Field(default=100, ge=10, le=300, description="Kelime vektör boyutu (d)", json_schema_extra={"example": 100})
    window: int = Field(default=5, ge=1, le=15, description="Bağlam penceresi genişliği (±w)", json_schema_extra={"example": 5})
    min_count: int = Field(default=1, ge=1, le=20, description="Minimum kelime frekansı eşiği", json_schema_extra={"example": 1})
    sg: int = Field(default=1, ge=0, le=1, description="0 = CBOW, 1 = Skip-gram", json_schema_extra={"example": 1})
    negative: int = Field(default=5, ge=2, le=20, description="Negatif örnekleme (Negative Sampling k)", json_schema_extra={"example": 5})
    epochs: int = Field(default=40, ge=2, le=100, description="Eğitim döngüsü (epoch) sayısı", json_schema_extra={"example": 40})
    seed: int = Field(default=42, ge=0, le=999999, description="Rastgelelik tohumu (seed)", json_schema_extra={"example": 42})
    custom_text: Optional[str] = Field(default=None, max_length=100000, description="Opsiyonel özel Türkçe eğitim metni")

# ----------------- API Endpoint'leri -----------------

@app.get("/health", summary="Sistem Sağlık Durumu", tags=["Sistem"])
@app.get("/api/health", summary="Sistem Sağlık Durumu", tags=["Sistem"])
def health_check():
    """
    Sunucu çalışma durumu ve Word2Vec modelinin bellekteki hazırlık durumunu doğrular.
    """
    return {
        "status": "healthy",
        "service": "LexiMind API",
        "model_loaded": nlp_service.is_loaded,
        "environment": os.getenv("ENVIRONMENT", "production")
    }


@app.get("/api/model/status", summary="Model Durumu", tags=["Word2Vec"])
@app.get("/api/model-info", summary="Model Parametreleri ve Bilgileri", tags=["Word2Vec"])
def get_model_information():
    """
    Gensim Word2Vec modelinin vektör boyutu, pencere boyutu, sözlük büyüklüğü ve mimarisini döndürür.
    """
    return nlp_service.get_model_info()


@app.get("/api/model/metadata", summary="Kapsamlı Model ve Çevre Metaverisi", tags=["Word2Vec"])
def get_model_metadata_endpoint():
    """
    Model mimarisi, kütüphane sürümleri ve vektör detayları hakkında kapsamlı metaveri döner.
    """
    return nlp_service.get_model_metadata()


@app.get("/api/evaluate", summary="Model Değerlendirme Benchmark Raporu", tags=["Word2Vec"])
def evaluate_model():
    """
    Modelin Türkçe referans kelime çiftleri değerlendirme seti (LexiMind-TR-Eval)
    üzerindeki ölçüm metriklerini döndürür.
    """
    try:
        return nlp_service.get_evaluation()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/vocabulary", summary="Model Sözlüğü", tags=["Word2Vec"])
def get_vocabulary(
    limit: int = Query(default=100, ge=1, le=1000, description="Döndürülecek maksimum kelime sayısı"),
    search: str = Query(default="", description="Sözlük içi filtreleme / arama terimi")
):
    """
    Eğitilmiş modelin sözlüğünde yer alan kelimeleri listeler.
    """
    return nlp_service.get_vocabulary(limit=limit, search=search)


@app.get("/api/corpus/statistics", summary="Derlem İstatistikleri ve Frekans Analizi", tags=["Derlem"])
def get_corpus_statistics_endpoint():
    """
    Eğitim derleminin satır sayısı, temiz cümle sayısı, belirteç hacmi,
    benzersiz kelime sayısı ve en sık geçen kelimeleri döner.
    """
    try:
        return nlp_service.get_corpus_statistics()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Derlem istatistiği alınamadı: {str(e)}")


@app.post("/api/similarity", summary="En Benzer Kelimeleri Bul", tags=["Word2Vec"])
@app.post("/api/similar", summary="En Benzer Kelimeleri Bul (Alias)", tags=["Word2Vec"])
def find_similar_words(payload: SimilarWordRequest):
    """
    Girdi olarak verilen Türkçe kelimenin Word2Vec vektör uzayında kosinüs benzerliği
    en yüksek olan en yakın komşularını döndürür.
    """
    try:
        result = nlp_service.get_similar_words(word=payload.word, top_n=payload.top_n)
        if not result.get("found"):
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=result
            )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"İşlem sırasında hata: {str(e)}")


@app.post("/api/compare", summary="İki Kelimeyi Karşılaştır", tags=["Word2Vec"])
def compare_two_words(payload: CompareWordsRequest):
    """
    İki kelimenin vektörleri arasındaki kosinüs benzerliği ve Öklid mesafesini hesaplar,
    akademik yorumuyla birlikte raporlar. Negatif skorlar filtrelenmez veya sıfırlanmaz.
    """
    try:
        result = nlp_service.compare_words(word1=payload.word1, word2=payload.word2)
        if not result.get("success"):
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=result
            )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Karşılaştırma hatası: {str(e)}")


@app.post("/api/analogy", summary="Kelime Analojisi ve Vektör Aritmetiği", tags=["Word2Vec"])
def calculate_analogy(payload: AnalogyRequest):
    """
    Word2Vec vektör uzayında yönsel cebirsel analoji işlemi yapar:
    Örnek: kral - erkek + kadın ≈ kraliçe
    Formül: v_hedef ≈ Σ v_pozitif - Σ v_negatif
    """
    try:
        result = nlp_service.get_analogy(
            positive=payload.positive,
            negative=payload.negative or [],
            top_n=payload.top_n
        )
        if not result.get("success"):
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=result
            )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Analoji hatası: {str(e)}")


@app.post("/api/analyze", summary="Metin Analiz Laboratuvarı", tags=["Metin Analizi"])
def analyze_text_content(payload: AnalyzeTextRequest):
    """
    Kullanıcının girdiği metnin uzunluğunu, kelime frekanslarını, temizlenmiş halini,
    model sözlüğüyle örtüşme yüzdesini ve ortalama metin vektörünü hesaplar.
    """
    try:
        return nlp_service.analyze_text(text=payload.text)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Analiz hatası: {str(e)}")


@app.post("/api/vector-projection", summary="Kelime Vektörleri 2D PCA Projeksiyonu", tags=["Görselleştirme"])
def project_vectors(payload: VectorProjectionRequest):
    """
    Seçilen kelimelerin veya merkez kelimenin komşularının 100 boyutlu Word2Vec
    vektörlerini Temel Bileşen Analizi (PCA / SVD) ile 2 boyuta (x, y) izdüşürür.
    """
    try:
        return nlp_service.project_word_vectors(
            words=payload.words,
            center_word=payload.center_word,
            top_n=payload.top_n
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Projeksiyon hatası: {str(e)}")


@app.get("/api/network", summary="Kelime İlişki Ağı Grafiği", tags=["Görselleştirme"])
def get_word_network(
    word: str = Query(..., min_length=1, description="Merkez kelime"),
    top_n: int = Query(default=8, ge=3, le=20, description="Dahil edilecek komşu kelime sayısı")
):
    """
    Belirtilen kelime ve en yakın komşuları arasındaki semantik ilişki ağını
    düğüm (node) ve kenar (link) yapısında üretir.
    """
    try:
        return nlp_service.get_network(center_word=word, top_n=top_n)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/model/train", summary="Modeli Yeniden Eğit (Hiperparametre Laboratuvarı)", tags=["Word2Vec"])
def train_model_endpoint(payload: TrainModelRequest):
    """
    Özel hiperparametreler ve opsiyonel özel eğitim metniyle Word2Vec modelini
    Gensim motoru üzerinden yeniden eğitir ve performansını ölçer.
    """
    try:
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
        report = nlp_service.train_custom_model(params=params, custom_text=payload.custom_text)
        return report
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Eğitim hatası: {str(e)}")


# Statik web arayüzü desteği
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PYTHON_PORT", "8001"))
    print(f"[LexiMind] FastAPI sunucusu http://127.0.0.1:{port} adresinde başlatılıyor...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
