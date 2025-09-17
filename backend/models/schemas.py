from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

# Session Models
class SessionCreate(BaseModel):
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None

class Session(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={datetime: lambda v: v.isoformat()}
    )
    
    session_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_anonymous: bool = True
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    message_count: int = 0
    journal_entries_count: int = 0
    crisis_alerts: List[Dict[str, Any]] = Field(default_factory=list)
    screening_history: List[Dict[str, Any]] = Field(default_factory=list)
    last_journal_entry: Optional[datetime] = None

# Chat Models
class ChatMessage(BaseModel):
    id: str
    session_id: Optional[str] = None
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatCreate(BaseModel):
    message: str

class ChatResponse(BaseModel):
    user_message: ChatMessage
    ai_message: ChatMessage
    crisis_detected: bool = False
    crisis_resources: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None

# Screening Models
class ScreeningResponse(BaseModel):
    question_id: int
    score: int

class ScreeningCreate(BaseModel):
    responses: List[ScreeningResponse]

class PHQ9Response(ScreeningResponse):
    pass

class GAD7Response(ScreeningResponse):
    pass

class ScreeningResult(BaseModel):
    id: str
    session_id: Optional[str] = None
    screening_type: Literal["phq9", "gad7"]
    total_score: int
    severity: str
    interpretation: str
    recommendations: List[str]
    crisis_detected: bool = False
    responses: List[ScreeningResponse]
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Journal Models  
class JournalCreate(BaseModel):
    mood_score: int = Field(..., ge=1, le=10)
    content: str
    tags: Optional[List[str]] = None

class JournalEntry(BaseModel):
    id: str
    session_id: Optional[str] = None
    mood_score: int
    content: str
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MoodStats(BaseModel):
    average_mood: float
    mood_trend: Literal["improving", "declining", "stable"]
    total_entries: int
    streak_days: int
    most_common_mood: int

# Counselor Models
class CounselorCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    specialties: List[str]
    bio: Optional[str] = None
    location: Optional[str] = None
    experience_years: Optional[int] = None
    education: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    session_types: List[Literal["individual", "group", "family", "online"]] = Field(default_factory=list)
    rate_per_session: Optional[float] = None

class Counselor(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    specialties: List[str]
    bio: Optional[str] = None
    location: Optional[str] = None
    experience_years: Optional[int] = None
    education: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    session_types: List[str] = Field(default_factory=list)
    rate_per_session: Optional[float] = None
    is_available: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Resource Models
class ResourceCreate(BaseModel):
    title: str
    description: str
    content: str
    category: Literal["articles", "videos", "exercises", "tools"]
    tags: List[str] = Field(default_factory=list)
    external_url: Optional[str] = None

class Resource(BaseModel):
    id: str
    title: str
    description: str
    content: str
    category: str
    tags: List[str] = Field(default_factory=list)
    external_url: Optional[str] = None
    is_featured: bool = False
    view_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# User/Admin Models (for future expansion)
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class User(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    role: Literal["user", "counselor", "admin"] = "user"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)