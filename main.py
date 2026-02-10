from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
from argon2 import PasswordHasher
from pymongo.errors import DuplicateKeyError
import os
import re
import secrets
import smtplib
from email.message import EmailMessage
from uuid import uuid4

# =====================================================
# LOAD ENV
# =====================================================
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "netsync")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_FROM = os.getenv("SMTP_FROM", "NetSync <noreply@netsync.local>")

EMAIL_OTP_TTL_MINUTES = int(os.getenv("EMAIL_OTP_TTL_MINUTES", "10"))

if not MONGO_URI or not JWT_SECRET:
    raise RuntimeError("Missing required environment variables")

# =====================================================
# APP INIT
# =====================================================
app = FastAPI(
    title="NetSync",
    description="Smart Event Management & Networking Platform — Complete Auth System",
    version="1.0.0",
)

# =====================================================
# DATABASE
# =====================================================
mongo = AsyncIOMotorClient(MONGO_URI)
db = mongo[DB_NAME]

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("tenant_id")

# =====================================================
# SECURITY (ARGON2 + BEARER)
# =====================================================
ph = PasswordHasher()
bearer_scheme = HTTPBearer()

def utcnow():
    # ✅ UTC-naive everywhere (Mongo-safe)
    return datetime.utcnow()

def hash_password(password: str) -> str:
    return ph.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    try:
        ph.verify(hashed, password)
        return True
    except Exception:
        return False

def hash_otp(code: str) -> str:
    return ph.hash(code)

def verify_otp(code: str, hashed: str) -> bool:
    try:
        ph.verify(hashed, code)
        return True
    except Exception:
        return False

def create_access_token(data: dict):
    payload = data.copy()
    payload["exp"] = utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

# =====================================================
# EMAIL (SAFE FOR DEMO)
# =====================================================
def send_email(to_email: str, subject: str, text: str):
    try:
        msg = EmailMessage()
        msg["From"] = SMTP_FROM
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.set_content(text)

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
    except Exception as e:
        # Never crash signup due to SMTP
        print("Email send failed:", e)

# =====================================================
# HELPERS
# =====================================================
def normalize_email(email: str) -> str:
    return email.strip().lower()

def validate_password_strength(password: str):
    if len(password) < 8:
        raise HTTPException(422, "Password must be at least 8 characters")
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        raise HTTPException(422, "Password must include letters and numbers")

def generate_otp_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"

# =====================================================
# SCHEMAS
# =====================================================
class OrganizerSignupRequest(BaseModel):
    email: EmailStr
    password: str
    org_name: str = Field(min_length=2, max_length=120)

class AttendeeSignupRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_id: str | None = None

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)

