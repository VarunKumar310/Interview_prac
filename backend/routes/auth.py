"""
Authentication routes for user login and session management
"""

from fastapi import APIRouter, HTTPException, Depends
import logging
from models.api_models import LoginRequest, LoginResponse, APIResponse

logger = logging.getLogger(__name__)

router = APIRouter()

# Simple authentication - in production, use proper auth with JWT tokens
VALID_USERS = {
    "test@example.com": "password123",
    "admin@interview.com": "admin123",
    "demo@demo.com": "demo123"
}

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    User login endpoint
    For demo purposes - in production, implement proper authentication
    """
    try:
        email = request.email.lower()
        password = request.password
        
        # Check credentials
        if email in VALID_USERS and VALID_USERS[email] == password:
            # Generate session token (simplified)
            import uuid
            session_token = f"token_{uuid.uuid4().hex[:16]}"
            
            logger.info(f"Successful login for {email}")
            return LoginResponse(
                success=True,
                message="Login successful",
                user_id=email,
                session_token=session_token
            )
        else:
            logger.warning(f"Failed login attempt for {email}")
            return LoginResponse(
                success=False,
                message="Invalid email or password",
                user_id=None,
                session_token=None
            )
            
    except Exception as e:
        logger.error(f"Login error: {e}")
        return LoginResponse(
            success=False,
            message="Login failed due to server error",
            user_id=None,
            session_token=None
        )

@router.post("/guest-session", response_model=APIResponse)
async def create_guest_session():
    """Create a guest session for users who want to continue without login"""
    try:
        import uuid
        guest_id = f"guest_{uuid.uuid4().hex[:12]}"
        session_token = f"guest_token_{uuid.uuid4().hex[:16]}"
        
        logger.info(f"Created guest session: {guest_id}")
        return APIResponse(
            success=True,
            message="Guest session created",
            data={
                "user_id": guest_id,
                "session_token": session_token,
                "is_guest": True
            }
        )
        
    except Exception as e:
        logger.error(f"Guest session creation error: {e}")
        return APIResponse(
            success=False,
            message="Failed to create guest session",
            error=str(e)
        )

@router.post("/logout", response_model=APIResponse)
async def logout():
    """Logout endpoint - in production, invalidate tokens"""
    return APIResponse(
        success=True,
        message="Logged out successfully"
    )

@router.get("/validate-token", response_model=APIResponse)
async def validate_token(token: str):
    """Validate session token"""
    # Simple token validation - in production, use JWT validation
    if token.startswith("token_") or token.startswith("guest_token_"):
        return APIResponse(
            success=True,
            message="Token is valid",
            data={"valid": True}
        )
    else:
        return APIResponse(
            success=False,
            message="Invalid token",
            data={"valid": False}
        )