from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGO_URI, DB_NAME

mongo = AsyncIOMotorClient(MONGO_URI)
db = mongo[DB_NAME]

async def init_indexes():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("tenant_id")