class ResendCodeRequest(BaseModel):
    email: EmailStr

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
        return decode_token(credentials.credentials)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def require_roles(*roles):
    def checker(user=Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Access denied")
        return user
    return checker

# =====================================================
# SIGNUP ROUTES
# =====================================================
@app.post("/auth/signup/organizer", tags=["Authentication"])
async def signup_organizer(payload: OrganizerSignupRequest, bg: BackgroundTasks):
    email = normalize_email(payload.email)
    validate_password_strength(payload.password)

    tenant_id = f"tenant_{uuid4().hex[:8]}"
    otp = generate_otp_code()

    user = {
        "email": email,
        "hashed_password": hash_password(payload.password),
        "role": "organizer",
        "tenant_id": tenant_id,
        "org_name": payload.org_name,
        "is_email_verified": False,
        "email_otp_hash": hash_otp(otp),
        "email_otp_expires_at": utcnow() + timedelta(minutes=EMAIL_OTP_TTL_MINUTES),
        "created_at": utcnow(),
    }

    try:
        await db.users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(409, "Email already registered")

    bg.add_task(
        send_email,
        email,
        "NetSync Verification Code",
        f"Your verification code is {otp}",
    )

    return {
        "message": "Organizer created. Verify email.",
        "tenant_id": tenant_id,
    }

@app.post("/auth/signup/attendee", tags=["Authentication"])
async def signup_attendee(payload: AttendeeSignupRequest, bg: BackgroundTasks):
    email = normalize_email(payload.email)
    validate_password_strength(payload.password)

    otp = generate_otp_code()

    user = {
        "email": email,
        "hashed_password": hash_password(payload.password),
        "role": "attendee",
        "tenant_id": payload.tenant_id,
        "is_email_verified": False,
        "email_otp_hash": hash_otp(otp),
        "email_otp_expires_at": utcnow() + timedelta(minutes=EMAIL_OTP_TTL_MINUTES),
        "created_at": utcnow(),
    }

    try:
        await db.users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(409, "Email already registered")

    bg.add_task(
        send_email,
        email,
        "NetSync Verification Code",
        f"Your verification code is {otp}",
    )

    return {"message": "Attendee created. Verify email."}

# =====================================================
# VERIFY / RESEND / LOGIN
# =====================================================
@app.post("/auth/verify-email", tags=["Authentication"])
async def verify_email(payload: VerifyEmailRequest):
    email = normalize_email(payload.email)
    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(404, "User not found")

    if user["is_email_verified"]:
        return {"message": "Email already verified"}

    if user["email_otp_expires_at"] < utcnow():
        raise HTTPException(400, "Code expired")

    if not verify_otp(payload.code, user["email_otp_hash"]):
        raise HTTPException(400, "Invalid code")

    await db.users.update_one(
        {"email": email},
        {"$set": {"is_email_verified": True}},
    )

    return {"message": "Email verified successfully"}

@app.post("/auth/resend-code", tags=["Authentication"])
async def resend_code(payload: ResendCodeRequest, bg: BackgroundTasks):
    email = normalize_email(payload.email)
    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(404, "User not found")

    if user["is_email_verified"]:
        return {"message": "Email already verified"}

    otp = generate_otp_code()

    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "email_otp_hash": hash_otp(otp),
                "email_otp_expires_at": utcnow() + timedelta(minutes=EMAIL_OTP_TTL_MINUTES),
            }
        },
    )

    bg.add_task(
        send_email,
        email,
        "NetSync Verification Code (Resend)",
        f"Your verification code is {otp}",
    )

    return {"message": "Verification code resent"}

@app.post("/auth/login", response_model=TokenResponse, tags=["Authentication"])
async def login(payload: LoginRequest):
    email = normalize_email(payload.email)
    user = await db.users.find_one({"email": email})

    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(401, "Invalid credentials")

    if not user["is_email_verified"]:
        raise HTTPException(403, "Email not verified")

    token = create_access_token(
        {"sub": user["email"], "role": user["role"], "tenant_id": user.get("tenant_id")}
    )

    return {"access_token": token, "token_type": "bearer"}

# =====================================================
# DASHBOARDS
# =====================================================
@app.get("/dashboard/organizer", tags=["Dashboards"])
async def organizer_dashboard(user=Depends(require_roles("organizer"))):
    return {"message": "Welcome Organizer"}

@app.get("/dashboard/attendee", tags=["Dashboards"])
async def attendee_dashboard(user=Depends(require_roles("attendee"))):
    return {"message": "Welcome Attendee"}

@app.get("/dashboard/staff", tags=["Dashboards"])
async def staff_dashboard(user=Depends(require_roles("staff"))):
    return {"message": "Welcome Staff"}

@app.get("/dashboard/super-admin", tags=["Dashboards"])
async def admin_dashboard(user=Depends(require_roles("super_admin"))):
    return {"message": "Welcome Super Admin"}

# =====================================================
# DEV UTILITIES
# =====================================================
@app.post("/dev/seed-verified-users", tags=["Development"])
async def seed_verified_users():
    await db.users.delete_many({})

    users = [
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
        {
            "email": "staff@netsync.com",
            "hashed_password": hash_password("staff12345"),
            "role": "staff",
            "tenant_id": "tenant_001",
            "is_email_verified": True,
        },
        {
            "email": "attendee@netsync.com",
            "hashed_password": hash_password("attendee12345"),
            "role": "attendee",
            "tenant_id": "tenant_001",
            "is_email_verified": True,
        },
    ]

    await db.users.insert_many(users)
    return {"message": "Verified demo users created"}

# =====================================================
# HEALTH
# =====================================================
@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "platform": "NetSync"}
