#!/usr/bin/env python3
"""
Script to create an admin user in the MindSupport database
"""

import asyncio
from datetime import datetime
from database import get_database
from services.auth_service import auth_service

async def create_admin_user():
    """Create an admin user in the database"""
    
    try:
        db = await get_database()
        
        # Admin user details
        admin_email = "admin@mindsupport.com"
        admin_password = "admin123"  # Change this to a secure password
        admin_name = "System Administrator"
        
        # Check if admin already exists
        existing_admin = await db.users.find_one({"email": admin_email})
        if existing_admin:
            print(f"✅ Admin user with email {admin_email} already exists!")
            print(f"📧 Email: {admin_email}")
            print(f"🔑 Password: {admin_password}")
            print(f"🎭 Role: {existing_admin.get('role', 'unknown')}")
            return admin_email
        
        # Create admin user document using auth_service
        admin_user = {
            "email": admin_email,
            "password": auth_service.hash_password(admin_password),  # Use 'password' not 'password_hash'
            "full_name": admin_name,
            "role": "admin",
            "is_verified": True,
            "created_at": datetime.utcnow()
        }
        
        # Insert admin user
        result = await db.users.insert_one(admin_user)
        print(f"✅ Admin user created successfully!")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: {admin_password}")
        print(f"📋 User ID: {result.inserted_id}")
        print(f"\n⚠️  IMPORTANT: Please change the password after first login!")
        
        return admin_email
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return None

if __name__ == "__main__":
    asyncio.run(create_admin_user())