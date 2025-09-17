from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime
import uuid

from database import get_database
from models.schemas import Counselor, CounselorCreate

router = APIRouter(prefix="/counselors", tags=["counselors"])

@router.get("", response_model=List[Counselor])
async def get_counselors(
    specialty: Optional[str] = None,
    location: Optional[str] = None,
    is_available: Optional[bool] = None,
    limit: int = Query(20, le=100),
    skip: int = 0,
    db = Depends(get_database)
):
    """Get list of verified counselors"""
    
    try:
        # Build query
        query = {"is_verified": True}  # Only show verified counselors
        
        if specialty:
            query["specialties"] = {"$in": [specialty]}
        
        if location:
            query["location"] = {"$regex": location, "$options": "i"}  # Case-insensitive search
        
        if is_available is not None:
            query["is_available"] = is_available
        
        # Get counselors
        cursor = db.counselors.find(query).skip(skip).limit(limit)
        
        counselors = []
        async for counselor_doc in cursor:
            counselor_doc.pop("_id", None)  # Remove MongoDB _id
            # Remove sensitive information
            counselor_doc.pop("email", None)
            counselor_doc.pop("phone", None)
            counselors.append(Counselor(**counselor_doc))
        
        return counselors
    
    except Exception as e:
        print(f"Database error retrieving counselors: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving counselors"
        )

@router.get("/specialties")
async def get_specialties(db = Depends(get_database)):
    """Get list of available specialties"""
    
    try:
        # Aggregate all unique specialties
        pipeline = [
            {"$match": {"is_verified": True}},
            {"$unwind": "$specialties"},
            {"$group": {"_id": "$specialties"}},
            {"$sort": {"_id": 1}}
        ]
        
        result = await db.counselors.aggregate(pipeline).to_list(None)
        specialties = [item["_id"] for item in result]
        
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