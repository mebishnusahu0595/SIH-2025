from fastapi import APIRouter, HTTPException, Depends
from typing import List
import uuid
from datetime import datetime

from models.schemas import SessionCreate, Session
from database import get_database
from services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("/", response_model=dict)
async def create_session(session_data: SessionCreate = None):
    """Create a new anonymous session"""
    try:
        session_id = str(uuid.uuid4())
        
        session = Session(
            session_id=session_id,
            user_agent=session_data.user_agent if session_data else None,
            ip_address=session_data.ip_address if session_data else None
        )
        
        collection = await Collections.sessions()
        result = await collection.insert_one(session.dict(by_alias=True, exclude={"id"}))
        
        return {
            "session_id": session_id,
            "created_at": session.created_at.isoformat(),
            "message": "Session created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@router.get("/{session_id}", response_model=Session)
async def get_session(session_id: str):
    """Get session information"""
    try:
        collection = await Collections.sessions()
        session = await collection.find_one({"session_id": session_id})
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Update last_active timestamp
        await collection.update_one(
            {"session_id": session_id},
            {"$set": {"last_active": datetime.utcnow()}}
        )
        
        return Session(**session)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")

@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and all associated data"""
    try:
        # Delete session
        sessions_collection = await Collections.sessions()
        session_result = await sessions_collection.delete_one({"session_id": session_id})
        
        if session_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Delete associated data
        chat_collection = await Collections.chat_history()
        await chat_collection.delete_many({"session_id": session_id})
        
        journal_collection = await Collections.journal_entries()
        await journal_collection.delete_many({"session_id": session_id})
        
        screening_collection = await Collections.screening_results()
        await screening_collection.delete_many({"session_id": session_id})
        
        return {"message": "Session and associated data deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")

@router.put("/{session_id}/heartbeat")
async def session_heartbeat(session_id: str):
    """Update session last_active timestamp"""
    try:
        collection = await Collections.sessions()
        result = await collection.update_one(
            {"session_id": session_id},
            {"$set": {"last_active": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"message": "Session updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update session: {str(e)}")