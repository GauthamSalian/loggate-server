from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from server.services.authservice import create_new_user, login_user

auth_router = APIRouter(tags=["Authentication"])

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
