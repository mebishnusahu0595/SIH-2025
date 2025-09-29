from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List
from datetime import datetime
import uuid

from database import get_database
from models.schemas import (
    ScreeningCreate, ScreeningResponse, ScreeningResult,
    PHQ9Response, GAD7Response
)
from services.rate_limit import rate_limit_service

router = APIRouter(prefix="/screening", tags=["screening"])

@router.post("/phq9", response_model=ScreeningResult)
async def submit_phq9_screening(
    screening_data: ScreeningCreate,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    user_id: Optional[str] = Header(None, alias="X-User-ID"),
    db = Depends(get_database)
):
    """Submit PHQ-9 depression screening"""
    
    # Rate limiting
    rate_limit = await rate_limit_service.check_rate_limit(
        user_id=session_id or "anonymous",
        endpoint="screening"
    )
    
    if not rate_limit['allowed']:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later.",
            headers=rate_limit_service.get_rate_limit_headers(rate_limit)
        )
    
    # Validate PHQ-9 responses (9 questions, scores 0-3)
    if len(screening_data.responses) != 9:
        raise HTTPException(
            status_code=400,
            detail="PHQ-9 requires exactly 9 responses"
        )
    
    for response in screening_data.responses:
        if not (0 <= response.score <= 3):
            raise HTTPException(
                status_code=400,
                detail="PHQ-9 scores must be between 0 and 3"
            )
    
    # Calculate total score
    total_score = sum(response.score for response in screening_data.responses)
    
    # Interpret PHQ-9 score
    if total_score <= 4:
        severity = "minimal"
        interpretation = "Minimal depression symptoms"
        recommendations = [
            "Continue with healthy lifestyle habits",
            "Stay connected with friends and family",
            "Regular exercise and good sleep hygiene"
        ]
    elif total_score <= 9:
        severity = "mild"
        interpretation = "Mild depression symptoms"
        recommendations = [
            "Consider talking to a counselor or therapist",
            "Practice stress management techniques",
            "Maintain regular social activities",
            "Monitor your mood and symptoms"
        ]
    elif total_score <= 14:
        severity = "moderate"
        interpretation = "Moderate depression symptoms"
        recommendations = [
            "Strongly consider professional mental health support",
            "Talk to your primary care doctor",
            "Consider therapy or counseling",
            "Reach out to trusted friends or family"
        ]
    elif total_score <= 19:
        severity = "moderately_severe"
        interpretation = "Moderately severe depression symptoms"
        recommendations = [
            "Seek professional help from a mental health provider",
            "Consider both therapy and medication evaluation",
            "Create a safety plan if needed",
            "Involve trusted support persons in your care"
        ]
    else:
        severity = "severe"
        interpretation = "Severe depression symptoms"
        recommendations = [
            "Seek immediate professional mental health care",
            "Contact your doctor or mental health provider today",
            "Consider crisis resources if having thoughts of self-harm",
            "Call 988 if experiencing suicidal thoughts"
        ]
    
    # Check for crisis indicators (question 9 about self-harm thoughts)
    crisis_detected = False
    if len(screening_data.responses) >= 9:
        q9_score = screening_data.responses[8].score  # Question 9 (index 8)
        if q9_score >= 1:  # Any positive response to suicidal ideation
            crisis_detected = True
    
    # Create screening result
    screening_result = ScreeningResult(
        id=str(uuid.uuid4()),
        session_id=session_id,
        user_id=user_id,
        screening_type="phq9",
        total_score=total_score,
        severity=severity,
        interpretation=interpretation,
        recommendations=recommendations,
        crisis_detected=crisis_detected,
        responses=screening_data.responses,
        created_at=datetime.utcnow()
    )
    
    # Store in database
    try:
        await db.screenings.insert_one(screening_result.dict())

        # Update session with screening info if session exists
        if session_id:
            await db.sessions.update_one(
                {"session_id": session_id},
                {
                    "$push": {"screening_history": {
                        "screening_id": screening_result.id,
                        "type": "phq9",
                        "score": total_score,
                        "severity": severity,
                        "crisis_detected": crisis_detected,
                        "date": datetime.utcnow()
                    }},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )

    except Exception as e:
        print(f"Database error storing PHQ-9 screening: {e}")
        # Continue execution - don't fail if database storage fails
    
    return screening_result

@router.post("/gad7", response_model=ScreeningResult)
async def submit_gad7_screening(
    screening_data: ScreeningCreate,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    user_id: Optional[str] = Header(None, alias="X-User-ID"),
    db = Depends(get_database)
):
    """Submit GAD-7 anxiety screening"""
    
    # Rate limiting
    rate_limit = await rate_limit_service.check_rate_limit(
        user_id=session_id or "anonymous",
        endpoint="screening"
    )
    
    if not rate_limit['allowed']:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later.",
            headers=rate_limit_service.get_rate_limit_headers(rate_limit)
        )
    
    # Validate GAD-7 responses (7 questions, scores 0-3)
    if len(screening_data.responses) != 7:
        raise HTTPException(
            status_code=400,
            detail="GAD-7 requires exactly 7 responses"
        )
    
    for response in screening_data.responses:
        if not (0 <= response.score <= 3):
            raise HTTPException(
                status_code=400,
                detail="GAD-7 scores must be between 0 and 3"
            )
    
    # Calculate total score
    total_score = sum(response.score for response in screening_data.responses)
    
    # Interpret GAD-7 score
    if total_score <= 4:
        severity = "minimal"
        interpretation = "Minimal anxiety symptoms"
        recommendations = [
            "Continue with healthy stress management",
            "Practice relaxation techniques",
            "Maintain regular exercise and sleep"
        ]
    elif total_score <= 9:
        severity = "mild"
        interpretation = "Mild anxiety symptoms"
        recommendations = [
            "Practice deep breathing and mindfulness",
            "Consider stress reduction techniques",
            "Monitor anxiety triggers",
            "Consider talking to a counselor if symptoms persist"
        ]
    elif total_score <= 14:
        severity = "moderate"
        interpretation = "Moderate anxiety symptoms"
        recommendations = [
            "Consider professional mental health support",
            "Practice anxiety management techniques",
            "Talk to your primary care doctor",
            "Consider therapy or counseling"
        ]
    else:
        severity = "severe"
        interpretation = "Severe anxiety symptoms"
        recommendations = [
            "Seek professional mental health care",
            "Consider both therapy and medication evaluation",
            "Practice immediate anxiety relief techniques",
            "Reach out to trusted support persons"
        ]
    
    # GAD-7 doesn't have specific crisis indicators like PHQ-9
    # But high scores warrant attention
    crisis_detected = total_score >= 15
    
    # Create screening result
    screening_result = ScreeningResult(
        id=str(uuid.uuid4()),
        session_id=session_id,
        user_id=user_id,
        screening_type="gad7",
        total_score=total_score,
        severity=severity,
        interpretation=interpretation,
        recommendations=recommendations,
        crisis_detected=crisis_detected,
        responses=screening_data.responses,
        created_at=datetime.utcnow()
    )
    
    # Store in database
    try:
        await db.screenings.insert_one(screening_result.dict())

        # Update session with screening info if session exists
        if session_id:
            await db.sessions.update_one(
                {"session_id": session_id},
                {
                    "$push": {"screening_history": {
                        "screening_id": screening_result.id,
                        "type": "gad7",
                        "score": total_score,
                        "severity": severity,
                        "crisis_detected": crisis_detected,
                        "date": datetime.utcnow()
                    }},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )

    except Exception as e:
        print(f"Database error storing GAD-7 screening: {e}")
        # Continue execution - don't fail if database storage fails
    
    return screening_result

@router.get("/history", response_model=List[ScreeningResult])
async def get_screening_history(
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    user_id: Optional[str] = Header(None, alias="X-User-ID"),
    limit: int = 10,
    db = Depends(get_database)
):
    """Get screening history for a session or for a user (if X-User-ID provided)"""

    # Prefer user_id when provided so logged-in users can retrieve their history across devices
    if not user_id and not session_id:
        raise HTTPException(
            status_code=400,
            detail="Session ID or User ID required to retrieve screening history"
        )

    try:
        # Build query based on available identifier
        query = {}
        if user_id:
            query["user_id"] = user_id
        else:
            query["session_id"] = session_id

        cursor = db.screenings.find(query).sort("created_at", -1).limit(limit)

        screenings = []
        async for screening_doc in cursor:
            screening_doc.pop("_id", None)  # Remove MongoDB _id
            screenings.append(ScreeningResult(**screening_doc))

        return screenings

    except Exception as e:
        print(f"Database error retrieving screening history: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving screening history"
        )

@router.get("/latest", response_model=Optional[ScreeningResult])
async def get_latest_screening(
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    user_id: Optional[str] = Header(None, alias="X-User-ID"),
    screening_type: Optional[str] = None,
    db = Depends(get_database)
):
    """Get the latest screening result for a session or for a user (if X-User-ID provided)"""

    if not user_id and not session_id:
        raise HTTPException(
            status_code=400,
            detail="Session ID or User ID required to retrieve latest screening"
        )

    try:
        # Build query
        query = {}
        if user_id:
            query["user_id"] = user_id
        else:
            query["session_id"] = session_id

        if screening_type:
            if screening_type not in ["phq9", "gad7"]:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid screening type. Must be 'phq9' or 'gad7'"
                )
            query["screening_type"] = screening_type

        # Get latest screening
        screening_doc = await db.screenings.find_one(
            query,
            sort=[("created_at", -1)]
        )

        if not screening_doc:
            return None

        screening_doc.pop("_id", None)  # Remove MongoDB _id
        return ScreeningResult(**screening_doc)

    except Exception as e:
        print(f"Database error retrieving latest screening: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving latest screening"
        )