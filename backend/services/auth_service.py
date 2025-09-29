# Authentication Service

import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from bson import ObjectId
import os
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

class AuthService:
    def __init__(self):
        self.secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7
        self.reset_token_expire_hours = 1
        
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str, token_type: str = "access") -> Dict[str, Any]:
        """Verify JWT token"""
        try:
            print(f"🔍 verify_token Debug: secret_key={self.secret_key}, algorithm={self.algorithm}")
            print(f"🔍 verify_token Debug: token={token[:30]}... len={len(token)}")
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            print(f"🔍 verify_token Debug: payload={payload}")
            if payload.get("type") != token_type:
                print(f"🔍 verify_token Debug: Invalid token type: {payload.get('type')} != {token_type}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            return payload
        except jwt.ExpiredSignatureError:
            print("🔍 verify_token Debug: Token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except (jwt.InvalidTokenError, jwt.DecodeError, jwt.InvalidSignatureError) as e:
            print(f"🔍 verify_token Debug: Could not validate credentials: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    
    def generate_verification_token(self) -> str:
        """Generate email verification token"""
        return secrets.token_urlsafe(32)
    
    def generate_reset_token(self) -> str:
        """Generate password reset token"""
        return secrets.token_urlsafe(32)
    
    async def create_user(self, db: AsyncIOMotorDatabase, user_data: dict) -> dict:
        """Create new user in database"""
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data["email"]})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        user_data["password"] = self.hash_password(user_data["password"])
        
        # Add timestamps and verification token
        user_data.update({
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_verified": False,
            "is_active": True,
            "verification_token": self.generate_verification_token(),
            "last_login": None
        })
        
        # Insert user
        result = await db.users.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        
        # Send verification email
        await self.send_verification_email(user_data["email"], user_data["verification_token"])
        
        return user_data
    
    async def authenticate_user(self, db: AsyncIOMotorDatabase, email: str, password: str) -> Optional[dict]:
        """Authenticate user credentials"""
        user = await db.users.find_one({"email": email})
        if not user:
            user = await db.counselors.find_one({"email": email})
            if not user:
                return None
        
        # Handle both 'password' and 'password_hash' fields for backward compatibility
        stored_password = user.get("password") or user.get("password_hash")
        if not stored_password:
            return None
            
        if not self.verify_password(password, stored_password):
            return None
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )
        
        # Update last login
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        return user
    
    async def get_user_by_id(self, db: AsyncIOMotorDatabase, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        from bson import ObjectId
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            return user
        except Exception:
            return None
    
    async def send_verification_email(self, email: str, token: str):
        """Send email verification"""
        # Implementation depends on your email service
        # This is a placeholder - implement with your preferred email service
        print(f"Verification email sent to {email} with token: {token}")
        # TODO: Implement actual email sending with SMTP or service like SendGrid
    
    async def send_password_reset_email(self, email: str, token: str):
        """Send password reset email"""
        # Implementation depends on your email service
        print(f"Password reset email sent to {email} with token: {token}")
        # TODO: Implement actual email sending
    
    async def verify_email(self, db: AsyncIOMotorDatabase, token: str) -> bool:
        """Verify email with token"""
        result = await db.users.update_one(
            {"verification_token": token, "is_verified": False},
            {"$set": {"is_verified": True, "verification_token": None}}
        )
        return result.modified_count > 0
    
    async def create_password_reset_token(self, db: AsyncIOMotorDatabase, email: str) -> bool:
        """Create password reset token"""
        user = await db.users.find_one({"email": email})
        if not user:
            return False
        
        reset_token = self.generate_reset_token()
        reset_expires = datetime.utcnow() + timedelta(hours=self.reset_token_expire_hours)
        
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "reset_token": reset_token,
                "reset_expires": reset_expires
            }}
        )
        
        await self.send_password_reset_email(email, reset_token)
        return True
    
    async def reset_password(self, db: AsyncIOMotorDatabase, token: str, new_password: str) -> bool:
        """Reset password with token"""
        user = await db.users.find_one({
            "reset_token": token,
            "reset_expires": {"$gt": datetime.utcnow()}
        })
        
        if not user:
            return False
        
        hashed_password = self.hash_password(new_password)
        
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "password": hashed_password,
                "reset_token": None,
                "reset_expires": None,
                "updated_at": datetime.utcnow()
            }}
        )
        
        return True

# Global auth service instance
auth_service = AuthService()