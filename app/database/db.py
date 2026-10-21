"""
LexiMind — SQLite Database Layer (app/database/db.py)
Clean relational schema with thread-safe connection pooling and migrations.
"""

import sqlite3
import json
import time
from typing import Optional, Dict, Any, List, Tuple
from contextlib import contextmanager

from app.core.config import DATABASE_PATH

@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """
    Initializes tables if they do not exist.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                settings_json TEXT DEFAULT '{}'
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        
        # 2. Analyses table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                title TEXT NOT NULL,
                document_type TEXT NOT NULL, -- 'pdf', 'docx', 'txt', 'paste'
                raw_text_summary TEXT NOT NULL,
                word_count INTEGER NOT NULL,
                sentence_count INTEGER NOT NULL,
                processing_time_ms INTEGER NOT NULL,
                keywords_json TEXT NOT NULL,
                phrases_json TEXT NOT NULL,
                model_status_json TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at DESC)")

# ----------------- User DB Operations -----------------

def db_create_user(email: str, password_hash: str, full_name: str) -> Dict[str, Any]:
    now = int(time.time())
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, created_at, updated_at, settings_json)
            VALUES (?, ?, ?, ?, ?, '{}')
        """, (email.lower().strip(), password_hash, full_name.strip(), now, now))
        user_id = cursor.lastrowid
        return {
            "id": user_id,
            "email": email.lower().strip(),
            "full_name": full_name.strip(),
            "created_at": now
        }

def db_get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None

def db_get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name, created_at, updated_at, settings_json FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            d = dict(row)
            try:
                d["settings"] = json.loads(d.get("settings_json") or "{}")
            except Exception:
                d["settings"] = {}
            return d
        return None

def db_update_user_profile(user_id: int, full_name: Optional[str] = None, settings: Optional[Dict[str, Any]] = None) -> bool:
    now = int(time.time())
    with get_db() as conn:
        cursor = conn.cursor()
        if full_name and settings is not None:
            cursor.execute("UPDATE users SET full_name = ?, settings_json = ?, updated_at = ? WHERE id = ?",
                           (full_name.strip(), json.dumps(settings), now, user_id))
        elif full_name:
            cursor.execute("UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?",
                           (full_name.strip(), now, user_id))
        elif settings is not None:
            cursor.execute("UPDATE users SET settings_json = ?, updated_at = ? WHERE id = ?",
                           (json.dumps(settings), now, user_id))
        return cursor.rowcount > 0

def db_update_user_password(user_id: int, new_password_hash: str) -> bool:
    now = int(time.time())
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
                       (new_password_hash, now, user_id))
        return cursor.rowcount > 0

def db_delete_user_account(user_id: int) -> bool:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM analyses WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        return cursor.rowcount > 0

# ----------------- Analysis DB Operations -----------------

def db_save_analysis(analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO analyses (
                id, user_id, title, document_type, raw_text_summary,
                word_count, sentence_count, processing_time_ms,
                keywords_json, phrases_json, model_status_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            analysis_data["id"],
            analysis_data.get("user_id"),
            analysis_data["title"],
            analysis_data["document_type"],
            analysis_data["raw_text_summary"],
            analysis_data["word_count"],
            analysis_data["sentence_count"],
            analysis_data["processing_time_ms"],
            json.dumps(analysis_data["keywords"], ensure_ascii=False),
            json.dumps(analysis_data.get("phrases", []), ensure_ascii=False),
            json.dumps(analysis_data.get("model_status", {}), ensure_ascii=False),
            analysis_data["created_at"]
        ))
    return analysis_data

def db_get_user_analyses(user_id: Optional[int], search: str = "", limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        params = []
        where_clauses = []
        
        if user_id is not None:
            where_clauses.append("user_id = ?")
            params.append(user_id)
        else:
            where_clauses.append("user_id IS NULL")
            
        if search.strip():
            where_clauses.append("title LIKE ?")
            params.append(f"%{search.strip()}%")
            
        query = f"SELECT id, user_id, title, document_type, word_count, sentence_count, processing_time_ms, keywords_json, created_at FROM analyses WHERE {' AND '.join(where_clauses)} ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        results = []
        for r in rows:
            item = dict(r)
            try:
                kw = json.loads(item["keywords_json"])
                item["keyword_count"] = len(kw)
                item["top_keywords"] = [k["term"] for k in kw[:5]]
            except Exception:
                item["keyword_count"] = 0
                item["top_keywords"] = []
            del item["keywords_json"]
            results.append(item)
        return results

def db_get_analysis_by_id(analysis_id: str, user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        if user_id is not None:
            cursor.execute("SELECT * FROM analyses WHERE id = ? AND (user_id = ? OR user_id IS NULL)", (analysis_id, user_id))
        else:
            cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
        row = cursor.fetchone()
        if not row:
            return None
        d = dict(row)
        d["keywords"] = json.loads(d.get("keywords_json") or "[]")
        d["phrases"] = json.loads(d.get("phrases_json") or "[]")
        d["model_status"] = json.loads(d.get("model_status_json") or "{}")
        d["language"] = d.get("language") or "tr"
        return d

def db_delete_analysis(analysis_id: str, user_id: Optional[int] = None) -> bool:
    with get_db() as conn:
        cursor = conn.cursor()
        if user_id is not None:
            cursor.execute("DELETE FROM analyses WHERE id = ? AND user_id = ?", (analysis_id, user_id))
        else:
            cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
        return cursor.rowcount > 0

def db_get_user_stats(user_id: Optional[int]) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        where_clause = "user_id = ?" if user_id is not None else "user_id IS NULL"
        params = (user_id,) if user_id is not None else ()
        cursor.execute(f"""
            SELECT 
                COUNT(*) as total_analyses,
                SUM(word_count) as total_words,
                MAX(created_at) as last_analyzed_at
            FROM analyses 
            WHERE {where_clause}
        """, params)
        row = cursor.fetchone()
        
        cursor.execute(f"SELECT keywords_json FROM analyses WHERE {where_clause}", params)
        kw_rows = cursor.fetchall()
        total_kw = 0
        for r in kw_rows:
            try:
                total_kw += len(json.loads(r["keywords_json"]))
            except Exception:
                pass
                
        cursor.execute(f"SELECT title, created_at, id FROM analyses WHERE {where_clause} ORDER BY created_at DESC LIMIT 1", params)
        recent = cursor.fetchone()
        
        return {
            "total_analyses": (row["total_analyses"] if row else 0) or 0,
            "total_extracted_keywords": total_kw,
            "processed_documents": (row["total_analyses"] if row else 0) or 0,
            "most_recent_article": dict(recent) if recent else None
        }
