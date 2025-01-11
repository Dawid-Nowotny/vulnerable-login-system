from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USER_LOGS_DIR = os.path.join(BASE_DIR, "..\\user_logs")

class PathTraversalProtectionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path.startswith("/user/logs"):
            filename = request.url.path.split("/user/logs/")[-1]
            
            if ".." in filename or "/" in filename or "\\" in filename:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Nieprawidłowa nazwa pliku. Wykryto potencjalne przekroczenie ścieżki."
                )

            file_path = os.path.abspath(os.path.join(USER_LOGS_DIR, filename))
            if not file_path.startswith(os.path.abspath(USER_LOGS_DIR)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Dostęp zabroniony. Ścieżka pliku znajduje się poza dozwolonym katalogiem."
                )
        
        response = await call_next(request)
        return response