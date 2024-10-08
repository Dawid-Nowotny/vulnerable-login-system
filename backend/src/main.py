from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from user import router as user_router

app = FastAPI()

origins = [
    "http://127.0.0.1:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
)

app.include_router(user_router.router, prefix='/user', tags=['user'])