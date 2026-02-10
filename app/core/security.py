from datetime import datetime, timedelta
from jose import jwt
from argon2 import PasswordHasher
from app.core.config import (
    JWT_SECRET,
    JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

ph = PasswordHasher()

def utcnow():
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
