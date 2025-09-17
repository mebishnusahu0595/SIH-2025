import uuid
from datetime import datetime
from typing import Optional, Dict, Any

class SessionService:
    @staticmethod
    def generate_session_id() -> str:
        """Generate a unique session ID"""
        return str(uuid.uuid4())
    
    @staticmethod
    def create_session_data(
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create session data dictionary"""
        session_id = SessionService.generate_session_id()
        now = datetime.utcnow()
        
        return {
            "session_id": session_id,
            "created_at": now,
            "last_active": now,
            "updated_at": now,
            "is_anonymous": True,
            "user_agent": user_agent,
            "ip_address": ip_address,
            "message_count": 0,
            "journal_entries_count": 0,
            "crisis_alerts": [],
            "screening_history": [],
            "last_journal_entry": None
        }
    
    @staticmethod
    def update_session_activity(session_id: str) -> Dict[str, Any]:
        """Create update data for session activity"""
        return {
            "$set": {
                "last_active": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    
    @staticmethod
    def is_session_valid(session_data: Dict[str, Any]) -> bool:
        """Check if session data is valid"""
        required_fields = ["session_id", "created_at", "is_anonymous"]
        return all(field in session_data for field in required_fields)
    
    @staticmethod
    def get_session_stats(session_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get session statistics"""
        return {
            "session_id": session_data.get("session_id"),
            "created_at": session_data.get("created_at"),
            "last_active": session_data.get("last_active"),
            "message_count": session_data.get("message_count", 0),
            "journal_entries_count": session_data.get("journal_entries_count", 0),
            "has_crisis_alerts": len(session_data.get("crisis_alerts", [])) > 0,
            "screening_count": len(session_data.get("screening_history", [])),
            "is_anonymous": session_data.get("is_anonymous", True)
        }