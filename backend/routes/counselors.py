from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime
import uuid

from database import get_database
from models.schemas import Counselor, CounselorCreate

router = APIRouter(tags=["counselors"])

@router.get("", response_model=List[Counselor])
async def get_counselors(
    specialty: Optional[str] = None,
    location: Optional[str] = None,
    is_available: Optional[bool] = None,
    limit: int = Query(20, le=100),
    skip: int = 0,
    db = Depends(get_database)
):
    """Get list of verified doctors as counselors"""
    
    try:
        # Build query for doctors
        query = {"role": "doctor", "is_active": True}
        
        if specialty:
            # Handle both singular "specialization" and plural "specializations" fields
            query["$or"] = [
                {"doctor_profile.specializations": {"$in": [specialty]}},
                {"doctor_profile.specialization": {"$regex": specialty, "$options": "i"}}
            ]
        
        # Get doctors from counselors collection
        cursor = db.counselors.find(query, {"password": 0}).skip(skip).limit(limit)
        
        counselors = []
        async for doctor_doc in cursor:
            # Transform doctor data to counselor format
            # Handle both singular "specialization" and plural "specializations" fields
            specialization_str = doctor_doc.get("doctor_profile", {}).get("specialization", "")
            specializations = doctor_doc.get("doctor_profile", {}).get("specializations", [])
            
            print(f"DEBUG: doctor_doc: {doctor_doc.get('full_name')}")
            print(f"DEBUG: specialization_str: '{specialization_str}'")
            print(f"DEBUG: specializations: {specializations}")
            
            # If specializations array is empty but specialization string exists, split it
            if not specializations and specialization_str:
                specializations = [s.strip() for s in specialization_str.split(",") if s.strip()]
                print(f"DEBUG: split specializations: {specializations}")
            
            qualifications = doctor_doc.get("doctor_profile", {}).get("qualifications", [])
            bio = doctor_doc.get("doctor_profile", {}).get("bio", "Experienced mental health professional")
            
            print(f"DEBUG: final specializations: {specializations}")
            print(f"DEBUG: bio: {bio[:50]}...")
            
            # Create credentials string from qualifications
            credentials = ", ".join(qualifications) if qualifications else "Licensed Professional"
            
            # Create credentials string from qualifications
            credentials = ", ".join(qualifications) if qualifications else "Licensed Professional"
            
            counselor_data = {
                "id": str(doctor_doc["_id"]),
                "name": doctor_doc.get("full_name", ""),
                "specialties": specializations,
                "credentials": credentials,
                "bio": doctor_doc.get("doctor_profile", {}).get("bio", "Experienced mental health professional"),
                "availability": "Mon-Fri 9AM-5PM",  # Default availability
                "contactInfo": {
                    "email": doctor_doc.get("email", ""),
                    "phone": doctor_doc.get("doctor_profile", {}).get("phone", ""),
                    "website": ""
                },
                "isVerified": True,
                "rating": 4.5,  # Default rating
                "reviewCount": 0,
                "hourlyRate": doctor_doc.get("doctor_profile", {}).get("consultation_fee", 0),
                "languages": ["English"],  # Default
                "location": "Online",  # Default
                "is_available": True
            }
            counselors.append(Counselor(**counselor_data))
        
        return counselors
    
    except Exception as e:
        print(f"Database error retrieving doctors: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving counselors"
        )

@router.get("/specialties")
async def get_specialties(db = Depends(get_database)):
    """Get list of available specialties"""
    
    try:
        # Get all counselors and extract unique specialties
        cursor = db.counselors.find({"role": "doctor", "is_active": True}, {"doctor_profile": 1})
        
        specialties_set = set()
        async for doctor_doc in cursor:
            # Handle both singular "specialization" and plural "specializations" fields
            specialization_str = doctor_doc.get("doctor_profile", {}).get("specialization", "")
            specializations = doctor_doc.get("doctor_profile", {}).get("specializations", [])
            
            # If specializations array is empty but specialization string exists, split it
            if not specializations and specialization_str:
                specializations = [s.strip() for s in specialization_str.split(",") if s.strip()]
            
            if specializations:
                for spec in specializations:
                    specialties_set.add(spec.strip())
        
        specialties = sorted(list(specialties_set))
        return specialties
        
        return {"specialties": specialties}
    
    except Exception as e:
        print(f"Database error retrieving specialties: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving specialties"
        )

@router.get("/{counselor_id}", response_model=Counselor)
async def get_counselor(
    counselor_id: str,
    db = Depends(get_database)
):
    """Get specific counselor information"""
    
    try:
        counselor_doc = await db.counselors.find_one({
            "id": counselor_id,
            "is_verified": True
        })
        
        if not counselor_doc:
            raise HTTPException(
                status_code=404,
                detail="Counselor not found"
            )
        
        counselor_doc.pop("_id", None)  # Remove MongoDB _id
        # Keep contact info for individual counselor view
        return Counselor(**counselor_doc)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Database error retrieving counselor: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving counselor"
        )

@router.post("", response_model=Counselor)
async def create_counselor(
    counselor_data: CounselorCreate,
    db = Depends(get_database)
):
    """Create a new counselor profile (admin endpoint)"""
    
    # Note: In production, this would require admin authentication
    # For MVP, we'll allow creation but set is_verified to False by default
    
    # Check if counselor with same email already exists
    existing_counselor = await db.counselors.find_one({
        "email": counselor_data.email
    })
    
    if existing_counselor:
        raise HTTPException(
            status_code=400,
            detail="Counselor with this email already exists"
        )
    
    # Create counselor
    counselor = Counselor(
        id=str(uuid.uuid4()),
        name=counselor_data.name,
        email=counselor_data.email,
        phone=counselor_data.phone,
        specialties=counselor_data.specialties,
        bio=counselor_data.bio,
        location=counselor_data.location,
        experience_years=counselor_data.experience_years,
        education=counselor_data.education,
        certifications=counselor_data.certifications,
        languages=counselor_data.languages,
        session_types=counselor_data.session_types,
        rate_per_session=counselor_data.rate_per_session,
        is_available=False,  # Default to not available until verified
        is_verified=False,   # Requires admin verification
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    try:
        await db.counselors.insert_one(counselor.dict())
        return counselor
    
    except Exception as e:
        print(f"Database error creating counselor: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error creating counselor profile"
        )

@router.get("/search/location")
async def search_by_location(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"), 
    radius_km: float = Query(50, description="Search radius in kilometers"),
    limit: int = Query(10, le=50),
    db = Depends(get_database)
):
    """Search counselors by geographic location"""
    
    try:
        # Note: This is a simplified location search
        # In production, you'd use MongoDB's geospatial features
        
        # For MVP, we'll do a simple text-based location search
        # This would be replaced with proper geospatial queries
        
        # Get all available counselors
        counselors = []
        cursor = db.counselors.find({
            "is_verified": True,
            "is_available": True
        }).limit(limit)
        
        async for counselor_doc in cursor:
            counselor_doc.pop("_id", None)
            # Remove sensitive info for search results
            counselor_doc.pop("email", None)
            counselor_doc.pop("phone", None)
            counselors.append(counselor_doc)
        
        return {"counselors": counselors, "message": "Geographic search coming soon"}
    
    except Exception as e:
        print(f"Database error in location search: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error searching counselors by location"
        )