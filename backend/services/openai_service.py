import google.generativeai as genai
import os
from typing import List, Dict, Any
from models.schemas import ChatMessage
from dotenv import load_dotenv

class GeminiService:
    def __init__(self):
        # Ensure .env is loaded
        load_dotenv()
        
        api_key = os.getenv("GEMINI_API_KEY")
        print(f"🔍 Debug: API key from env: {api_key[:10]}..." if api_key else "🔍 Debug: No API key found")
        
        if api_key and api_key.startswith("AIzaSy") and len(api_key) > 30:
            genai.configure(api_key=api_key)
            self.enabled = True
            print(f"✅ Gemini API configured successfully with model: {os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')}")
        else:
            self.enabled = False
            print("⚠️  Gemini API key not configured properly. Using fallback responses.")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        print(f"🔍 Debug: Using model: {self.model_name}")
        self.system_prompt = self._get_system_prompt()
    
    def _get_system_prompt(self) -> str:
        return """You are a supportive mental health companion. Your role is to:

1. Provide empathetic, non-judgmental support
2. Offer evidence-based coping strategies
3. Encourage professional help when appropriate
4. NEVER provide medical diagnosis or treatment advice
5. Always include crisis resources if someone expresses suicidal thoughts

Guidelines:
- Be warm, understanding, and validating
- Ask open-ended questions to encourage sharing
- Suggest grounding techniques, breathing exercises, or mindfulness when helpful
- Keep responses concise but meaningful (under 200 words)
- If someone mentions self-harm or suicide, express concern and provide crisis resources
- Encourage professional help for persistent or severe symptoms

Remember: You are not a replacement for professional mental health care."""

    def generate_response(
        self, 
        messages: List[ChatMessage], 
        crisis_detected: bool = False
    ) -> str:
        """Generate AI response using Gemini"""
        
        # If Gemini is not enabled, use fallback
        if not self.enabled:
            print("🔍 Debug: Gemini not enabled, using fallback")
            return self._get_fallback_response(
                messages[-1].content if messages else "",
                crisis_detected
            )
        
        try:
            print(f"🔍 Debug: Generating response with Gemini, model: {self.model_name}")
            print(f"🔍 Debug: Number of messages in history: {len(messages)}")
            
            # Initialize the model (without system_instruction for now)
            model = genai.GenerativeModel(model_name=self.model_name)
            
            # Prepare conversation history for Gemini with system prompt included
            conversation_text = self.system_prompt + "\n\n" + self._prepare_conversation_for_gemini(messages)
            print(f"🔍 Debug: Conversation text: {conversation_text[:200]}...")
            
            # Special handling for crisis situations
            if crisis_detected:
                conversation_text += "\n\n[CRISIS DETECTED - Please provide immediate support and crisis resources]"
                print("🔍 Debug: Crisis detected, adding crisis prompt")
            
            # Generate response
            response = model.generate_content(
                conversation_text,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=300,
                    temperature=0.7,
                    top_p=0.9,
                    top_k=40,
                )
            )
            
            print(f"🔍 Debug: Gemini response received: {response.text[:100]}...")
            return response.text.strip()
            
        except Exception as e:
            print(f"❌ Gemini service error: {type(e).__name__}: {e}")
            print(f"🔍 Debug: Falling back to manual response")
            return self._get_fallback_response(
                messages[-1].content if messages else "",
                crisis_detected
            )

    def _prepare_conversation_for_gemini(self, messages: List[ChatMessage]) -> str:
        """Convert message history to text format for Gemini"""
        # Get recent conversation history (last 10 messages to manage token limits)
        recent_messages = messages[-10:] if len(messages) > 10 else messages
        
        conversation_parts = []
        for msg in recent_messages:
            if msg.role == "user":
                conversation_parts.append(f"User: {msg.content}")
            elif msg.role == "assistant":
                conversation_parts.append(f"Assistant: {msg.content}")
        
        return "\n".join(conversation_parts)

    def _get_fallback_response(self, user_message: str, crisis_detected: bool) -> str:
        """Provide fallback responses when Gemini is unavailable"""
        
        if crisis_detected:
            return """I'm concerned about what you've shared. You don't have to go through this alone. 
            Please reach out for immediate support:
            • Call 988 (Suicide & Crisis Lifeline)
            • Text HOME to 741741 (Crisis Text Line)
            • Call 911 if you're in immediate danger
            
            Professional counselors are available 24/7 and want to help."""
        
        # Simple keyword-based responses
        user_lower = user_message.lower()
        
        if any(word in user_lower for word in ['anxious', 'anxiety', 'worried', 'nervous']):
            return """I hear that you're feeling anxious. Anxiety is very common and manageable. 
            Try this grounding technique: Name 5 things you can see, 4 things you can touch, 
            3 things you can hear, 2 things you can smell, and 1 thing you can taste. 
            Would you like to tell me more about what's causing your anxiety?"""
            
        elif any(word in user_lower for word in ['sad', 'depressed', 'down', 'hopeless']):
            return """I'm sorry you're feeling this way. Your feelings are valid, and it's okay to not be okay sometimes. 
            Depression can make everything feel harder, but with support and time, things can improve. 
            Have you been able to talk to anyone about how you're feeling?"""
            
        elif any(word in user_lower for word in ['stressed', 'overwhelmed', 'too much']):
            return """Feeling overwhelmed is really difficult. Let's try to break things down into smaller pieces. 
            What feels most urgent or important right now? Sometimes focusing on just one thing at a time 
            can help make everything feel more manageable."""
            
        else:
            return """I'm here to listen and support you. It sounds like you're going through something difficult. 
            Would you like to share more about what's on your mind? Sometimes talking about our feelings 
            can help us process them better."""

# Backward compatibility - keep the old class name for existing imports
OpenAIService = GeminiService