import asyncio
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict

class RateLimitService:
    def __init__(self):
        # Store for rate limit tracking: {user_id: {endpoint: [timestamps]}}
        self.request_counts = defaultdict(lambda: defaultdict(list))
        
        # Rate limit configurations
        self.rate_limits = {
            'chat': {'requests': 30, 'window': 60},  # 30 requests per minute
            'screening': {'requests': 5, 'window': 300},  # 5 requests per 5 minutes
            'journal': {'requests': 20, 'window': 60},  # 20 requests per minute
            'general': {'requests': 100, 'window': 60},  # 100 requests per minute
        }
        
        # Cleanup interval (remove old entries every 5 minutes)
        self.cleanup_interval = 300
        self.last_cleanup = datetime.utcnow()
    
    async def check_rate_limit(
        self, 
        user_id: str, 
        endpoint: str = 'general'
    ) -> Dict[str, Any]:
        """
        Check if user has exceeded rate limit for endpoint
        Returns: {allowed: bool, remaining: int, reset_time: datetime}
        """
        # Clean up old entries periodically
        await self._cleanup_old_entries()
        
        current_time = datetime.utcnow()
        
        # Get rate limit config for endpoint
        config = self.rate_limits.get(endpoint, self.rate_limits['general'])
        window_seconds = config['window']
        max_requests = config['requests']
        
        # Get user's request history for this endpoint
        user_requests = self.request_counts[user_id][endpoint]
        
        # Remove requests outside current window
        cutoff_time = current_time - timedelta(seconds=window_seconds)
        user_requests[:] = [
            timestamp for timestamp in user_requests 
            if timestamp > cutoff_time
        ]
        
        # Check if limit exceeded
        current_count = len(user_requests)
        remaining = max(0, max_requests - current_count)
        
        if current_count >= max_requests:
            # Find the oldest request to determine reset time
            if user_requests:
                oldest_request = min(user_requests)
                reset_time = oldest_request + timedelta(seconds=window_seconds)
            else:
                reset_time = current_time + timedelta(seconds=window_seconds)
            
            return {
                'allowed': False,
                'remaining': 0,
                'reset_time': reset_time,
                'retry_after': int((reset_time - current_time).total_seconds())
            }
        
        # Add current request
        user_requests.append(current_time)
        
        # Calculate next reset time
        if user_requests:
            oldest_request = min(user_requests)
            reset_time = oldest_request + timedelta(seconds=window_seconds)
        else:
            reset_time = current_time + timedelta(seconds=window_seconds)
        
        return {
            'allowed': True,
            'remaining': remaining - 1,  # -1 for current request
            'reset_time': reset_time,
            'retry_after': 0
        }
    
    async def _cleanup_old_entries(self):
        """Remove old rate limit entries to prevent memory leaks"""
        current_time = datetime.utcnow()
        
        # Only cleanup every cleanup_interval seconds
        if (current_time - self.last_cleanup).total_seconds() < self.cleanup_interval:
            return
        
        self.last_cleanup = current_time
        
        # Find the longest window among all endpoints
        max_window = max(config['window'] for config in self.rate_limits.values())
        cutoff_time = current_time - timedelta(seconds=max_window * 2)  # Keep extra buffer
        
        # Clean up old entries
        users_to_remove = []
        for user_id, endpoints in self.request_counts.items():
            endpoints_to_remove = []
            
            for endpoint, timestamps in endpoints.items():
                # Remove old timestamps
                timestamps[:] = [
                    timestamp for timestamp in timestamps 
                    if timestamp > cutoff_time
                ]
                
                # Mark empty endpoints for removal
                if not timestamps:
                    endpoints_to_remove.append(endpoint)
            
            # Remove empty endpoints
            for endpoint in endpoints_to_remove:
                del endpoints[endpoint]
            
            # Mark users with no endpoints for removal
            if not endpoints:
                users_to_remove.append(user_id)
        
        # Remove users with no active rate limits
        for user_id in users_to_remove:
            del self.request_counts[user_id]
    
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get current rate limit statistics for a user"""
        current_time = datetime.utcnow()
        stats = {}
        
        for endpoint, config in self.rate_limits.items():
            window_seconds = config['window']
            max_requests = config['requests']
            
            # Get user's request history for this endpoint
            user_requests = self.request_counts[user_id].get(endpoint, [])
            
            # Remove requests outside current window
            cutoff_time = current_time - timedelta(seconds=window_seconds)
            recent_requests = [
                timestamp for timestamp in user_requests 
                if timestamp > cutoff_time
            ]
            
            current_count = len(recent_requests)
            remaining = max(0, max_requests - current_count)
            
            # Calculate reset time
            if recent_requests:
                oldest_request = min(recent_requests)
                reset_time = oldest_request + timedelta(seconds=window_seconds)
            else:
                reset_time = current_time + timedelta(seconds=window_seconds)
            
            stats[endpoint] = {
                'requests_made': current_count,
                'requests_remaining': remaining,
                'requests_limit': max_requests,
                'window_seconds': window_seconds,
                'reset_time': reset_time.isoformat(),
                'is_limited': current_count >= max_requests
            }
        
        return stats
    
    async def reset_user_limits(self, user_id: str, endpoint: Optional[str] = None):
        """Reset rate limits for a user (admin function)"""
        if endpoint:
            # Reset specific endpoint
            if user_id in self.request_counts:
                self.request_counts[user_id].pop(endpoint, None)
        else:
            # Reset all endpoints for user
            self.request_counts.pop(user_id, None)
    
    def get_rate_limit_headers(self, result: Dict[str, Any]) -> Dict[str, str]:
        """Generate rate limit headers for HTTP responses"""
        headers = {}
        
        if 'remaining' in result:
            headers['X-RateLimit-Remaining'] = str(result['remaining'])
        
        if 'reset_time' in result:
            reset_timestamp = int(result['reset_time'].timestamp())
            headers['X-RateLimit-Reset'] = str(reset_timestamp)
        
        if 'retry_after' in result and result['retry_after'] > 0:
            headers['Retry-After'] = str(result['retry_after'])
        
        return headers


# Global rate limit service instance
rate_limit_service = RateLimitService()