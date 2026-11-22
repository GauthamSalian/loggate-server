from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from server.services.projectservice import (
    create_project,
    add_member,
    remove_member,
    list_user_projects,
    set_channel,
    list_project_metrics
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