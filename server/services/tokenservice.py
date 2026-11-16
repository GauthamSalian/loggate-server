from secrets import token_hex
from supabase import Client, create_client
from dotenv import load_dotenv
from pathlib import Path
import os
import hashlib
from postgrest.exceptions import APIError

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

PREFIX = "lg-live-"
# 32 bytes in hex = 64 characters
EXPECTED_LENGTH = len(PREFIX) + 64

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_PUBLISHABLE_KEY")
)

def create_key(project_id: str):
    # 32 random bytes = 64 hex characters
    key = PREFIX + token_hex(32)
    hashed_key = hashlib.sha256(key.encode("utf-8")).hexdigest()
    key_prefix = key[:12]

    try:
        res = (
            supabase.table("api_keys")
            .insert({
                "project_id": project_id,
                "key_prefix": key_prefix,
                "key_hash": hashed_key,
                "is_active": True
            })
            .execute()
        )

        if res.data and len(res.data) > 0:
            return {
                "status": "success",
                "message": "API key created successfully",
                "api_key": key,  # Raw secret key shown ONCE to user
                "key_prefix": key_prefix,
            }
        return {
            "status": "error",
            "message": "Failed to create API key. Check database permissions/RLS."
        }

    except APIError as e:
        return {"status": "error", "message": getattr(e, "message", str(e))}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def verify_key(api_key: str):
    if (
        not api_key
        or not api_key.startswith(PREFIX)
        or len(api_key) != EXPECTED_LENGTH
    ):
        return None

    incoming_hash = hashlib.sha256(api_key.encode("utf-8")).hexdigest()

    try:
        res = (
            supabase.table("api_keys")
            .select("is_active", "project_id", "key_id")
            .eq("key_hash", incoming_hash)
            .limit(1)
            .execute()
        )

        if not res.data:
            return None

        key_record = res.data[0]
        if not key_record.get("is_active"):
            return None

        return key_record
    except Exception:
        return None

def revoke_key(project_id: str, key_id: str):
    try:
        res = (
            supabase.table("api_keys")
            .update({"is_active": False})
            .eq("key_id", key_id)
            .eq("project_id", project_id)
            .execute()
        )
        if res.data and len(res.data) > 0:
            return {"status": "success", "message": "API key revoked successfully"}
        return {"status": "error", "message": "API key not found or already revoked"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def list_keys(project_id: str):
    try:
        res = (
            supabase.table("api_keys")
            .select("key_id", "key_prefix", "is_active", "created_at", "last_used_at")
            .eq("project_id", project_id)
            .execute()
        )
        return {
            "status": "success",
            "message": "API keys listed successfully",
            "data": res.data or []
        }
    except APIError as e:
        return {"status": "error", "message": getattr(e, "message", str(e))}
    except Exception as e:
        return {"status": "error", "message": str(e)}