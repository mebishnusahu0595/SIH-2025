from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_database
from services.auth_service import auth_service
from datetime import datetime, timezone
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["admin"])

async def get_current_admin_user(
    user_id: str = Header(None, alias="X-User-ID"),
    db = Depends(get_database)
) -> dict:
    """Get current authenticated admin user by user ID from header"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID required"
        )

    try:
        user = await auth_service.get_user_by_id(db, user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        # Check if user is admin
        if user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@router.get("/stats")
async def get_admin_stats(
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Get administrative statistics"""
    try:
        # Count total users by role
        total_users = await db.users.count_documents({})
        total_doctors = await db.counselors.count_documents({})
        
        # Count pending doctor applications
        pending_doctors = await db.doctor_applications.count_documents({"status": "pending"})
        
        # Count chat sessions (placeholder - implement when chat system is ready)
        total_chats = await db.chat_messages.count_documents({}) if "chat_messages" in await db.list_collection_names() else 0
        
        # Count crisis flags (placeholder)
        crisis_flags = await db.sessions.count_documents({"crisis_alerts": {"$exists": True, "$ne": []}}) if "sessions" in await db.list_collection_names() else 0
        
        # Calculate average mood (placeholder)
        avg_mood = 3.2  # implement when mood tracking is ready
        
        # Count screenings completed (placeholder)
        screenings_completed = await db.screenings.count_documents({}) if "screenings" in await db.list_collection_names() else 0
        
        return {
            "totalUsers": total_users,
            "totalDoctors": total_doctors,
            "pendingDoctors": pending_doctors,
            "totalChats": total_chats,
            "crisisFlags": crisis_flags,
            "avgMood": avg_mood,
            "screeningsCompleted": screenings_completed
        }
        
    except Exception as e:
        logger.error(f"Error fetching admin stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch statistics"
        )

