from fastapi import APIRouter, Depends, status

from .schemas import UserCreate, UserLogin
from .service import register_user, login_user
from database import get_db_connection

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, conn = Depends(get_db_connection)):
    await register_user(user, conn)

    return {
        "message": "Użytkownik pomyślnie zarejestrowany."
    }

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(user: UserLogin, conn = Depends(get_db_connection)):
    id, username, email = await login_user(user, conn)

    return {
        "id": id,
        "username": username,
        "email": email
        }