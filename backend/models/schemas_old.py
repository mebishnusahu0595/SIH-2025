from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

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
    message: str
    crisis_detected: bool = False
    crisis_resources: Optional[Dict[str, Any]] = None
    session_id: str
    timestamp: datetime

class ChatHistory(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    session_id: str
    messages: List[ChatMessage] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ScreeningResponse(BaseModel):
    question_id: int
    response: int  # 0-3 for PHQ-9/GAD-7

class ScreeningSubmission(BaseModel):
    session_id: str
    assessment_type: Literal["PHQ9", "GAD7"]
    responses: List[ScreeningResponse]

class ScreeningResult(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    session_id: str
    assessment_type: Literal["PHQ9", "GAD7"]
    responses: List[ScreeningResponse]
    total_score: int
    severity_level: str
    recommendation: Literal["self-care", "counselor", "emergency"]
    interpretation: str
    completed_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class JournalEntryCreate(BaseModel):
    session_id: str
    content: str
    mood: int  # 1-5 scale
    tags: Optional[List[str]] = Field(default_factory=list)

class JournalEntry(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    session_id: str
    content: str
    mood: int
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class CounselorCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    specialties: List[str]
    credentials: str
    bio: str
    availability: str
    website: Optional[str] = None

class Counselor(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    email: EmailStr
    phone: Optional[str] = None
    specialties: List[str]
    credentials: str
    bio: str
    availability: str
    website: Optional[str] = None
    is_verified: bool = True
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class CrisisEvent(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    session_id: str
    message_content: str
    confidence_score: float
    keywords_detected: List[str]
    action_taken: str
    resolved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class AdminStats(BaseModel):
    total_sessions: int
    total_chats: int
    total_screenings: int
    total_journal_entries: int
    crisis_events: int
    unresolved_crisis_events: int
    average_mood: float
    active_counselors: int