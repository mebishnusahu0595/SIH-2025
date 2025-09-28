import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def create_sample_doctor_application():
    """Create a sample doctor application for testing admin approval"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.mindsupport
    
    print("Creating sample doctor application...")
    
    # Sample doctor application
    doctor_application = {
        "full_name": "Dr. Sarah Johnson",
        "email": "sarah.johnson@medical.com",
        "phone": "+1-555-0123",
        "medical_license": "MD123456789",
        "specialization": ["Psychiatry", "Cognitive Behavioral Therapy"],
        "qualification": "MD - Psychiatry, Harvard Medical School",
        "experience_years": 8,
        "hospital_affiliation": "City General Hospital",
        "consultation_fee": 150,
        "bio": "Dr. Sarah Johnson is a board-certified psychiatrist with over 8 years of experience in treating anxiety, depression, and trauma-related disorders. She specializes in cognitive behavioral therapy and has helped hundreds of patients achieve better mental health.",
        "status": "pending",
        "applied_at": datetime.utcnow()
    }
    
    # Check if application already exists
    existing = await db.doctor_applications.find_one({"email": doctor_application["email"]})
    if existing:
        print(f"⚠️  Doctor application already exists for {doctor_application['email']}")
        print(f"📋 Application ID: {existing['_id']}")
        return
    
    # Insert the application
    result = await db.doctor_applications.insert_one(doctor_application)
    
    print("✅ Sample doctor application created successfully!")
    print(f"📧 Email: {doctor_application['email']}")
    print(f"👨‍⚕️ Name: {doctor_application['full_name']}")
    print(f"🏥 Specialization: {', '.join(doctor_application['specialization'])}")
    print(f"📋 Application ID: {result.inserted_id}")
    print(f"📅 Applied at: {doctor_application['applied_at']}")
    
    # Close connection
    await client.close()

if __name__ == "__main__":
    asyncio.run(create_sample_doctor_application())
    