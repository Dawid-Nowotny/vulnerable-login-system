import asyncpg
from fastapi import HTTPException, status
from passlib.context import CryptContext

from .schemas import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def check_user_exists(user_data: UserCreate, conn: asyncpg.connection.Connection) -> None:
    query = f"SELECT * FROM users WHERE username = '{user_data.username}' OR email = '{user_data.email}'"
    
    user = await conn.fetchrow(query)

    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tala nazwa użytkownika lub email juz istnieje!"
        )

async def register_user(user_data: UserCreate, conn: asyncpg.connection.Connection) -> None:
    hashed_password = hash_password(user_data.password)
    await check_user_exists(user_data, conn)

    query = f"INSERT INTO users (username, email, password) VALUES ('{user_data.username}', '{user_data.email}', '{hashed_password}')"
    
    try:
        await conn.execute(query)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Nieoczekiwany błąd serwera: {str(e)}"
        )