"""
LexiMind — User Profile & Settings Routes (app/api/user_routes.py)
"""

from fastapi import APIRouter, HTTPException, Depends, status

from app.schemas.auth import (
    UserProfileResponse,
    UpdateProfileRequest,
    ChangePasswordRequest
)
from app.api.auth_routes import get_current_user_required
from app.core.security import verify_password, hash_password
from app.database.db import (
    db_update_user_profile,
    db_update_user_password,
    db_delete_user_account,
    db_get_user_by_email
)

router = APIRouter(prefix="/api/user", tags=["Kullanıcı Profili & Ayarlar"])

@router.get("/profile", response_model=UserProfileResponse, summary="Kullanıcı Profilini Getir")
def get_profile(user: dict = Depends(get_current_user_required)):
    return user

@router.patch("/profile", response_model=UserProfileResponse, summary="Profil ve Tercihleri Güncelle")
def update_profile(
    payload: UpdateProfileRequest,
    user: dict = Depends(get_current_user_required)
):
    updated = db_update_user_profile(
        user_id=user["id"],
        full_name=payload.full_name,
        settings=payload.settings
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profil güncellenemedi.")
    
    # Return fresh user record
    fresh_user = {**user}
    if payload.full_name:
        fresh_user["full_name"] = payload.full_name.strip()
    if payload.settings is not None:
        fresh_user["settings"] = payload.settings
    return fresh_user

@router.post("/change-password", summary="Parola Değiştir")
def change_password(
    payload: ChangePasswordRequest,
    user: dict = Depends(get_current_user_required)
):
    full_user = db_get_user_by_email(user["email"])
    if not full_user or not verify_password(payload.current_password, full_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mevcut parolanız hatalı."
        )

    new_hash = hash_password(payload.new_password)
    db_update_user_password(user["id"], new_hash)
    return {"status": "success", "message": "Parolanız başarıyla güncellendi."}

@router.delete("/account", summary="Kullanıcı Hesabını Kalıcı Olarak Sil")
def delete_account(user: dict = Depends(get_current_user_required)):
    deleted = db_delete_user_account(user["id"])
    if not deleted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hesap silinemedi.")
    return {"status": "success", "message": "Hesabınız ve tüm ilişkili verileriniz kalıcı olarak silindi."}
