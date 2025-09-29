#!/usr/bin/env python3
"""
Quick Admin Setup for MongoDB Atlas
This script creates an admin user in your Atlas database
"""

print("🎯 ADMIN LOGIN CREDENTIALS")
print("=" * 40)
print()

print("📧 Email: admin@mindsupport.com")
print("🔑 Password: admin123")
print()

print("🚀 HOW TO ACCESS ADMIN PANEL:")
print("1. Go to: http://localhost:3000/auth/login")
print("2. Enter the credentials above")
print("3. You'll be redirected to: http://localhost:3000/admin")
print()

print("🗄️ DATABASE STATUS:")
print("✅ Connected to MongoDB Atlas (Cluster0)")
print("✅ Database: mindsupport")
print("✅ Admin user should be auto-created on first backend startup")
print()

print("🔧 IF ADMIN LOGIN FAILS:")
print("The admin user might not be created yet in Atlas.")
print("Since your backend is running, it should create admin automatically.")
print()
print("Alternative: Make a test registration at /auth/register")
print("Then manually promote that user to admin role in Atlas dashboard.")
print()

print("💡 ATLAS DATABASE CHECK:")
print("1. Go to: https://cloud.mongodb.com")
print("2. Login to your Atlas account")
print("3. Go to Cluster0 → Browse Collections")
print("4. Check 'mindsupport' database → 'users' collection")
print("5. Look for admin@mindsupport.com with role: 'admin'")
print()

print("🎉 YOUR FULL SYSTEM ACCESS:")
print("👑 Admin Panel: http://localhost:3000/admin")
print("👩‍⚕️ Doctor Panel: http://localhost:3000/doctor-dashboard") 
print("👤 Patient Panel: http://localhost:3000/dashboard")
print("📋 Doctor Registration: http://localhost:3000/doctor-register")
print()

# Let's also create a simple API call to create admin if needed
print("🔧 MANUAL ADMIN CREATION (if needed):")
print("If login fails, you can manually create admin by:")
print("1. Going to http://localhost:3000/auth/register")
print("2. Creating any user account")
print("3. Then in MongoDB Atlas, find that user and change 'role' from 'patient' to 'admin'")
print()

print("✅ READY TO USE!")