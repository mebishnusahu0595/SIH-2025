from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import time
import uuid
from typing import Callable

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger("mental_health_api")

class LoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID
        request_id = str(uuid.uuid4())[:8]
        
        # Log request
        start_time = time.time()
        
        # Get user identifier
        session_id = request.headers.get("X-Session-ID", "anonymous")
        user_agent = request.headers.get("User-Agent", "unknown")
        
        logger.info(
            f"Request {request_id} - {request.method} {request.url.path} "
            f"from session {session_id[:8]}... "
            f"({request.client.host if request.client else 'unknown'})"
        )
        
        # Process request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"Response {request_id} - {response.status_code} "
                f"in {process_time:.3f}s"
            )
            
            # Add request ID to response
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            
            # Log error
            logger.error(
                f"Error {request_id} - {str(e)} "
                f"after {process_time:.3f}s"
            )
            
            # Re-raise the exception
            raise e