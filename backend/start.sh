#!/bin/bash

# Mental Health Backend Startup Script

echo "🧠 Starting Mental Health & Psychological Support Backend..."

# Activate virtual environment
source venv/bin/activate

# Set environment variables
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
export ENVIRONMENT=development

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual values before running in production"
fi

# Start the FastAPI server
echo "🚀 Starting FastAPI server on http://localhost:8000"
echo "📊 API Documentation available at http://localhost:8000/docs"
echo "🩺 Health check at http://localhost:8000/health"

# Check if MongoDB is required
if grep -q "MONGODB_URL=" .env; then
    echo "🍃 Make sure MongoDB is running (local or cloud)"
fi

# Check if OpenAI key is set
if ! grep -q "^OPENAI_API_KEY=sk-" .env; then
    echo "⚠️  OpenAI API key not set. AI features will use fallback responses."
fi

echo ""
echo "Starting server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload