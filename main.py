from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
from argon2 import PasswordHasher
import os

# =====================================================
# LOAD ENV
# =====================================================
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# =====================================================
# APP INIT (NETSYNC)
# =====================================================
app = FastAPI(
    title="NetSync",
    description="Smart Event Management & Networking Platform (Problem 1)",
    version="1.0.0",
)

# =====================================================
# DATABASE
# =====================================================
mongo = AsyncIOMotorClient(MONGO_URI)
db = mongo[DB_NAME]

# =====================================================
# SECURITY (ARGON2 + BEARER)
# =====================================================
ph = PasswordHasher()
bearer_scheme = HTTPBearer()

def hash_password(password: str) -> str:
    return ph.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    try:
        ph.verify(hashed, password)
        return True
    except:
        return False

def create_access_token(data: dict):
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

# =====================================================
# SCHEMAS
# =====================================================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# =====================================================
# AUTH DEPENDENCIES
# =====================================================
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    try:
        token = credentials.credentials
        return decode_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

def require_roles(*roles):
    def checker(user=Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied for this role",
            )
        return user
    return checker

# =====================================================
# AUTH ROUTES
# =====================================================
@app.post(
    "/auth/login",
    response_model=TokenResponse,
    tags=["Authentication"],
    summary="Login and receive JWT",
)
async def login(data: LoginRequest):
    user = await db.users.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token_data = {
        "sub": user["email"],
        "role": user["role"],
        "tenant_id": user.get("tenant_id"),
    }

    return {
        "access_token": create_access_token(token_data),
        "token_type": "bearer",
    }

# =====================================================
# DASHBOARDS (ROLE BASED)
# =====================================================
@app.get(
    "/dashboard/super-admin",
    tags=["Dashboards"],
    summary="Super Admin Dashboard",
)
async def super_admin_dashboard(
    user=Depends(require_roles("super_admin"))
):
    return {"message": "Welcome Super Admin", "user": user}

@app.get(
    "/dashboard/organizer",
    tags=["Dashboards"],
    summary="Organizer Dashboard",
)
async def organizer_dashboard(
    user=Depends(require_roles("organizer"))
):
    return {"message": "Welcome Organizer", "user": user}

@app.get(
    "/dashboard/staff",
    tags=["Dashboards"],
    summary="Staff Panel",
)
async def staff_panel(
    user=Depends(require_roles("staff"))
):
    return {"message": "Welcome Staff", "user": user}

@app.get(
    "/dashboard/attendee",
    tags=["Dashboards"],
    summary="Attendee Home",
)
async def attendee_home(
    user=Depends(require_roles("attendee"))
):
    return {"message": "Welcome Attendee", "user": user}

# =====================================================
# DEV UTILITIES (REMOVE IN PROD)
# =====================================================
@app.post(
    "/dev/create-users",
    tags=["Development"],
    summary="Create demo users (DEV ONLY)",
)
async def create_test_users():
    await db.users.delete_many({})

    users = [
        {
            "email": "admin@netsync.com",
            "hashed_password": hash_password("admin123"),
            "role": "super_admin",
            "tenant_id": None,
        },
        {
            "email": "organizer@netsync.com",
            "hashed_password": hash_password("org123"),
            "role": "organizer",
            "tenant_id": "tenant_001",
        },
        {
            "email": "staff@netsync.com",
            "hashed_password": hash_password("staff123"),
            "role": "staff",
            "tenant_id": "tenant_001",
        },
        {
            "email": "attendee@netsync.com",
            "hashed_password": hash_password("attendee123"),
            "role": "attendee",
            "tenant_id": "tenant_001",
        },
    ]

    await db.users.insert_many(users)
    return {
        "message": "Demo users created",
        "accounts": [
            "admin@netsync.com / admin123",
            "organizer@netsync.com / org123",
            "staff@netsync.com / staff123",
            "attendee@netsync.com / attendee123",
        ],
    }

# =====================================================
# HEALTH
# =====================================================
@app.get(
    "/health",
    tags=["System"],
    summary="Health Check",
)
def health():
    return {"status": "ok", "platform": "NetSync"}
