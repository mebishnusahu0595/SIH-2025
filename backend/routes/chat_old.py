from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import openai
import os
from datetime import datetime

from models.schemas import ChatRequest, ChatResponse, ChatMessage, ChatHistory
from database import Collections
from services.crisis_detection import CrisisDetector
from services.openai_service import OpenAIService

router = APIRouter()
crisis_detector = CrisisDetector()
openai_service = OpenAIService()

@router.post("/", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    background_tasks: BackgroundTasks
):
    """Send a message to the AI chatbot"""
    try:
        # Validate session exists
        sessions_collection = await Collections.sessions()
        session = await sessions_collection.find_one({"session_id": chat_request.session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Check for crisis content
        crisis_result = await crisis_detector.analyze_message(chat_request.message)
        
        # Create user message
        user_message = ChatMessage(
            role="user",
            content=chat_request.message,
            crisis_detected=crisis_result["is_crisis"],
            crisis_confidence=crisis_result.get("confidence")
        )
        
        # Get or create chat history
        chat_collection = await Collections.chat_history()
        chat_history = await chat_collection.find_one({"session_id": chat_request.session_id})
        
        if not chat_history:
            chat_history = ChatHistory(session_id=chat_request.session_id, messages=[])
        else:
            chat_history = ChatHistory(**chat_history)
        
        # Add user message to history
        chat_history.messages.append(user_message)
        
        # Generate AI response
        ai_response = await openai_service.generate_response(
            chat_history.messages,
            crisis_detected=crisis_result["is_crisis"]
        )
        
        # Create assistant message
        assistant_message = ChatMessage(
            role="assistant",
            content=ai_response
        )
        
        # Add assistant message to history
        chat_history.messages.append(assistant_message)
        chat_history.updated_at = datetime.utcnow()
        
        # Save chat history
        await chat_collection.replace_one(
            {"session_id": chat_request.session_id},
            chat_history.dict(by_alias=True, exclude={"id"}),
            upsert=True
        )
        
        # Handle crisis if detected
        crisis_resources = None
        if crisis_result["is_crisis"]:
            # Log crisis event
            background_tasks.add_task(
                log_crisis_event,
                chat_request.session_id,
                chat_request.message,
                crisis_result
            )
            
            # Add crisis flag to session
            await sessions_collection.update_one(
                {"session_id": chat_request.session_id},
                {"$push": {"crisis_flags": datetime.utcnow()}}
            )
            
            crisis_resources = {
                "hotlines": {
                    "us_crisis_lifeline": "988",
                    "crisis_text_line": "741741",
                    "emergency": "911"
                },
                "message": "If you're having thoughts of self-harm, please reach out for help immediately."
            }
        
        return ChatResponse(
            message=ai_response,
            crisis_detected=crisis_result["is_crisis"],
            crisis_resources=crisis_resources,
            session_id=chat_request.session_id,
            timestamp=datetime.utcnow()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")

@router.get("/{session_id}/history", response_model=List[ChatMessage])
async def get_chat_history(session_id: str, limit: int = 50):
    """Get chat history for a session"""
    try:
        chat_collection = await Collections.chat_history()
        chat_history = await chat_collection.find_one({"session_id": session_id})
        
        if not chat_history:
            return []
        
        messages = chat_history.get("messages", [])
        # Return last 'limit' messages
        return [ChatMessage(**msg) for msg in messages[-limit:]]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chat history: {str(e)}")

@router.delete("/{session_id}/history")
async def clear_chat_history(session_id: str):
    """Clear chat history for a session"""
    try:
        chat_collection = await Collections.chat_history()
        result = await chat_collection.delete_one({"session_id": session_id})
        
        return {"message": f"Chat history cleared for session {session_id}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear chat history: {str(e)}")

async def log_crisis_event(session_id: str, message: str, crisis_result: dict):
    """Background task to log crisis events"""
    try:
        from models.schemas import CrisisEvent
        
        crisis_event = CrisisEvent(
            session_id=session_id,
            message_content=message,
            confidence_score=crisis_result.get("confidence", 0),
            keywords_detected=crisis_result.get("keywords", []),
            action_taken="Crisis resources provided"
        )
        
        crisis_collection = await Collections.crisis_events()
        await crisis_collection.insert_one(crisis_event.dict(by_alias=True, exclude={"id"}))
        
    except Exception as e:
        print(f"Failed to log crisis event: {e}")