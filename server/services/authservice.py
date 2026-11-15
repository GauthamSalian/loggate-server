from time import time
import os
from supabase import create_client, Client
from pathlib import Path
from dotenv import load_dotenv
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from postgrest.exceptions import APIError
from datetime import datetime, timedelta
import jwt

# Ensure .env is loaded from server/.env regardless of current working directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_PUBLISHABLE_KEY")
)

JWT_SECRET = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"

ph = PasswordHasher()

def create_new_user(email: str, password: str, phone: str, username: str):
    hashed_pw = ph.hash(password)

    try:
        response = (
            supabase.table("users")
            .insert({
                "email": email,
                "password_hash": hashed_pw,
                "phone": phone,
                "username": username
            })
            .execute()
        )

        if response.data and len(response.data) > 0:
            return {
                "status": "success",
                "message": "User registered successfully!"
            }
        return {
            "status": "error",
            "message": "User could not be created. Check database permissions/RLS."
        }
    except APIError as e:
        return {"status": "error", "message": getattr(e, "message", str(e))}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def login_user(email: str, password: str):
    try:
        users = (
            supabase.table("users")
            .select("user_id", "username", "password_hash", "phone", "email")
            .eq("email", email)
            .execute()
        )
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    if not users.data:
        return {"status": "error", "message": "Invalid email or password"}

    user = users.data[0]

    try:
        ph.verify(user["password_hash"], password)
        return {
            "status": "success",
            "message": "User logged in successfully",
            "access_token": generate_jwt(user.get("user_id"), user.get("username"), user.get("email")),
            "token_type": "bearer",
            "user_id": user.get("user_id")
        }
    except (InvalidHashError, VerifyMismatchError):
        return {"status": "error", "message": "Invalid email or password"}

def generate_jwt(user_id: int, username: str, email: str):
    payload = {
        "user_id": user_id,
        "username": username,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=24)  # 24 hours
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    return token

def verify_jwt(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return {
            "status": "success",
            "user": payload
        }
    except jwt.ExpiredSignatureError:
        return {"status": "error", "message": "Token has expired"}
    except jwt.InvalidTokenError:
        return {"status": "error", "message": "Invalid token"}