#!/usr/bin/env python3

# Test script to verify Gemini integration
try:
    from services.openai_service import GeminiService
    print("✅ GeminiService imported successfully!")
    
    # Test service initialization
    service = GeminiService()
    print(f"✅ GeminiService initialized. Enabled: {service.enabled}")
    
    if not service.enabled:
        print("ℹ️  Gemini API key not configured - using fallback responses")
    else:
        print("✅ Gemini API key configured and ready!")
        
except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")