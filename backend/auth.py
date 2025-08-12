from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from pydantic import BaseModel
import os
from typing import Optional
from dotenv import load_dotenv
load_dotenv()
import logging

logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")  # For auth verification, we use anon key

print(f"[AGENTIC DEBUG] Initializing Supabase client with URL: {supabase_url}")
print(f"[AGENTIC DEBUG] Using anon key: {supabase_key[:20]}..." if supabase_key else "[AGENTIC DEBUG] No anon key found")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")

supabase: Client = create_client(supabase_url, supabase_key)

security = HTTPBearer(auto_error=False)  # Don't auto-error, let us handle it

class User(BaseModel):
    id: str
    email: str
    role: Optional[str] = None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Verify JWT token and return current user
    """
    print(f"[AGENTIC DEBUG] get_current_user called with credentials: {credentials}")
    
    if not credentials:
        print("[AGENTIC DEBUG] No credentials provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        print("[AGENTIC DEBUG] Authenticating user...")
        token = credentials.credentials
        
        print("[AGENTIC DEBUG] Token:", token[:50] + "..." if len(token) > 50 else token)  # Truncate for security
        
        # Verify token with Supabase
        user_data = supabase.auth.get_user(token)
        print("[AGENTIC DEBUG] user_data:", user_data)  # AGENTIC DEBUG: Print user data for troubleshooting
        
        if not user_data.user:
            print("[AGENTIC DEBUG] User not found in token verification")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user profile from database (optional - don't fail if no profile)
        role = None
        try:
            profile = supabase.table("profiles").select("*").eq("id", user_data.user.id).single().execute()
            role = profile.data.get("role") if profile.data else None
        except Exception as profile_error:
            print(f"[AGENTIC DEBUG] Profile fetch failed (continuing anyway): {profile_error}")
            # Don't fail authentication if profile doesn't exist
        
        return User(
            id=user_data.user.id,
            email=user_data.user.email,
            role=role
        )
        
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions as-is
        print(f"[AGENTIC DEBUG] HTTP Exception in auth: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        print(f"[AGENTIC DEBUG] Unexpected error in authentication: {e}")
        print(f"[AGENTIC DEBUG] Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[User]:
    """
    Get current user if authenticated, otherwise return None
    """
    if not credentials:
        return None
        
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None 