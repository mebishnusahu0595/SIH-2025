from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from database import get_database
from models.schemas import User, Resource, Counselor

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/health")
async def admin_health_check():
    """Health check for admin endpoints"""
    return {"status": "ok", "message": "Admin endpoints are available"}

@router.get("/stats")
async def get_system_stats(db = Depends(get_database)):
    """Get system statistics for admin dashboard"""
    try:
        # Count collections
        sessions_count = await db.sessions.count_documents({})
        messages_count = await db.chat_messages.count_documents({})
        journal_entries_count = await db.journal_entries.count_documents({})
        screenings_count = await db.screenings.count_documents({})
        counselors_count = await db.counselors.count_documents({"is_verified": True})
        
        # Count active sessions (last 24 hours)
        from datetime import timedelta
        yesterday = datetime.utcnow() - timedelta(days=1)
        active_sessions = await db.sessions.count_documents({
            "last_active": {"$gte": yesterday}
        })
        
        # Crisis alerts count
        crisis_alerts = await db.sessions.count_documents({
            "crisis_alerts": {"$exists": True, "$ne": []}
        })
        
        return {
            "total_sessions": sessions_count,
            "total_messages": messages_count,
            "total_journal_entries": journal_entries_count,
            "total_screenings": screenings_count,
            "verified_counselors": counselors_count,
            "active_sessions_24h": active_sessions,
            "sessions_with_crisis_alerts": crisis_alerts,
            "last_updated": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        print(f"Error getting system stats: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving system statistics"
        )

@router.get("/counselors/pending")
async def get_pending_counselors(db = Depends(get_database)):
    """Get counselors pending verification"""
    try:
        cursor = db.counselors.find({"is_verified": False})
        
        counselors = []
        async for counselor_doc in cursor:
            counselor_doc.pop("_id", None)
            counselors.append(counselor_doc)
        
        return counselors
    
    except Exception as e:
        print(f"Error getting pending counselors: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving pending counselors"
        )

@router.post("/counselors/{counselor_id}/verify")
async def verify_counselor(
    counselor_id: str,
    db = Depends(get_database)
):
    """Verify a counselor (admin only)"""
    try:
        result = await db.counselors.update_one(
            {"id": counselor_id},
            {
                "$set": {
                    "is_verified": True,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Counselor not found"
            )
        
        return {"message": "Counselor verified successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error verifying counselor: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error verifying counselor"
        )

@router.get("/crisis-alerts")
async def get_crisis_alerts(
    limit: int = 50,
    db = Depends(get_database)
):
    """Get recent crisis alerts for monitoring"""
    try:
        cursor = db.sessions.find(
            {"crisis_alerts": {"$exists": True, "$ne": []}},
            {"session_id": 1, "crisis_alerts": 1, "last_active": 1}
        ).sort("last_active", -1).limit(limit)
        
        alerts = []
        async for session_doc in cursor:
            session_doc.pop("_id", None)
            alerts.append(session_doc)
        
        return alerts
    
    except Exception as e:
        print(f"Error getting crisis alerts: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving crisis alerts"
        )