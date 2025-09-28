# Authentication Routes

from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm
from typing import Optional
from datetime import datetime, timedelta, timezone
import os

from models.auth_schemas import UserCreate, UserLogin, UserResponse, DoctorRegistration, Token, UserUpdate, EmailVerification, PasswordReset, PasswordResetConfirm, ChangePassword
from services.auth_service import auth_service
from database import get_database
from datetime import timedelta

ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(tags=["Authentication"])
security = HTTPBearer()

# Dependency to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_database)
) -> dict:
    """Get current authenticated user"""
    token = credentials.credentials
    print(f"🔍 get_current_user Debug: token={token[:30]}... len={len(token)}")
    payload = auth_service.verify_token(token, "access")
    print(f"🔍 get_current_user Debug: payload={payload}")
    user_id = payload.get("user_id")
    if user_id is None:
        print("🔍 get_current_user Debug: No user_id in payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    user = await auth_service.get_user_by_id(db, user_id)
    print(f"🔍 get_current_user Debug: user={user}")
    if user is None:
        print("🔍 get_current_user Debug: User not found in DB")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

# Optional authentication - doesn't raise error if no token
async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db = Depends(get_database)
) -> Optional[dict]:
    """Get current user if authenticated, None otherwise"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    try:
        token = authorization.split(" ")[1]
        payload = auth_service.verify_token(token, "access")
        user_id = payload.get("user_id")
        
        if user_id:
            user = await auth_service.get_user_by_id(db, user_id)
            return user
    except:
        pass
    
    return None

@router.post("/register", response_model=dict)
async def register_user(
    user_data: UserCreate,
    db = Depends(get_database)
):
    """Register new user"""
    try:
        if user_data.role == "doctor":
            # Check if email already exists in doctor applications
            existing_application = await db.doctor_applications.find_one({"email": user_data.email})
            if existing_application:
                raise HTTPException(status_code=400, detail="Doctor application already submitted for this email")
            # Create doctor application with all doctor-specific fields
            doctor_application = {
                "full_name": user_data.full_name,
                "email": user_data.email,
                "phone": user_data.phone or "",
                "password": user_data.password,
                "specializations": user_data.specializations,
                "qualifications": user_data.qualifications,
                "experience_years": user_data.experience_years,
                "license_number": user_data.license_number,
                "consultation_fee": user_data.consultation_fee,
                "bio": user_data.bio,
                "status": "pending",
                "submitted_at": datetime.now(timezone.utc)
            }
            await db.doctor_applications.insert_one(doctor_application)
            return {"message": "Doctor registration application submitted successfully. You will be notified once approved."}
        else:
            # Check if email already exists
            existing_user = await db.users.find_one({"email": user_data.email})
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            # Create patient user
            user_dict = user_data.dict()
            created_user = await auth_service.create_user(db, user_dict)
            return created_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/register/doctor", response_model=dict)
async def register_doctor(user_data: DoctorRegistration, db = Depends(get_database)):
    return await register_user(user_data, db)


@router.post("/login", response_model=UserResponse)
async def simple_login(login_data: UserLogin, db = Depends(get_database)):
    user = await auth_service.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    # Return user info directly, no token
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        phone=user.get("phone"),
        role=user["role"],
        is_verified=user.get("is_verified", False),
        is_active=user.get("is_active", True),
        date_of_birth=user.get("date_of_birth"),
        gender=user.get("gender"),
        created_at=user["created_at"],
        last_login=user.get("last_login"),
        profile_picture=user.get("profile_picture")
    )



@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_data: dict,
    db = Depends(get_database)
):
    """Refresh access token using refresh token"""
    try:
        refresh_token = refresh_data.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token required"
            )
        
        payload = auth_service.verify_token(refresh_token, "refresh")
        user_id = payload.get("user_id")
        
        user = await auth_service.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new tokens
        token_data = {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"]
        }
        
        access_token = auth_service.create_access_token(token_data)
        new_refresh_token = auth_service.create_refresh_token(token_data)
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=1800
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """Get current user information"""
    user_response = UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        phone=current_user.get("phone"),
        role=current_user["role"],
        is_verified=current_user.get("is_verified", False),
        is_active=current_user.get("is_active", True),
        date_of_birth=current_user.get("date_of_birth"),
        gender=current_user.get("gender"),
        created_at=current_user["created_at"],
        last_login=current_user.get("last_login"),
        profile_picture=current_user.get("profile_picture")
    )
    return user_response

@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update user profile"""
    try:
        from bson import ObjectId
        from datetime import datetime
        
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        
        await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": update_dict}
        )
        
        # Get updated user
        updated_user = await auth_service.get_user_by_id(db, str(current_user["_id"]))
        
        return UserResponse(
            id=str(updated_user["_id"]),
            email=updated_user["email"],
            full_name=updated_user["full_name"],
            phone=updated_user.get("phone"),
            role=updated_user["role"],
            is_verified=updated_user.get("is_verified", False),
            is_active=updated_user.get("is_active", True),
            date_of_birth=updated_user.get("date_of_birth"),
            gender=updated_user.get("gender"),
            created_at=updated_user["created_at"],
            last_login=updated_user.get("last_login"),
            profile_picture=updated_user.get("profile_picture")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )

@router.post("/verify-email")
async def verify_email(
    verification: EmailVerification,
    db = Depends(get_database)
):
    """Verify email address"""
    success = await auth_service.verify_email(db, verification.token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    return {"message": "Email verified successfully"}

@router.post("/password-reset")
async def request_password_reset(
    reset_data: PasswordReset,
    db = Depends(get_database)
):
    """Request password reset"""
    success = await auth_service.create_password_reset_token(db, reset_data.email)
    
    # Always return success for security (don't reveal if email exists)
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/password-reset/confirm")
async def confirm_password_reset(
    reset_data: PasswordResetConfirm,
    db = Depends(get_database)
):
    """Confirm password reset with token"""
    success = await auth_service.reset_password(
        db, reset_data.token, reset_data.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return {"message": "Password reset successfully"}

@router.post("/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Change password for authenticated user"""
    try:
        from bson import ObjectId
        from datetime import datetime
        
        # Verify current password
        if not auth_service.verify_password(password_data.current_password, current_user["password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        new_password_hash = auth_service.hash_password(password_data.new_password)
        
        # Update password
        await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": {
                "password": new_password_hash,
                "updated_at": datetime.utcnow()
            }}
        )
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )

@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user)
):
    """Logout user (client should discard tokens)"""
    return {"message": "Logged out successfully"}