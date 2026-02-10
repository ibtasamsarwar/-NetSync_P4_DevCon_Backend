from fastapi import APIRouter
from app.db.mongo import db
from app.core.security import hash_password

router = APIRouter()

@router.post("/seed-verified-users")
async def seed_verified_users():
    await db.users.delete_many({})

    await db.users.insert_many([
        {
            "email": "admin@netsync.com",
            "hashed_password": hash_password("admin12345"),
            "role": "super_admin",
            "tenant_id": None,
            "is_email_verified": True,
        },
        {
            "email": "organizer@netsync.com",
            "hashed_password": hash_password("org12345"),
            "role": "organizer",
            "tenant_id": "tenant_001",
            "is_email_verified": True,
        },
    ])

    return {"message": "Verified demo users created"}
