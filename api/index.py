"""
LexiMind — Vercel Serverless Function Entry Point for FastAPI
Compliant with Vercel & FastAPI documentation:
https://vercel.com/docs/frameworks/backend/fastapi

This module exposes the FastAPI application instance `app` so that
Vercel's Python runtime can seamlessly serve all /api/* routes.
"""

import os
import sys

# Ensure root directory is in sys.path for nlp and main imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from main import app

# Export app for Vercel ASGI serverless handler
__all__ = ["app"]
