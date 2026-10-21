"""
LexiMind — Authentication Routes (app/api/auth_routes.py)
"""

from fastapi import APIRouter, HTTPException, Header, status, Depends
from typing import Optional

from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    AuthResponse,
    UserProfileResponse,
    ForgotPasswordRequest
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token
)
from app.database.db import (
    db_create_user,
    db_get_user_by_email,
    db_get_user_by_id
)

router = APIRouter(prefix="/api/auth", tags=["Kimlik Doğrulama"])

def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """
    Returns authenticated user dict if valid Bearer token provided, or None.
    """
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "").strip()
    verified = verify_token(token)
    if not verified:
        return None
    user_id, email = verified
    return db_get_user_by_id(user_id)

def get_current_user_required(authorization: Optional[str] = Header(None)) -> dict:
    """
    Ensures user is authenticated. Raises 401 if not.
    """
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bu işlemi gerçekleştirmek için lütfen giriş yapın."
        )
    return user

@router.post("/register", response_model=AuthResponse, summary="Yeni Kullanıcı Kaydı")
def register(payload: UserRegisterRequest):
    if not payload.terms_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kayıt olmak için Kullanım Koşulları ve Gizlilik Politikasını onaylamanız gerekmektedir."
        )

    existing = db_get_user_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta adresi ile zaten kayıtlı bir hesap bulunmaktadır."
        )

    hashed = hash_password(payload.password)
    new_user = db_create_user(
        email=payload.email,
        password_hash=hashed,
        full_name=payload.full_name
    )

    token = create_access_token(new_user["id"], new_user["email"])
    return {
        "status": "success",
        "message": "Hesabınız başarıyla oluşturuldu.",
        "token": token,
        "user": {
            "id": new_user["id"],
            "email": new_user["email"],
            "full_name": new_user["full_name"],
            "created_at": new_user["created_at"],
            "settings": {}
        }
    }

@router.post("/login", response_model=AuthResponse, summary="Kullanıcı Girişi")
def login(payload: UserLoginRequest):
    user = db_get_user_by_email(payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya parola hatalı."
        )

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya parola hatalı."
        )

    token = create_access_token(user["id"], user["email"])
    user_data = db_get_user_by_id(user["id"])
    return {
        "status": "success",
        "message": "Giriş başarılı.",
        "token": token,
        "user": user_data
    }

@router.post("/logout", summary="Kullanıcı Çıkışı")
def logout():
    return {"status": "success", "message": "Oturum başarıyla sonlandırıldı."}

@router.get("/me", response_model=UserProfileResponse, summary="Aktif Kullanıcı Bilgisi")
def get_me(user: dict = Depends(get_current_user_required)):
    return user

@router.post("/forgot-password", summary="Parola Sıfırlama Talebi")
def forgot_password(payload: ForgotPasswordRequest):
    user = db_get_user_by_email(payload.email)
    # Honest disclosure: in university/demo environment without SMTP relay configured
    return {
        "status": "info",
        "message": (
            "Parola sıfırlama talebiniz alındı. Geliştirme ortamında e-posta sunucusu (SMTP) "
            "bağlı olmadığından parolanızı doğrudan Profil/Ayarlar sayfasından güncelleyebilirsiniz."
        ),
        "email_exists": bool(user)
    }
