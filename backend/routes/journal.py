from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List
from datetime import datetime, date, timedelta
import uuid

from database import get_database
from models.schemas import JournalEntry, JournalCreate, MoodStats
from services.rate_limit import rate_limit_service

router = APIRouter(prefix="/journal", tags=["journal"])

@router.post("", response_model=JournalEntry)
async def create_journal_entry(
    entry_data: JournalCreate,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    user_id: Optional[str] = Header(None, alias="X-User-ID"),
    db = Depends(get_database)
):
    """Create a new journal entry"""
    
    # Rate limiting
    rate_limit = await rate_limit_service.check_rate_limit(
        user_id=session_id or "anonymous",
        endpoint="journal"
    )
    
    if not rate_limit['allowed']:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later.",
            headers=rate_limit_service.get_rate_limit_headers(rate_limit)
        )
    
    # Validate mood score
    if not (1 <= entry_data.mood_score <= 10):
        raise HTTPException(
            status_code=400,
            detail="Mood score must be between 1 and 10"
        )
    
    # Create journal entry
    journal_entry = JournalEntry(
        id=str(uuid.uuid4()),
        session_id=session_id,
        user_id=user_id,
        mood_score=entry_data.mood_score,
        content=entry_data.content,
        tags=entry_data.tags or [],
        created_at=datetime.utcnow()
    )
    
    try:
        # Store in database
        await db.journal_entries.insert_one(journal_entry.dict())

        # Update session with journal activity if session exists
        if session_id:
            await db.sessions.update_one(
                {"session_id": session_id},
                {
                    "$inc": {"journal_entries_count": 1},
                    "$set": {
                        "last_journal_entry": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )

        return journal_entry

    except Exception as e:
        print(f"Database error creating journal entry: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error creating journal entry"
        )

@router.get("", response_model=List[JournalEntry])
async def get_journal_entries(
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    user_id: Optional[str] = Header(None, alias="X-User-ID"),
    limit: int = 20,
    skip: int = 0,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db = Depends(get_database)
):
    """Get journal entries for a session or for a user (if X-User-ID provided)"""

    if not user_id and not session_id:
        raise HTTPException(
            status_code=400,
            detail="Session ID or User ID required to retrieve journal entries"
        )

    try:
        # Build query
        query = {}
        if user_id:
            query["user_id"] = user_id
        else:
            query["session_id"] = session_id

        # Add date filters if provided
        if start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = datetime.combine(start_date, datetime.min.time())
            if end_date:
                date_filter["$lte"] = datetime.combine(end_date, datetime.max.time())
            query["created_at"] = date_filter

        # Get entries
        cursor = db.journal_entries.find(query).sort("created_at", -1).skip(skip).limit(limit)

        entries = []
        async for entry_doc in cursor:
            entry_doc.pop("_id", None)  # Remove MongoDB _id
            entries.append(JournalEntry(**entry_doc))

        return entries

    except Exception as e:
        print(f"Database error retrieving journal entries: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving journal entries"
        )

@router.get("/stats", response_model=MoodStats)
async def get_mood_statistics(
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    user_id: Optional[str] = Header(None, alias="X-User-ID"),
    days: int = 30,
    db = Depends(get_database)
):
    """Get mood statistics for a session"""
    
    if not user_id and not session_id:
        raise HTTPException(
            status_code=400,
            detail="Session ID or User ID required to retrieve mood statistics"
        )
    
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Aggregate mood data
        # Build match stage to use user_id when present
        match_stage = {
            "created_at": {"$gte": start_date, "$lte": end_date}
        }
        if user_id:
            match_stage["user_id"] = user_id
        else:
            match_stage["session_id"] = session_id

        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": None,
                    "avg_mood": {"$avg": "$mood_score"},
                    "min_mood": {"$min": "$mood_score"},
                    "max_mood": {"$max": "$mood_score"},
                    "total_entries": {"$sum": 1},
                    "mood_scores": {"$push": "$mood_score"}
                }
            }
        ]
        
        result = await db.journal_entries.aggregate(pipeline).to_list(1)
        
        if not result:
            # No entries found
            return MoodStats(
                average_mood=0,
                mood_trend="stable",
                total_entries=0,
                streak_days=0,
                most_common_mood=0
            )
        
        stats = result[0]
        avg_mood = round(stats.get("avg_mood", 0), 1)
        mood_scores = stats.get("mood_scores", [])
        total_entries = stats.get("total_entries", 0)
        
        # Calculate mood trend (compare first half vs second half of period)
        if len(mood_scores) >= 4:
            mid_point = len(mood_scores) // 2
            first_half_avg = sum(mood_scores[:mid_point]) / mid_point
            second_half_avg = sum(mood_scores[mid_point:]) / (len(mood_scores) - mid_point)
            
            if second_half_avg > first_half_avg + 0.5:
                mood_trend = "improving"
            elif second_half_avg < first_half_avg - 0.5:
                mood_trend = "declining"
            else:
                mood_trend = "stable"
        else:
            mood_trend = "stable"
        
        # Calculate streak (consecutive days with entries)
        streak_days = await _calculate_journal_streak(db, session_id)
        
        # Find most common mood score
        if mood_scores:
            from collections import Counter
            mood_counter = Counter(mood_scores)
            most_common_mood = mood_counter.most_common(1)[0][0]
        else:
            most_common_mood = 0
        
        return MoodStats(
            average_mood=avg_mood,
            mood_trend=mood_trend,
            total_entries=total_entries,
            streak_days=streak_days,
            most_common_mood=most_common_mood
        )
    
    except Exception as e:
        print(f"Database error calculating mood statistics: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error calculating mood statistics"
        )

