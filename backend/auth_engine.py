"""
WorkProof AI - Security, RBAC & Stateless JWT Authentication Engine
Provides cryptographic identity, role-based access control, and token management.
"""

import hmac
import hashlib
import base64
import json
import time
from typing import Dict, Any, Optional, List
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from database import get_db
from models import User

JWT_SECRET = os.getenv("JWT_SECRET", "workproof-cryptographic-master-key-2026-secure-token")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_SECONDS = 86400 * 7  # 7 days

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """PBKDF2 HMAC-SHA256 password hashing."""
    salt = "workproof-salt-2026"
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return key.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hmac.compare_digest(hash_password(plain_password), hashed_password)

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(user_id: str, email: str, role: str, org_id: Optional[str] = None) -> str:
    """Issues stateless HMAC-SHA256 JWT token with role claims."""
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "org_id": org_id,
        "exp": int(time.time()) + TOKEN_EXPIRY_SECONDS,
        "iat": int(time.time()),
        "iss": "workproof-auth-engine"
    }
    encoded_header = base64url_encode(json.dumps(header).encode("utf-8"))
    encoded_payload = base64url_encode(json.dumps(payload).encode("utf-8"))
    signature_base = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signature_base, hashlib.sha256).digest()
    encoded_signature = base64url_encode(signature)
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

# In-memory / Distributed Token Revocation Blacklist
REVOKED_TOKENS: set = set()

def revoke_token(token: str) -> bool:
    """Revokes a JWT token (e.g. on logout or security invalidation)."""
    cleaned = token.replace("Bearer ", "").strip()
    REVOKED_TOKENS.add(cleaned)
    return True

def is_token_revoked(token: str) -> bool:
    """Checks if a token has been revoked."""
    cleaned = token.replace("Bearer ", "").strip()
    return cleaned in REVOKED_TOKENS

def decode_access_token(token: str) -> Dict[str, Any]:
    """Validates and decodes JWT signature and expiration."""
    cleaned = token.strip()
    if is_token_revoked(cleaned):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT token has been revoked")
    try:
        parts = cleaned.split(".")
        if len(parts) != 3:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format")
        encoded_header, encoded_payload, encoded_signature = parts
        signature_base = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        expected_sig = base64url_encode(hmac.new(JWT_SECRET.encode("utf-8"), signature_base, hashlib.sha256).digest())
        if not hmac.compare_digest(encoded_signature, expected_sig):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token signature")
        
        payload = json.loads(base64url_decode(encoded_payload).decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
        return payload
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token validation failed: {str(e)}")

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    """Dependency that resolves authenticated user from Bearer JWT token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Header: Authorization: Bearer <token>"
        )
    payload = decode_access_token(credentials.credentials)
    user = db.query(User).filter(User.id == payload["sub"], User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found or inactive")
    return user

def require_role(allowed_roles: List[str]):
    """Role-Based Access Control (RBAC) guard dependency."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Role '{current_user.role}' lacks permission. Required roles: {allowed_roles}"
            )
        return current_user
    return role_checker
