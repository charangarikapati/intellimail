from fastapi import APIRouter, Header, Query
from fastapi.responses import RedirectResponse
from typing import Optional
from services.oauth_service import OAuthService
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/google/url")
async def get_google_auth_url():
    url = OAuthService.get_authorization_url()
    return {"url": url, "isDemo": settings.is_demo_mode}

@router.get("/google/callback")
async def google_oauth_callback(code: Optional[str] = Query(None), error: Optional[str] = Query(None)):
    if error or not code:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/?auth_error={error or 'no_code'}")
    
    session = await OAuthService.exchange_code_for_tokens(code)
    if not session:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/?auth_error=exchange_failed")
    
    token = session["sessionToken"]
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/?token={token}")

@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    session = OAuthService.get_session(token)
    if session:
        return session["user"]
    
    # Default Demo user fallback
    return {
        "userId": "user-demo-101",
        "name": "Charan",
        "email": "user@gmail.com",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        "isDemo": True
    }

@router.post("/disconnect") 
async def disconnect_account(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        OAuthService.revoke_session(token)
    return {"status": "success", "message": "Logged out successfully."}