@router.get("/{entry_id}", response_model=JournalEntry)
async def get_journal_entry(
    entry_id: str,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    db = Depends(get_database)
):
    """Get a specific journal entry"""
    
    if not session_id:
        raise HTTPException(
            status_code=400,
            detail="Session ID required to retrieve journal entry"
        )
    
    try:
        entry_doc = await db.journal_entries.find_one({
            "id": entry_id,
            "session_id": session_id
        })
        
        if not entry_doc:
            raise HTTPException(
                status_code=404,
                detail="Journal entry not found"
            )
        
        entry_doc.pop("_id", None)  # Remove MongoDB _id
        return JournalEntry(**entry_doc)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Database error retrieving journal entry: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving journal entry"
        )

@router.delete("/{entry_id}")
async def delete_journal_entry(
    entry_id: str,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    db = Depends(get_database)
):
    """Delete a journal entry"""
    
    if not session_id:
        raise HTTPException(
            status_code=400,
            detail="Session ID required to delete journal entry"
        )
    
    try:
        # Check if entry exists and belongs to session
        existing_entry = await db.journal_entries.find_one({
            "id": entry_id,
            "session_id": session_id
        })
        
        if not existing_entry:
            raise HTTPException(
                status_code=404,
                detail="Journal entry not found"
            )
        
        # Delete the entry
        result = await db.journal_entries.delete_one({
            "id": entry_id,
            "session_id": session_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Journal entry not found"
            )
        
        # Update session journal count
        await db.sessions.update_one(
            {"session_id": session_id},
            {
                "$inc": {"journal_entries_count": -1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return {"message": "Journal entry deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Database error deleting journal entry: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error deleting journal entry"
        )

async def _calculate_journal_streak(db, session_id: str) -> int:
    """Calculate consecutive days with journal entries"""
    try:
        # Get the most recent journal entries
        cursor = db.journal_entries.find(
            {"session_id": session_id}
        ).sort("created_at", -1).limit(100)  # Check last 100 entries
        
        entries = []
        async for entry in cursor:
            entries.append(entry["created_at"].date())
        
        if not entries:
            return 0
        
        # Count consecutive days
        entries = sorted(set(entries), reverse=True)  # Remove duplicates and sort
        
        streak = 0
        current_date = datetime.utcnow().date()
        
        for entry_date in entries:
            if entry_date == current_date:
                streak += 1
                current_date -= timedelta(days=1)
            elif entry_date == current_date + timedelta(days=1):
                # Entry from yesterday, continue streak
                streak += 1
                current_date = entry_date - timedelta(days=1)
            else:
                # Gap in entries, break streak
                break
        
        return streak
    
    except Exception as e:
        print(f"Error calculating journal streak: {e}")
        return 0