@router.get("/doctor-applications")
async def get_doctor_applications(
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Get all doctor applications"""
    try:
        applications = []
        cursor = db.doctor_applications.find({}).sort("applied_at", -1)
        
        async for app in cursor:
            app["_id"] = str(app["_id"])
            applications.append(app)
            
        return applications
        
    except Exception as e:
        logger.error(f"Error fetching doctor applications: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch doctor applications"
        )

@router.post("/doctor-applications/{application_id}/approve")
async def approve_doctor_application(
    application_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Approve a doctor application"""
    try:
        # Get the application by ID (handle ObjectId conversion)
        try:
            from bson import ObjectId as BSONObjectId
            if BSONObjectId.is_valid(application_id):
                query_id = BSONObjectId(application_id)
            else:
                query_id = application_id
        except (ImportError, Exception):
            query_id = application_id
            
        application = await db.doctor_applications.find_one({"_id": query_id})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Update application status
        await db.doctor_applications.update_one(
            {"_id": query_id},
            {
                "$set": {
                    "status": "approved",
                    "approved_at": datetime.now(timezone.utc),
                    "approved_by": str(current_user.get("id", current_user.get("_id")))
                }
            }
        )
        
        # Create doctor user account
        doctor_user = {
            "email": application["email"],
            "full_name": application["full_name"],
            "password": auth_service.hash_password(application["password"]),
            "role": "doctor",
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.now(timezone.utc),
            "doctor_profile": {
                "specializations": application.get("specializations", []),
                "qualifications": application.get("qualifications", []),
                "experience_years": application.get("experience_years"),
                "license_number": application.get("license_number"),
                "consultation_fee": application.get("consultation_fee"),
                "bio": application.get("bio", ""),
                "phone": application.get("phone", "")
            }
        }
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": application["email"]})
        if not existing_user:
            existing_counselor = await db.counselors.find_one({"email": application["email"]})
            if not existing_counselor:
                await db.counselors.insert_one(doctor_user)
            else:
                # Update existing counselor
                await db.counselors.update_one(
                    {"email": application["email"]},
                    {"$set": doctor_user}
                )
        else:
            # If exists in users, update to counselor
            await db.counselors.insert_one(doctor_user)
        
        return {"message": "Doctor application approved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving doctor application: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve application"
        )

@router.post("/doctor-applications/{application_id}/reject")
async def reject_doctor_application(
    application_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Reject a doctor application"""
    try:
        # Handle ObjectId conversion for reject endpoint
        try:
            from bson import ObjectId as BSONObjectId
            if BSONObjectId.is_valid(application_id):
                query_id = BSONObjectId(application_id)
            else:
                query_id = application_id
        except (ImportError, Exception):
            query_id = application_id
            
        # Update application status
        result = await db.doctor_applications.update_one(
            {"_id": query_id},
            {
                "$set": {
                    "status": "rejected",
                    "rejected_at": datetime.now(timezone.utc),
                    "rejected_by": str(current_user.get("id", current_user.get("_id")))
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return {"message": "Doctor application rejected"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting doctor application: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject application"
        )

@router.get("/users")
async def get_all_users(
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Get all system users"""
    try:
        users = []
        cursor = db.users.find({}, {"password": 0}).sort("created_at", -1)
        
        async for user in cursor:
            user["_id"] = str(user["_id"])
            users.append(user)
            
        return users
        
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )

# Doctor CRUD Operations

@router.get("/doctors")
async def get_all_doctors(
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Get all approved doctors"""
    try:
        doctors = []
        cursor = db.counselors.find({}, {"password": 0}).sort("created_at", -1)
        
        async for doctor in cursor:
            doctor["_id"] = str(doctor["_id"])
            doctors.append(doctor)
            
        return doctors
        
    except Exception as e:
        logger.error(f"Error fetching doctors: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch doctors"
        )

@router.post("/doctors")
async def create_doctor(
    doctor_data: dict,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Create a new doctor directly (admin only)"""
    try:
        # Check if email already exists
        existing_user = await db.users.find_one({"email": doctor_data["email"]})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        
        # Check if medical license already exists
        existing_license = await db.doctor_applications.find_one({
            "medical_license": doctor_data["medical_license"]
        })
        if existing_license:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Medical license already exists"
            )
        
        # Create doctor application with approved status
        doctor_application = {
            **doctor_data,
            "status": "approved",
            "applied_at": datetime.utcnow().isoformat()
        }
        
        result = await db.doctor_applications.insert_one(doctor_application)
        
        # Also create a user account for the doctor
        user_data = {
            "full_name": doctor_data["full_name"],
            "email": doctor_data["email"],
            "password": "temp_password_123",  # Temporary password
            "role": "doctor",
            "is_verified": True,
            "created_at": datetime.utcnow()
        }
        
        # Hash the temporary password
        user_data["password"] = auth_service.hash_password(user_data["password"])
        await db.users.insert_one(user_data)
        
        return {
            "message": "Doctor created successfully",
            "doctor_id": str(result.inserted_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating doctor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create doctor"
        )

@router.put("/doctors/{doctor_id}")
async def update_doctor(
    doctor_id: str,
    doctor_data: dict,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Update doctor information"""
    try:
        # Check if doctor exists
        existing_doctor = await db.doctor_applications.find_one({"_id": ObjectId(doctor_id)})
        if not existing_doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )
        
        # Check if email is being changed and if new email exists
        if doctor_data["email"] != existing_doctor["email"]:
            existing_email = await db.users.find_one({"email": doctor_data["email"]})
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )
        
        # Update doctor application
        await db.doctor_applications.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$set": doctor_data}
        )
        
        # Update corresponding user account if exists
        await db.users.update_one(
            {"email": existing_doctor["email"]},
            {"$set": {
                "full_name": doctor_data["full_name"],
                "email": doctor_data["email"]
            }}
        )
        
        return {"message": "Doctor updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating doctor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update doctor"
        )

@router.delete("/doctors/{doctor_id}")
async def delete_doctor(
    doctor_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Delete doctor and associated user account"""
    try:
        # Get doctor details before deletion
        doctor = await db.doctor_applications.find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )
        
        # Delete doctor application
        await db.doctor_applications.delete_one({"_id": ObjectId(doctor_id)})
        
        # Delete corresponding user account
        await db.users.delete_one({"email": doctor["email"]})
        
        return {"message": "Doctor deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting doctor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete doctor"
        )

@router.delete("/doctor-applications/{application_id}")
async def delete_doctor_application(
    application_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Delete a doctor application (only if not approved)"""
    try:
        # Get the application by ID
        try:
            from bson import ObjectId as BSONObjectId
            if BSONObjectId.is_valid(application_id):
                query_id = BSONObjectId(application_id)
            else:
                query_id = application_id
        except (ImportError, Exception):
            query_id = application_id
            
        application = await db.doctor_applications.find_one({"_id": query_id})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Delete the application
        await db.doctor_applications.delete_one({"_id": query_id})
        
        return {"message": "Doctor application deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting doctor application: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete application"
        )