"""
LexiMind — Cryptographic Security and Authentication Helper (app/core/security.py)
"""

import hmac
import hashlib
import secrets
import time
from typing import Optional, Dict, Any, Tuple
from fastapi import HTTPException, Header, status

from app.core.config import SECRET_KEY, TOKEN_EXPIRY_DAYS

def hash_password(password: str) -> str:
    """
    Hashes password using PBKDF2-HMAC-SHA256 with 100,000 rounds and 16-byte cryptographic salt.
    Format: pbkdf2_sha256$100000$salt_hex$hash_hex
    """
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    )
    return f"pbkdf2_sha256$100000${salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies plain password against stored PBKDF2 hash using constant-time comparison.
    """
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = parts[2]
        expected_hash = parts[3]
        
        computed_key = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations
        )
        return hmac.compare_digest(computed_key.hex(), expected_hash)
    except Exception:
        return False

def create_access_token(user_id: int, email: str) -> str:
    """
    Creates a secure signed authentication token:
    user_id:timestamp:random_nonce:hmac_signature
    """
    timestamp = int(time.time())
    nonce = secrets.token_hex(12)
    payload = f"{user_id}:{email}:{timestamp}:{nonce}"
    sig = hmac.new(SECRET_KEY.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload}:{sig}"

def verify_token(token: str) -> Optional[Tuple[int, str]]:
    """
    Verifies token signature and checks expiration.
    Returns (user_id, email) or None if invalid.
    """
    try:
        parts = token.split(":")
        if len(parts) != 5:
            return None
        user_id_str, email, timestamp_str, nonce, signature = parts
        payload = f"{user_id_str}:{email}:{timestamp_str}:{nonce}"
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
        
        if not hmac.compare_digest(signature, expected_sig):
            return None
        
        timestamp = int(timestamp_str)
        now = int(time.time())
        if now - timestamp > (TOKEN_EXPIRY_DAYS * 86400):
            return None
            
        return int(user_id_str), email
    except Exception:
        return None
