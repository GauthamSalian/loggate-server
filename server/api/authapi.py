from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from server.services.authservice import create_new_user, login_user, verify_jwt

auth_router = APIRouter(tags=["Authentication"])

security = HTTPBearer()

class LoginModel(BaseModel):
    email: str
    password: str

class RegisterModel(BaseModel):
    username: str
    email: str
    phone: str
    password: str

@auth_router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: RegisterModel):
    result = create_new_user(
        email=user.email,
        password=user.password,
        phone=user.phone,
        username=user.username
    )
    if result.get("status") != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Registration failed")
        )
    return result

@auth_router.post("/login", status_code=status.HTTP_200_OK)
def login(user: LoginModel):
    result = login_user(email=user.email, password=user.password)
    if result.get("status") != "success":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("message", "Invalid email or password")
        )
    return result


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    result = verify_jwt(credentials.credentials)
    if result.get("status") != "success":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("message", "Invalid or expired token")
        )
    return result["user"]
@auth_router.get("/me", status_code=status.HTTP_200_OK)
def get_me(current_user: dict = Depends(get_current_user)):
    """Returns the authenticated user's details decoded from the JWT."""
    return {
        "status": "success",
        "user": {
            "user_id": current_user.get("user_id"),
            "username": current_user.get("username"),
            "email": current_user.get("email")
        }
    }
