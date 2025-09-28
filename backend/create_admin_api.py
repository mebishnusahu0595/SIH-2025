#!/usr/bin/env python3
"""
Simple script to create admin via API
"""
import requests
import json

def create_admin_via_api():
    """Create admin user via API"""
    
    # Admin user data
    admin_data = {
        "full_name": "System Administrator",
        "email": "admin@mindsupport.com",
        "password": "admin123"
    }
    
    try:
        # First try to register as regular user, then we'll manually update the role
        response = requests.post(
            "http://localhost:8000/api/auth/register",
            json=admin_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Admin user registered successfully!")
            print(f"📧 Email: {admin_data['email']}")
            print(f"🔑 Password: {admin_data['password']}")
            
            # Now we need to manually update the role in database
            print("\n⚠️  Note: You need to manually update the role to 'admin' in the database")
            print("   Or use the MongoDB shell to update the user role.")
            
        elif response.status_code == 400:
            print("✅ Admin user may already exist!")
            print(f"📧 Email: {admin_data['email']}")
            print(f"🔑 Password: {admin_data['password']}")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API server")
        print("Make sure the backend server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Creating admin user via API...")
    create_admin_via_api()
    
    print("\n" + "="*60)
    print("🎉 ADMIN LOGIN CREDENTIALS")
    print("="*60)
    print("🌐 Admin Login URL: http://localhost:3000/admin-login")
    print("📧 Email: admin@mindsupport.com")
    print("🔑 Password: admin123")
    print("="*60)
    print("\n⚠️  IMPORTANT NEXT STEPS:")
    print("1. If this is a new user, manually set role to 'admin' in database")
    print("2. The user should be able to login at the admin-login page")
    print("3. Change the password after first successful login")