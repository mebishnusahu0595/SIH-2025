# Script to set is_verified: true for all users in MongoDB Atlas

import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

MONGODB_URI = os.getenv("MONGODB_URI") or "<your-mongodb-uri>"
DB_NAME = os.getenv("MONGODB_DB") or "mental_health"

async def update_all_users_verified():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]
    result = await db.users.update_many({}, {"$set": {"is_verified": True}})
    print(f"Updated {result.modified_count} users to is_verified=True")
    client.close()

if __name__ == "__main__":
    asyncio.run(update_all_users_verified())
