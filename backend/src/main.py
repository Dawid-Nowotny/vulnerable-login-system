from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from user import router as user_router
from secure_mode import router as system_config_router

from config import get_secure_mode
from middlewares.input_sanitization_middleware import InputSanitizationMiddleware
from middlewares.security_headers_protection_middleware import SecurityHeadersProtectionMiddleware
from middlewares.path_traversal_protection_middleware import PathTraversalProtectionMiddleware
from backend.src.middlewares.rate_limit_middleware import RateLimitMiddleware

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
    app.add_middleware(PathTraversalProtectionMiddleware)
    app.add_middleware(RateLimitMiddleware)

app.include_router(user_router.router, prefix='/user', tags=['user'])
app.include_router(system_config_router, prefix='/system-config', tags=['system-config'])