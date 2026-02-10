import re
import secrets
from fastapi import HTTPException

def normalize_email(email: str) -> str:
    return email.strip().lower()

def validate_password_strength(password: str):
    if len(password) < 8:
        raise HTTPException(422, "Password must be at least 8 characters")
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        raise HTTPException(422, "Password must include letters and numbers")

def generate_otp_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"
