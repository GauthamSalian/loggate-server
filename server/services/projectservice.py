from supabase import Client, create_client
from dotenv import load_dotenv
from pathlib import Path
import os
from postgrest.exceptions import APIError
from typing import Optional
import httpx

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

PAGE_SIZE = 30

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
            .select("project_id, role, projects(project_id, name, created_at)")
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

def list_project_metrics(project_id:str, requesting_user_id:str):
    if not verify_project_access(user_id=requesting_user_id, project_id=project_id):
        return {"status": "error", "message": "You do not have access to this project"}
    try:
        res = (
            supabase.table("daily_metrics")
            .select("metric_date", "bytes_ingested", "raw_lines_count", "error_count")
            .eq("project_id", project_id)
            .execute()
        )
        return {
            "status": "success",
            "data": res.data or []
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

def display_logs(
    project_id: str,
    requesting_user_id: str,
    page_number: int = 1,
    page_size: int = PAGE_SIZE,
    service: Optional[str] = None,
    environment: Optional[str] = None,
    severity_label: Optional[str] = None,
    alerted_slack: Optional[bool] = None,
    search: Optional[str] = None
):
    if not verify_project_access(user_id=requesting_user_id, project_id=project_id):
        return {
            "status": "error",
            "message": "You do not have access to this project"
        }
    try:
        page_number = max(1, page_number)
        page_size = min(max(1, page_size), 100)
        start = (page_number - 1) * page_size
        end = start + page_size - 1

        query = (
            supabase.table("logs")
            .select("*", count="exact")
            .eq("project_id", project_id)
        )

        if service:
            query = query.eq("service", service)
        if environment:
            query = query.eq("environment", environment)
        if severity_label:
            query = query.eq("severity_label", severity_label)
        if alerted_slack is not None:
            query = query.eq("alerted_slack", alerted_slack)
        if search:
            query = query.ilike("pattern", f"%{search}%")

        res = (
            query
            .order("created_at", desc=True)
            .range(start, end)
            .execute()
        )
        return {
            "status": "success",
            "data": res.data or [],
            "count": res.count or 0,
            "page": page_number,
            "page_size": page_size
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

async def test_project_slack(project_id: str, requesting_user_id: str, http_client: httpx.AsyncClient):
    if not verify_project_access(user_id=requesting_user_id, project_id=project_id):
        return {"status": "error", "message": "You do not have access to this project"}

    try:
        res = (
            supabase.table("projects")
            .select("slack_webhook_url, name")
            .eq("project_id", project_id)
            .limit(1)
            .execute()
        )
        if not res.data or not res.data[0].get("slack_webhook_url"):
            return {
                "status": "error",
                "message": "No Slack webhook configured for this project"
            }

        webhook_url = res.data[0]["slack_webhook_url"]
        project_name = res.data[0].get("name", "LogGate Project")

        payload = {
            "text": f"[LogGate] Test alert for project *{project_name}*",
            "attachments": [
                {
                    "color": "#10B981",
                    "blocks": [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": (
                                    f"*LogGate Slack Integration Test*\n"
                                    f"Successfully connected to project *{project_name}* (`{project_id}`). "
                                    f"Alert notifications will be posted here."
                                ),
                            },
                        }
                    ],
                }
            ],
        }

        resp = await http_client.post(webhook_url, json=payload)
        if resp.status_code == 200:
            return {"status": "success", "message": "Slack test alert sent successfully"}
        return {
            "status": "error",
            "message": f"Slack returned status {resp.status_code}: {resp.text}"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_connected_machine(project_id: str, requesting_user_id: str):
    if not verify_project_access(user_id=requesting_user_id, project_id=project_id):
        return {
            "status": "error",
            "message": "You do not have access to this project"
        }
    try:
        res = (
            supabase.table("machines")
            .select("machine_id, name, service, environment, last_seen_at")
            .eq("project_id", project_id)
            .execute()
        )
        return {
            "status": "success",
            "data": res.data or []
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

def get_project_members(project_id: str, requesting_user_id: str):
    if not verify_project_access(user_id=requesting_user_id, project_id=project_id):
        return {
            "status": "error",
            "message": "You do not have access to this project"
        }
    try:
        res = (
            supabase.table("project_members")
            .select("project_id, user_id, role")
            .eq("project_id", project_id)
            .execute()
        )
        return {
            "status": "success",
            "data": res.data or []
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

def delete_project(project_id: str, requesting_user_id: str):
    try:
        member = (
            supabase.table("project_members")
            .select("role")
            .eq("project_id", project_id)
            .eq("user_id", requesting_user_id)
            .limit(1)
            .execute()
        )
        if not member.data:
            return {
                "status": "error",
                "message": "You do not have access to this project"
            }
        if member.data[0].get("role") != "owner":
            return {
                "status": "error",
                "message": "Only project owners can delete the project"
            }

        res = (
            supabase.table("projects")
            .delete()
            .eq("project_id", project_id)
            .execute()
        )
        return {
            "status": "success",
            "message": "Project deleted successfully"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }