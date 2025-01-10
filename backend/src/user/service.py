import asyncpg
from fastapi import HTTPException, status
from fastapi.responses import FileResponse
from passlib.context import CryptContext

import os
import re
from datetime import datetime

from .schemas import UserCreate, UserLogin, UserResponse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USER_LOGS_DIR = os.path.join(BASE_DIR, "..\\user_logs")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def _check_user_exists(user_data: UserCreate, conn: asyncpg.connection.Connection) -> None:
    query = f"SELECT * FROM users WHERE username = '{user_data.username}' OR email = '{user_data.email}'"
    
    user = await conn.fetchrow(query)

    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Taka nazwa użytkownika lub email juz istnieje!"
        )

async def register_user(user_data: UserCreate, conn: asyncpg.connection.Connection) -> None:
    hashed_password = hash_password(user_data.password)
    await _check_user_exists(user_data, conn)
    query = f"INSERT INTO users (username, email, password) VALUES ('{user_data.username}', '{user_data.email}', '{hashed_password}')"
        
    try:
        await conn.execute(query)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Nieoczekiwany błąd serwera: {str(e)}"
        )

async def login_user(user_data: UserLogin, conn: asyncpg.connection.Connection) -> tuple[str, str, str]:
    query = f"SELECT * FROM users WHERE (username = '{user_data.username}' OR email = '{user_data.username}')"

    user = await conn.fetchrow(query)

    if not user or not verify_password(user_data.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowe dane logowania!"
        )
    
    return user['id'], user['username'], user['email']

async def get_all_users(conn: asyncpg.connection.Connection) -> list[UserResponse]:
    query = "SELECT id, username, email FROM users"
    users = await conn.fetch(query)
    return [UserResponse(id=user['id'], username=user['username'], email=user['email']) for user in users]

def _sanitize_username(username: str) -> str:
    return re.sub(r'[^a-zA-Z0-9_-]', '', username)

def log_action(username: str, action: str) -> None:
    sanitized_username = _sanitize_username(username)

    if not sanitized_username:
        raise HTTPException(status_code=400, detail="Nieprawidłowa nazwa użytkownika.")

    log_file_path = os.path.join(USER_LOGS_DIR, f"{sanitized_username}.txt")

    if os.path.exists(log_file_path):
        raise HTTPException(status_code=400, detail="Taka nazwa użytkownika lub email juz istnieje.")

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"{timestamp} - {action}\n"

    with open(log_file_path, "a") as log_file:
        log_file.write(log_entry)

def get_user_log(filename: str) -> FileResponse:
    file_path = os.path.join(USER_LOGS_DIR, filename)
    print(file_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plik nie znaleziony")
    return FileResponse(file_path)