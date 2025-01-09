from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response
import json

class InputSanitizationMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.blocked_patterns = ["'", "--", ";", "<", ">", "script"]

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.json()
                for key, value in body.items():
                    if any(pattern in str(value) for pattern in self.blocked_patterns):
                        return JSONResponse(
                            status_code=400,
                            content={"detail": f"Niebezpieczny znak został wykryty w polu '{key}'!"}
                        )
            except json.JSONDecodeError:
                pass

        for key, value in request.query_params.items():
            if any(pattern in value for pattern in self.blocked_patterns):
                return JSONResponse(
                    status_code=400,
                    content={"detail": f"Niebezpieczny znak został wykryty w parametrze '{key}'!"}
                )

        response = await call_next(request)
        return response