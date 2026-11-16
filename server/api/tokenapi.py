from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from server.services.tokenservice import create_key, revoke_key, list_keys
from server.services.projectservice import verify_project_access
from server.api.authapi import get_current_user

token_router = APIRouter(tags=["Token Management"])

class CreateTokenRequest(BaseModel):
    project_id: str

class CreateTokenResponse(BaseModel):
    status: str
    message: str
    api_key: str
    key_prefix: str

class RevokeTokenRequest(BaseModel):
    project_id: str
    key_id: str

class ListTokenRequest(BaseModel):
    project_id: str

@token_router.post("/create-token", response_model=CreateTokenResponse, status_code=status.HTTP_201_CREATED)
async def create_token(
    payload: CreateTokenRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("user_id"))
    if not verify_project_access(user_id=user_id, project_id=payload.project_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project"
        )
    result = create_key(project_id=payload.project_id)
    if result.get("status") == "success":
        return CreateTokenResponse(
            status=result["status"],
            message=result["message"],
            api_key=result["api_key"],
            key_prefix=result["key_prefix"]
        )
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to create token")
    )

@token_router.post("/revoke-token", status_code=status.HTTP_200_OK)
async def revoke_token(
    payload: RevokeTokenRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("user_id"))
    if not verify_project_access(user_id=user_id, project_id=payload.project_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project"
        )
    result = revoke_key(project_id=payload.project_id, key_id=payload.key_id)
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to revoke token")
    )

@token_router.post("/list-tokens", status_code=status.HTTP_200_OK)
async def list_tokens(
    payload: ListTokenRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("user_id"))
    if not verify_project_access(user_id=user_id, project_id=payload.project_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project"
        )
    result = list_keys(project_id=payload.project_id)
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to list tokens")
    )