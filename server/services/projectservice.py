from supabase import Client, create_client
from dotenv import load_dotenv
from pathlib import Path
import os
from postgrest.exceptions import APIError

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_PUBLISHABLE_KEY")
)

def create_project(project_name: str, user_id: str):
    try:
        response = supabase.table("projects").insert({
            "name": project_name,
            "user_id": user_id
        }).execute()

        if not response.data:
            return {"status": "error", "message": "Failed to create project"}

        project = response.data[0]
        project_id = project.get("project_id") or project.get("id")

        supabase.table("project_members").insert({
            "project_id": project_id,
            "user_id": user_id,
            "role": "owner"
        }).execute()

        return {
            "status": "success",
            "message": "Project created successfully",
            "data": project
        }
    except APIError as e:
        return {"status": "error", "message": getattr(e, "message", str(e))}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def verify_project_access(user_id: str, project_id: str) -> bool:
    try:
        res = (
            supabase.table("project_members")
            .select("project_id, user_id")
            .eq("project_id", project_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        return bool(res.data and len(res.data) > 0)
    except Exception:
        return False

def add_member(project_id: str, new_user_id: str, requesting_user_id: str, role: str = "member"):
    # Verify the requester is a member of the project
    if not verify_project_access(user_id=requesting_user_id, project_id=project_id):
        return {"status": "error", "message": "You do not have access to manage this project"}

    try:
        res = (
            supabase.table("project_members")
            .insert({
                "project_id": project_id,
                "user_id": new_user_id,
                "role": role
            })
            .execute()
        )
        return {
            "status": "success",
            "message": "Member added successfully",
            "data": res.data[0] if res.data else None
        }
    except APIError as e:
        return {"status": "error", "message": getattr(e, "message", str(e))}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def remove_member(project_id: str, target_user_id: str, requesting_user_id: str):
    # Verify the requester has access
    if not verify_project_access(user_id=requesting_user_id, project_id=project_id):
        return {"status": "error", "message": "You do not have access to manage this project"}

    try:
        res = (
            supabase.table("project_members")
            .delete()
            .eq("project_id", project_id)
            .eq("user_id", target_user_id)
            .execute()
        )
        return {
            "status": "success",
            "message": "Member removed successfully"
        }
    except APIError as e:
        return {"status": "error", "message": getattr(e, "message", str(e))}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def list_user_projects(user_id: str):
    try:
        res = (
            supabase.table("project_members")
            .select("project_id, role, projects(id, name, created_at)")
            .eq("user_id", user_id)
            .execute()
        )
        return {
            "status": "success",
            "data": res.data or []
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


def set_channel(project_id:str, slack_webhook_url:str, requesting_user_id: str):
    if not verify_project_access(user_id=requesting_user_id, project_id=project_id):
        return {"status": "error", "message": "You do not have access to manage this project"}
    res = (
        supabase.table("projects")
        .update({"slack_webhook_url": slack_webhook_url})
        .eq("project_id", project_id)
        .execute()
    )
    return {
        "status": "success",
        "message": "Slack channel set successfully",
        "data": res.data[0] if res.data else None
    }