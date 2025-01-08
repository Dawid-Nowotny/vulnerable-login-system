from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

class InputSanitizationMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.blocked_patterns = ["'", '"', "--", ";", "<", ">", "script"]

    async def dispatch(self, request: Request, call_next) -> Response:
        body = await request.body()
        query_params = request.query_params

        for pattern in self.blocked_patterns:
            if pattern in str(body.decode()) or pattern in str(query_params):
                return JSONResponse(
                    status_code=400,
                    content={"detail": f"Niebezpieczny znak '{pattern}' został wykryty w żądaniu!"}
                )
        
        response = await call_next(request)
        return response