"""
LexiMind — FastAPI Application Server (app/main.py)
AI-Powered Academic Article Analysis & Turkish NLP Platform
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import ALLOWED_ORIGINS
from app.database.db import init_db
from app.api.auth_routes import router as auth_router
from app.api.analysis_routes import router as analysis_router
from app.api.word_routes import router as word_router
from app.api.user_routes import router as user_router
from nlp.service import nlp_service

# Initialize SQLite database schema
init_db()

app = FastAPI(
    title="LexiMind — Academic Article Analysis & Turkish NLP API",
    description="Word2Vec ve istatistiksel/grafiksel anahtar kelime ve çok kelimeli tamlama çıkarım API servisi.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Modular Routers
app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(word_router)
app.include_router(user_router)

@app.get("/health", summary="Sistem Sağlık Kontrolü", tags=["Sistem"])
@app.get("/api/health", summary="Sistem Sağlık Kontrolü", tags=["Sistem"])
def health_check():
    return {
        "status": "healthy",
        "service": "LexiMind Academic NLP API",
        "model_loaded": nlp_service.is_loaded,
        "database": "SQLite (leximind.db active)",
        "environment": os.getenv("ENVIRONMENT", "production")
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PYTHON_PORT", "8001"))
    print(f"[LexiMind] FastAPI sunucusu http://127.0.0.1:{port} adresinde başlatılıyor...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
