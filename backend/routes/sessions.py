from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import uuid
from datetime import datetime

from models.schemas import SessionCreate, Session
from database import get_database
from services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("", response_model=dict)
async def create_session(
    session_data: Optional[SessionCreate] = None,
    db = Depends(get_database)
):
    """Create a new anonymous session"""
    try:
        # Create session data
        if session_data:
            user_agent = session_data.user_agent
            ip_address = session_data.ip_address
        else:
            user_agent = None
            ip_address = None
        
        session_dict = SessionService.create_session_data(
            user_agent=user_agent,
            ip_address=ip_address
        )
        
        # Store in database
        await db.sessions.insert_one(session_dict)
        
        return {
            "session_id": session_dict["session_id"],
            "message": "Session created successfully"
        }
    
    except Exception as e:
        print(f"Error creating session: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error creating session"
        )

@router.get("/{session_id}", response_model=Session)
async def get_session(
    session_id: str,
    db = Depends(get_database)
):
    """Get session information"""
    try:
        session_doc = await db.sessions.find_one({"session_id": session_id})
        
        if not session_doc:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )
        
        session_doc.pop("_id", None)  # Remove MongoDB _id
        return Session(**session_doc)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving session: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving session"
        )

@router.get("/{session_id}/stats")
async def get_session_stats(
    session_id: str,
    db = Depends(get_database)
):
    """Get comprehensive session statistics"""
    try:
        # Get session data
        session_doc = await db.sessions.find_one({"session_id": session_id})
        
        if not session_doc:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )
        
        # Get additional stats
        message_count = await db.chat_messages.count_documents({"session_id": session_id})
        journal_count = await db.journal_entries.count_documents({"session_id": session_id})
        screening_count = await db.screenings.count_documents({"session_id": session_id})
        
        # Get latest activity dates
        latest_message = await db.chat_messages.find_one(
            {"session_id": session_id},
            sort=[("timestamp", -1)]
        )
        
        latest_journal = await db.journal_entries.find_one(
            {"session_id": session_id},
            sort=[("created_at", -1)]
        )
        
        stats = SessionService.get_session_stats(session_doc)
        stats.update({
            "actual_message_count": message_count,
            "actual_journal_count": journal_count,
            "screening_count": screening_count,
            "latest_message_at": latest_message["timestamp"] if latest_message else None,
            "latest_journal_at": latest_journal["created_at"] if latest_journal else None
        })
        
        return stats
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving session stats: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving session statistics"
        )

@router.post("/{session_id}/activity")
async def update_session_activity(
    session_id: str,
    db = Depends(get_database)
):
    """Update session last activity timestamp"""
    try:
        update_data = SessionService.update_session_activity(session_id)
        
        result = await db.sessions.update_one(
            {"session_id": session_id},
            update_data
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )
        
        return {"message": "Session activity updated"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating session activity: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error updating session activity"
        )