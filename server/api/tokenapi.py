from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from server.services.tokenservice import create_key, revoke_key
from server.api.authapi import get_current_user

token_router = APIRouter(tags=["Token Management"])

class CreateTokenResponse(BaseModel):
    status: str
    message: str
    api_key: str
    key_prefix: str

class RevokeTokenRequest(BaseModel):
    key_id: str

@token_router.post("/create-token", response_model=CreateTokenResponse, status_code=status.HTTP_201_CREATED)
async def create_token(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    result = create_key(user_id=user_id)
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
    result = revoke_key(user_id=user_id, key_id=payload.key_id)
    if result.get("status") == "success":
        return result
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=result.get("message", "Failed to revoke token")
    )