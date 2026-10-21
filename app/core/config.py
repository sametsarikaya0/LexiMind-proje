"""
LexiMind — Application Configuration (app/core/config.py)
"""

import os
from typing import List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# Database
DATABASE_PATH = os.path.join(DATA_DIR, "leximind.db")

# NLP Models and Corpora
DEFAULT_MODEL_PATH = os.path.join(MODELS_DIR, "word2vec_tr.model")
DEFAULT_CORPUS_PATH = os.path.join(DATA_DIR, "corpus.txt")
DEFAULT_EVAL_PATH = os.path.join(DATA_DIR, "evaluation_set.json")

# Security & Secrets
SECRET_KEY = os.getenv("SECRET_KEY", "leximind-academic-nlp-secret-key-2026-secure")
TOKEN_EXPIRY_DAYS = 30

# File Upload Constraints
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

# CORS
ALLOWED_ORIGINS: List[str] = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]
