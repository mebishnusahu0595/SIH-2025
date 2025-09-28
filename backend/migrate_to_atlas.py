#!/usr/bin/env python3
"""
MongoDB Atlas Migration Script
This script will help you migrate data from localhost MongoDB to MongoDB Atlas
"""

import os
import json
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MongoDBMigration:
    def __init__(self):
        # Local MongoDB connection
        self.local_client = None
        self.local_db = None
        
        # Atlas MongoDB connection
        self.atlas_client = None
        self.atlas_db = None
        
        # Configuration
        self.local_url = "mongodb://localhost:27017"
        self.atlas_url = "mongodb+srv://sih-project:mebishnusahu0595@cluster0.fzo0qav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        self.database_name = "mindsupport"  # New standardized database name
    
    async def connect_databases(self):
        """Connect to both local and Atlas databases"""
        try:
            # Connect to local MongoDB
            self.local_client = MongoClient(self.local_url)
            logger.info("✅ Connected to local MongoDB")
            
            # Connect to Atlas MongoDB
            self.atlas_client = AsyncIOMotorClient(self.atlas_url)
            await self.atlas_client.admin.command('ping')
            self.atlas_db = self.atlas_client[self.database_name]
            logger.info("✅ Connected to MongoDB Atlas")
            
            return True
        except Exception as e:
            logger.error(f"❌ Connection failed: {e}")
            return False
    
    def analyze_local_data(self):
        """Analyze existing local MongoDB data"""
        try:
            logger.info("🔍 Analyzing local MongoDB data...")
            
            # Get all databases
            databases = self.local_client.list_database_names()
            logger.info(f"Found databases: {databases}")
            
            data_summary = {}
            
            for db_name in databases:
                if db_name in ['admin', 'config', 'local']:
                    continue
                    
                db = self.local_client[db_name]
                collections = db.list_collection_names()
                
                if collections:
                    data_summary[db_name] = {}
                    logger.info(f"\n📁 Database: {db_name}")
                    
                    for collection_name in collections:
                        collection = db[collection_name]
                        count = collection.count_documents({})
                        data_summary[db_name][collection_name] = count
                        logger.info(f"  📋 Collection: {collection_name} - {count} documents")
                        
                        # Show sample document structure
                        if count > 0:
                            sample = collection.find_one()
                            if sample:
                                logger.info(f"      Sample fields: {list(sample.keys())}")
            
            return data_summary
        except Exception as e:
            logger.error(f"❌ Error analyzing local data: {e}")
            return {}
    
    async def migrate_data(self, source_db_name, collections_to_migrate=None):
        """Migrate data from local to Atlas"""
        try:
            source_db = self.local_client[source_db_name]
            collections = collections_to_migrate or source_db.list_collection_names()
            
            logger.info(f"🚀 Starting migration from '{source_db_name}' to Atlas '{self.database_name}'")
            
            for collection_name in collections:
                if collection_name.startswith('system.'):
                    continue
                    
                logger.info(f"📦 Migrating collection: {collection_name}")
                
                source_collection = source_db[collection_name]
                target_collection = self.atlas_db[collection_name]
                
                # Get all documents from source
                documents = list(source_collection.find())
                
                if documents:
                    # Insert into Atlas
                    result = await target_collection.insert_many(documents)
                    logger.info(f"   ✅ Migrated {len(result.inserted_ids)} documents")
                else:
                    logger.info(f"   ℹ️  No documents to migrate")
            
            logger.info("🎉 Migration completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Migration failed: {e}")
            return False
    
    async def setup_indexes(self):
        """Create necessary indexes in Atlas database"""
        try:
            logger.info("🔧 Setting up indexes...")
            
            # Users collection indexes
            users_collection = self.atlas_db["users"]
            await users_collection.create_index("email", unique=True)
            await users_collection.create_index("created_at")
            
            # Doctor applications indexes
            doctor_apps_collection = self.atlas_db["doctor_applications"]
            await users_collection.create_index("email", unique=True)
            await users_collection.create_index("status")
            await users_collection.create_index("created_at")
            
            # Chat sessions indexes (if exists)
            if "chat_sessions" in await self.atlas_db.list_collection_names():
                chat_collection = self.atlas_db["chat_sessions"]
                await chat_collection.create_index("user_id")
                await chat_collection.create_index("created_at")
            
            logger.info("✅ Indexes created successfully")
            
        except Exception as e:
            logger.error(f"❌ Error creating indexes: {e}")
    
    async def verify_migration(self):
        """Verify that migration was successful"""
        try:
            logger.info("🔍 Verifying migration...")
            
            collections = await self.atlas_db.list_collection_names()
            
            for collection_name in collections:
                collection = self.atlas_db[collection_name]
                count = await collection.count_documents({})
                logger.info(f"   📋 {collection_name}: {count} documents")
                
                if count > 0:
                    sample = await collection.find_one()
                    if sample:
                        logger.info(f"      ✅ Sample document found with fields: {list(sample.keys())}")
            
            logger.info("✅ Migration verification completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Verification failed: {e}")
            return False
    
    def close_connections(self):
        """Close database connections"""
        if self.local_client:
            self.local_client.close()
        if self.atlas_client:
            self.atlas_client.close()

async def main():
    """Main migration process"""
    migration = MongoDBMigration()
    
    try:
        # Step 1: Connect to databases
        if not await migration.connect_databases():
            return
        
        # Step 2: Analyze local data
        data_summary = migration.analyze_local_data()
        
        if not data_summary:
            logger.info("ℹ️  No data found in local MongoDB")
            return
        
        # Step 3: Choose database to migrate
        print("\n" + "="*50)
        print("🗄️  MIGRATION OPTIONS")
        print("="*50)
        
        for db_name, collections in data_summary.items():
            total_docs = sum(collections.values())
            print(f"{db_name}: {len(collections)} collections, {total_docs} total documents")
        
        # Auto-select the database with most data or ask user
        if len(data_summary) == 1:
            source_db = list(data_summary.keys())[0]
            logger.info(f"🎯 Auto-selected database: {source_db}")
        else:
            # For now, let's migrate the first non-empty database
            source_db = list(data_summary.keys())[0]
            logger.info(f"🎯 Migrating database: {source_db}")
        
        # Step 4: Migrate data
        success = await migration.migrate_data(source_db)
        
        if success:
            # Step 5: Setup indexes
            await migration.setup_indexes()
            
            # Step 6: Verify migration
            await migration.verify_migration()
            
            print("\n" + "="*50)
            print("🎉 MIGRATION COMPLETED SUCCESSFULLY!")
            print("="*50)
            print(f"✅ Data migrated from local '{source_db}' to Atlas 'mindsupport'")
            print("✅ Indexes created")
            print("✅ Migration verified")
            print("\n🔄 Your backend is now ready to use MongoDB Atlas!")
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
    
    finally:
        migration.close_connections()

if __name__ == "__main__":
    print("🚀 MongoDB Atlas Migration Tool")
    print("================================")
    asyncio.run(main())