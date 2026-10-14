"""
LexiMind — Vercel Serverless Function Entry Point for Flask
Compliant with Vercel & Flask documentation:
https://vercel.com/docs/frameworks/backend/flask

This module exposes the Flask application instance `app` so that
developers who prefer Flask can deploy directly on Vercel.
"""

import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app_flask import app

# Export app for Vercel WSGI serverless handler
__all__ = ["app"]
