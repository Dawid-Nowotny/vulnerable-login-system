from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from time import time

RATE_LIMIT = 5
TIME_WINDOW = 60
request_counts = {}

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host
        current_time = time()

        if client_ip not in request_counts:
            request_counts[client_ip] = [current_time]

        request_counts[client_ip] = [
            timestamp for timestamp in request_counts[client_ip]
            if current_time - timestamp < TIME_WINDOW
        ]

        if len(request_counts[client_ip]) >= RATE_LIMIT:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Zbyt wiele żądań. Spróbuj ponownie później.")

        request_counts[client_ip].append(current_time)

        return await call_next(request)