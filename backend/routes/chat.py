from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List
from datetime import datetime
import uuid

from database import get_database
from models.schemas import ChatMessage, ChatCreate, ChatResponse
from services.openai_service import GeminiService
from services.crisis_detection import CrisisDetectionService
from services.rate_limit import rate_limit_service

router = APIRouter(tags=["chat"])

# Initialize services
gemini_service = GeminiService()
crisis_service = CrisisDetectionService()

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    chat_data: ChatCreate,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    db = Depends(get_database)
):
    """Send a chat message and get AI response"""
    
    print(f"🔍 Chat Debug: Received message: '{chat_data.message}' from session: {session_id}")
    
    # Rate limiting
    rate_limit = await rate_limit_service.check_rate_limit(
        user_id=session_id or "anonymous",
        endpoint="chat"
    )
    
    if not rate_limit['allowed']:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later.",
            headers=rate_limit_service.get_rate_limit_headers(rate_limit)
        )
    
    # Create user message
    user_message = ChatMessage(
        id=str(uuid.uuid4()),
        session_id=session_id,
        role="user",
        content=chat_data.message,
        timestamp=datetime.utcnow()
    )
    
    try:
        # Store user message
        await db.chat_messages.insert_one(user_message.dict())
        
        # Get conversation history
        cursor = db.chat_messages.find(
            {"session_id": session_id} if session_id else {}
        ).sort("timestamp", 1).limit(20)  # Last 20 messages
        
        messages = []
        async for msg_doc in cursor:
            msg_doc.pop("_id", None)
            messages.append(ChatMessage(**msg_doc))
        
        # Detect crisis in user message and conversation
        crisis_analysis = crisis_service.analyze_message(chat_data.message)
        conversation_analysis = crisis_service.analyze_conversation(messages)
        
        # Use the higher risk assessment
        crisis_detected = crisis_analysis['crisis_detected'] or conversation_analysis['crisis_detected']
        
        # Generate AI response
        try:
            ai_response_content = gemini_service.generate_response(
                messages=messages,
                crisis_detected=crisis_detected
            )
        except Exception as e:
            print(f"Gemini service error: {e}")
            # Fallback response
            if crisis_detected:
                ai_response_content = """I'm concerned about what you've shared. You don't have to go through this alone. 
                Please reach out for immediate support:
                • Call 988 (Suicide & Crisis Lifeline)
                • Text HOME to 741741 (Crisis Text Line)
                • Call 911 if you're in immediate danger
                
                Professional counselors are available 24/7 and want to help."""
            else:
                ai_response_content = "Thank you for sharing with me. I'm here to listen and support you. How are you feeling today?"
        
        # Create AI message
        ai_message = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=session_id,
            role="assistant",
            content=ai_response_content,
            timestamp=datetime.utcnow()
        )
        
        # Store AI message
        await db.chat_messages.insert_one(ai_message.dict())
        
        # Update session with chat activity
        if session_id:
            update_data = {
                "$inc": {"message_count": 2},  # User + AI message
                "$set": {
                    "last_activity": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
            
            # Add crisis alert if detected
            if crisis_detected:
                update_data["$push"] = {
                    "crisis_alerts": {
                        "timestamp": datetime.utcnow(),
                        "risk_level": crisis_analysis['risk_level'],
                        "confidence": crisis_analysis['confidence'],
                        "triggers": crisis_analysis['triggers']
                    }
                }
            
            await db.sessions.update_one(
                {"session_id": session_id},
                update_data
            )
        
        # Prepare crisis resources if needed
        crisis_resources = None
        if crisis_detected:
            crisis_resources = crisis_service.get_crisis_resources()
        
        return ChatResponse(
            user_message=user_message,
            ai_message=ai_message,
            crisis_detected=crisis_detected,
            crisis_resources=crisis_resources,
            conversation_id=session_id
        )
    
    except Exception as e:
        print(f"Database error in chat: {e}")
        # Return response even if database fails
        return ChatResponse(
            user_message=user_message,
            ai_message=ChatMessage(
                id=str(uuid.uuid4()),
                session_id=session_id,
                role="assistant",
                content="I'm here to listen and support you. If you're experiencing a crisis, please reach out to 988 or your local emergency services immediately.",
                timestamp=datetime.utcnow()
            ),
            crisis_detected=False,
            crisis_resources=None,
            conversation_id=session_id
        )

@router.get("/history", response_model=List[ChatMessage])
async def get_chat_history(
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    limit: int = 50,
    skip: int = 0,
    db = Depends(get_database)
):
    """Get chat history for a session"""
    
    if not session_id:
        raise HTTPException(
            status_code=400,
            detail="Session ID required to retrieve chat history"
        )
    
    try:
        cursor = db.chat_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).skip(skip).limit(limit)
        
        messages = []
        async for msg_doc in cursor:
            msg_doc.pop("_id", None)  # Remove MongoDB _id
            messages.append(ChatMessage(**msg_doc))
        
        return messages
    
    except Exception as e:
        print(f"Database error retrieving chat history: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving chat history"
        )

@router.delete("/history")
async def clear_chat_history(
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    db = Depends(get_database)
):
    """Clear chat history for a session"""
    
    if not session_id:
        raise HTTPException(
            status_code=400,
            detail="Session ID required to clear chat history"
        )
    
    try:
        result = await db.chat_messages.delete_many({"session_id": session_id})
        
        # Update session message count
        await db.sessions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "message_count": 0,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": f"Deleted {result.deleted_count} messages"}
    
    except Exception as e:
        print(f"Database error clearing chat history: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error clearing chat history"
        )