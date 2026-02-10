from fastapi import APIRouter, BackgroundTasks, HTTPException
from pymongo.errors import DuplicateKeyError
from uuid import uuid4
from datetime import timedelta

from app.db.mongo import db
from app.core.security import (
    hash_password,
    verify_password,
    hash_otp,
    verify_otp,
    create_access_token,
    utcnow,
)
from app.core.email import send_email
from app.core.config import EMAIL_OTP_TTL_MINUTES
from app.models.schemas import (
    OrganizerSignupRequest,
    AttendeeSignupRequest,
    VerifyEmailRequest,
    ResendCodeRequest,
    LoginRequest,
    TokenResponse,
)
from app.utils.helpers import (
    normalize_email,
    validate_password_strength,
    generate_otp_code,
)

router = APIRouter()

# =====================================================
# SIGNUP – ORGANIZER
# =====================================================
@router.post("/signup/organizer")
async def signup_organizer(
    payload: OrganizerSignupRequest,
    bg: BackgroundTasks,
):
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
        raise HTTPException(status_code=409, detail="Email already registered")

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

# =====================================================
# SIGNUP – ATTENDEE
# =====================================================
@router.post("/signup/attendee")
async def signup_attendee(
    payload: AttendeeSignupRequest,
    bg: BackgroundTasks,
):
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
        raise HTTPException(status_code=409, detail="Email already registered")

    bg.add_task(
        send_email,
        email,
        "NetSync Verification Code",
        f"Your verification code is {otp}",
    )

    return {"message": "Attendee created. Verify email."}

# =====================================================
# VERIFY EMAIL
# =====================================================
@router.post("/verify-email")
async def verify_email(payload: VerifyEmailRequest):
    email = normalize_email(payload.email)
    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("is_email_verified"):
        return {"message": "Email already verified"}

    if user["email_otp_expires_at"] < utcnow():
        raise HTTPException(status_code=400, detail="Code expired")

    if not verify_otp(payload.code, user["email_otp_hash"]):
        raise HTTPException(status_code=400, detail="Invalid code")

    await db.users.update_one(
        {"email": email},
        {"$set": {"is_email_verified": True}},
    )

    return {"message": "Email verified successfully"}

# =====================================================
# RESEND VERIFICATION CODE
# =====================================================
@router.post("/resend-code")
async def resend_code(
    payload: ResendCodeRequest,
    bg: BackgroundTasks,
):
    email = normalize_email(payload.email)
    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("is_email_verified"):
        return {"message": "Email already verified"}

    otp = generate_otp_code()

    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "email_otp_hash": hash_otp(otp),
                "email_otp_expires_at": utcnow()
                + timedelta(minutes=EMAIL_OTP_TTL_MINUTES),
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

# =====================================================
# LOGIN
# =====================================================
@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    email = normalize_email(payload.email)
    user = await db.users.find_one({"email": email})

    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("is_email_verified"):
        raise HTTPException(status_code=403, detail="Email not verified")

    token = create_access_token(
        {
            "sub": user["email"],
            "role": user["role"],
            "tenant_id": user.get("tenant_id"),
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }
