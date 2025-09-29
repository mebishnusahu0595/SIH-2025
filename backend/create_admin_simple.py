#!/usr/bin/env python3
"""
Simple admin creator with proper DB initialization
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    """Create admin user in MongoDB Atlas"""
    
    # Database connection
    mongodb_url = os.getenv("MONGODB_URL", "mongodb+srv://sih-project:mebishnusahu0595@cluster0.fzo0qav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    database_name = os.getenv("DATABASE_NAME", "mindsupport")
    
    print(f"🔗 Connecting to MongoDB Atlas...")
    print(f"📊 Database: {database_name}")
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(mongodb_url)
        db = client[database_name]
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
        
        # Admin credentials
        admin_email = "admin@mindsupport.com"
        admin_password = "admin123"
        
        # Check if admin already exists
        existing_admin = await db.users.find_one({"email": admin_email})
        if existing_admin:
            print(f"✅ Admin user already exists!")
            print(f"📧 Email: {admin_email}")
            print(f"🔑 Password: {admin_password}")
            print(f"👤 Role: {existing_admin.get('role', 'unknown')}")
            return
        
        # Hash password
        hashed_password = pwd_context.hash(admin_password)
        
        # Create admin user
        admin_user = {
            "email": admin_email,
            "password": hashed_password,
            "full_name": "System Administrator",
            "role": "admin",
            "is_verified": True,
            "created_at": datetime.utcnow()
        }
        
        # Insert admin user
        result = await db.users.insert_one(admin_user)
        
        print(f"🎉 Admin user created successfully!")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: {admin_password}")
        print(f"🆔 User ID: {result.inserted_id}")
        print(f"🗄️  Database: {database_name}")
        
        print(f"\n✅ You can now login at:")
        print(f"🌐 http://localhost:3000/admin-login")
        
        # Close connection
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
        
    return True

if __name__ == "__main__":
    asyncio.run(create_admin())