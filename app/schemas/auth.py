"""
LexiMind — Authentication & User Profile Schemas (app/schemas/auth.py)
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Kullanıcının tam adı")
    email: str = Field(..., pattern=EMAIL_REGEX, description="Geçerli e-posta adresi")
    password: str = Field(..., min_length=6, max_length=128, description="En az 6 karakterli parola")
    terms_accepted: bool = Field(..., description="Kullanım Koşulları ve Gizlilik Politikası onayı")

class UserLoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX, description="Kayıtlı e-posta adresi")
    password: str = Field(..., description="Hesap parolası")

class UserProfileResponse(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: int
    updated_at: Optional[int] = None
    settings: Optional[Dict[str, Any]] = None

class AuthResponse(BaseModel):
    status: str = "success"
    message: str
    token: str
    user: UserProfileResponse

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    settings: Optional[Dict[str, Any]] = None

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6, max_length=128)

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
