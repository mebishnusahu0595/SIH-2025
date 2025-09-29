# User Authentication Models

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Literal
from datetime import datetime
import re

class User(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_verified: bool = False
    is_active: bool = True
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    profile_picture: Optional[str] = None

class UserRole(BaseModel):
    name: Literal["patient", "doctor", "admin"]
    permissions: List[str] = []

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = None
    role: Literal["patient", "doctor"] = "patient"
    date_of_birth: Optional[datetime] = None
    gender: Optional[Literal["male", "female", "other", "prefer_not_to_say"]] = None
    specialization: Optional[str] = None
    bio: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r"[A-Za-z]", v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r"\d", v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^[+]?[1-9]\d{1,14}$', v):
            raise ValueError('Invalid phone number format')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_verified: bool = False
    is_active: bool = True
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    profile_picture: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[Literal["male", "female", "other", "prefer_not_to_say"]] = None
    profile_picture: Optional[str] = None

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r"[A-Za-z]", v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r"\d", v):
            raise ValueError('Password must contain at least one number')
        return v

class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r"[A-Za-z]", v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r"\d", v):
            raise ValueError('Password must contain at least one number')
        return v

class EmailVerification(BaseModel):
    token: str

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: Optional[int] = None

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

# Doctor-specific models (for role="doctor")
class DoctorProfile(BaseModel):
    specializations: List[str] = []
    qualifications: List[str] = []
    experience_years: Optional[int] = None
    license_number: Optional[str] = None
    consultation_fee: Optional[float] = None
    availability: Optional[dict] = None  # Weekly schedule
    bio: Optional[str] = None
    languages: List[str] = ["English"]
    is_verified: bool = False

class DoctorRegistration(UserCreate):
    role: Literal["doctor"] = "doctor"
    specializations: List[str] = Field(..., min_items=1)
    qualifications: List[str] = Field(..., min_items=1)
    experience_years: int = Field(..., ge=0, le=50)
    license_number: str = Field(..., min_length=5)
    consultation_fee: float = Field(..., ge=100, le=100000)
    bio: str = Field(..., min_length=50, max_length=1000)

# Patient-specific models
class PatientProfile(BaseModel):
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    medical_history: List[str] = []
    current_medications: List[str] = []
    allergies: List[str] = []
    preferred_language: str = "English"
    insurance_info: Optional[dict] = None