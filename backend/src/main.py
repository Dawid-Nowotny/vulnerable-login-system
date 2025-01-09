from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from user import router as user_router

from config import get_secure_mode
from middlewares.input_sanitization_middleware import InputSanitizationMiddleware
from middlewares.security_headers_protection_middleware import SecurityHeadersProtectionMiddleware

app = FastAPI()

origins = [
    "http://127.0.0.1:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
)

if get_secure_mode():
    app.add_middleware(SecurityHeadersProtectionMiddleware)
    app.add_middleware(InputSanitizationMiddleware)

app.include_router(user_router.router, prefix='/user', tags=['user'])