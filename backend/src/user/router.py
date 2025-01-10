from fastapi import APIRouter, Depends, status

from .schemas import UserCreate, UserLogin, UserResponse
from .service import register_user, login_user, get_all_users, log_action, get_user_log
from database import get_db_connection

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, conn = Depends(get_db_connection)):
    await register_user(user, conn)
    log_action(user.username, "Użytkownik zarejestrowany")

    return {
        "message": "Użytkownik pomyślnie zarejestrowany."
    }

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(user: UserLogin, conn = Depends(get_db_connection)):
    id, username, email = await login_user(user, conn)
    log_action(username, "Użytkownik zalogowany")

    return {
        "id": id,
        "username": username,
        "email": email
        }

@router.get("/users", response_model=list[UserResponse], status_code=status.HTTP_200_OK)
async def list_users(conn=Depends(get_db_connection)):
    return await get_all_users(conn)

@router.get("/logs/{filename}", status_code=status.HTTP_200_OK)
async def get_logs(filename: str):
    return get_user_log(filename)