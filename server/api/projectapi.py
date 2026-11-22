from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from server.services.projectservice import (
    create_project,
    add_member,
    remove_member,
    list_user_projects,
    set_channel,
    list_project_metrics, 
    display_logs,
    get_connected_machine,
    get_project_members,
    delete_project
)
from server.api.authapi import get_current_user

project_router = APIRouter(tags=["Project Management"])

class CreateProjectRequest(BaseModel):
    name: str

class AddMemberRequest(BaseModel):
    project_id: str
    user_id: str
    role: str = "member"

class RemoveMemberRequest(BaseModel):
    project_id: str
    user_id: str

class SetSlackRequest(BaseModel):
    project_id: str
    slack_webhook_url: str

@project_router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_new_project(
    payload: CreateProjectRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("user_id"))
    result = create_project(project_name=payload.name, user_id=user_id)
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to create project")
    )

@project_router.get("/my-projects", status_code=status.HTTP_200_OK)
async def get_my_projects(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("user_id"))
    result = list_user_projects(user_id=user_id)
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to fetch projects")
    )

@project_router.post("/add-member", status_code=status.HTTP_200_OK)
async def add_project_member(
    payload: AddMemberRequest,
    current_user: dict = Depends(get_current_user)
):
    requesting_user_id = str(current_user.get("user_id"))
    result = add_member(
        project_id=payload.project_id,
        new_user_id=payload.user_id,
        requesting_user_id=requesting_user_id,
        role=payload.role
    )
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to add member")
    )

@project_router.post("/remove-member", status_code=status.HTTP_200_OK)
async def remove_project_member(
    payload: RemoveMemberRequest,
    current_user: dict = Depends(get_current_user)
):
    requesting_user_id = str(current_user.get("user_id"))
    result = remove_member(
        project_id=payload.project_id,
        target_user_id=payload.user_id,
        requesting_user_id=requesting_user_id
    )
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to remove member")
    )


@project_router.post("/set-slack-channel", status_code=status.HTTP_200_OK)
async def set_slack_channel(
    payload: SetSlackRequest,
    current_user: dict = Depends(get_current_user)
):
    requesting_user_id = str(current_user.get("user_id"))
    result = set_channel(
        project_id=payload.project_id,
        slack_webhook_url=payload.slack_webhook_url,
        requesting_user_id=requesting_user_id
    )
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to set slack channel")
    )

@project_router.get("/metrics/{project_id}", status_code=status.HTTP_200_OK)
async def get_project_metrics(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    requesting_user_id = str(current_user.get("user_id"))
    result = list_project_metrics(
        project_id=project_id,
        requesting_user_id=requesting_user_id
    )
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to fetch project metrics")
    )

@project_router.get("/{project_id}/display_logs/{page_number}", status_code=status.HTTP_200_OK)
async def get_project_logs(
    project_id: str,
    page_number: int,
    current_user: dict = Depends(get_current_user)
):
    requesting_user_id = str(current_user.get("user_id"))
    result = display_logs(
        project_id=project_id,
        page_number=page_number,
        requesting_user_id=requesting_user_id
    )
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to fetch project logs")
    )

@project_router.get("/{project_id}/display_machines", status_code=status.HTTP_200_OK)
async def get_project_machines(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    requesting_user_id = str(current_user.get("user_id"))
    result = get_connected_machine(
        project_id=project_id,
        requesting_user_id=requesting_user_id
    )
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to fetch project machines")
    )

@project_router.get("/{project_id}/display_members", status_code=status.HTTP_200_OK)
async def list_project_members(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    requesting_user_id = str(current_user.get("user_id"))
    result = get_project_members(
        project_id=project_id,
        requesting_user_id=requesting_user_id
    )
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to fetch project members")
    )

@project_router.delete("/{project_id}/delete", status_code=status.HTTP_200_OK)
async def delete_project_by_api(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    requesting_user_id = str(current_user.get("user_id"))
    result = delete_project(
        project_id=project_id,
        requesting_user_id=requesting_user_id
    )
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to delete project")
    )