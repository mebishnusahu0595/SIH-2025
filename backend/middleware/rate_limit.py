from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from services.rate_limit import rate_limit_service
import time
from typing import Callable

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, enabled: bool = True):
        super().__init__(app)
        self.enabled = enabled
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not self.enabled:
            return await call_next(request)
        
        # Skip rate limiting for health checks and static files
        if request.url.path in ["/health", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Get user identifier (session ID from header or IP address)
        session_id = request.headers.get("X-Session-ID")
        user_id = session_id or request.client.host
        
        # Determine endpoint category for rate limiting
        endpoint = "general"
        if request.url.path.startswith("/chat"):
            endpoint = "chat"
        elif request.url.path.startswith("/screening"):
            endpoint = "screening"
        elif request.url.path.startswith("/journal"):
            endpoint = "journal"
        
        # Check rate limit
        rate_limit_result = await rate_limit_service.check_rate_limit(
            user_id=user_id,
            endpoint=endpoint
        )
        
        # If rate limited, return 429 with headers
        if not rate_limit_result['allowed']:
            headers = rate_limit_service.get_rate_limit_headers(rate_limit_result)
            return Response(
                content='{"detail":"Rate limit exceeded"}',
                status_code=429,
                headers=headers,
                media_type="application/json"
            )
        
        # Process request
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Add rate limit headers to response
        headers = rate_limit_service.get_rate_limit_headers(rate_limit_result)
        for key, value in headers.items():
            response.headers[key] = value
        
        response.headers["X-Process-Time"] = str(process_time)
        
        return response