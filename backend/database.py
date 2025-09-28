from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING, DESCENDING
import os
from datetime import datetime, timedelta
import logging

class Database:
    client: AsyncIOMotorClient = None
    database = None

database = Database()

async def init_db():
    """Initialize database connection and create indexes"""
    # MongoDB Atlas connection string
    mongodb_url = os.getenv("MONGODB_URL", "mongodb+srv://sih-project:mebishnusahu0595@cluster0.fzo0qav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    database_name = os.getenv("DATABASE_NAME", "mindsupport")
                                                                                                                
    try:
        database.client = AsyncIOMotorClient(mongodb_url)
        database.database = database.client[database_name]
        
        # Test connection
        await database.client.admin.command('ping')
        logging.info("Successfully connected to MongoDB Atlas")
        logging.info(f"Connected to database: {database_name}")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logging.error(f"Failed to connect to MongoDB Atlas: {e}")
        raise
        raise

async def create_indexes():
    """Create database indexes for optimal performance"""
    db = database.database
    
    # Users collection indexes
    await db.users.create_index([("email", ASCENDING)], unique=True)
    await db.users.create_index([("role", ASCENDING)])
    await db.users.create_index([("is_active", ASCENDING)])
    await db.users.create_index([("created_at", DESCENDING)])
    await db.users.create_index([("verification_token", ASCENDING)])
    await db.users.create_index([("reset_token", ASCENDING)])
    
    # Sessions collection indexes
    await db.sessions.create_index([("session_id", ASCENDING)], unique=True)
    await db.sessions.create_index([("user_id", ASCENDING)])  # Link sessions to users
    await db.sessions.create_index([("created_at", DESCENDING)])
    
    # Chat history indexes
    await db.chat_history.create_index([("session_id", ASCENDING)])
    await db.chat_history.create_index([("user_id", ASCENDING)])  # Link to users
    await db.chat_history.create_index([("updated_at", DESCENDING)])
    
    # Screening results indexes
    await db.screening_results.create_index([("session_id", ASCENDING)])
    await db.screening_results.create_index([("user_id", ASCENDING)])  # Link to users
    await db.screening_results.create_index([("completed_at", DESCENDING)])
    await db.screening_results.create_index([("assessment_type", ASCENDING)])
    
    # Journal entries indexes
    await db.journal_entries.create_index([("session_id", ASCENDING)])
    await db.journal_entries.create_index([("created_at", DESCENDING)])
    
    # Counselors indexes
    await db.counselors.create_index([("email", ASCENDING)], unique=True)
    await db.counselors.create_index([("is_active", ASCENDING)])
    await db.counselors.create_index([("specialties", ASCENDING)])
    
    # Crisis events indexes
    await db.crisis_events.create_index([("session_id", ASCENDING)])
    await db.crisis_events.create_index([("created_at", DESCENDING)])
    await db.crisis_events.create_index([("resolved", ASCENDING)])

async def get_database():
    """Get database instance"""
    return database.database

async def close_db():
    """Close database connection"""
    if database.client:
        database.client.close()

# Collection helper functions
class Collections:
    @staticmethod
    async def sessions():
        db = await get_database()
        return db.sessions
    
    @staticmethod
    async def chat_history():
        db = await get_database()
        return db.chat_history
    
    @staticmethod
    async def screening_results():
        db = await get_database()
        return db.screening_results
    
    @staticmethod
    async def journal_entries():
        db = await get_database()
        return db.journal_entries
    
    @staticmethod
    async def counselors():
        db = await get_database()
        return db.counselors
    
    @staticmethod
    async def crisis_events():
        db = await get_database()
        return db.crisis_events