from fastapi import APIRouter, Query, Header
from typing import List, Optional
from services.gmail_service import GmailService
from services.oauth_service import OAuthService
from models.email import EmailMessage

router = APIRouter(prefix="/search", tags=["Search"])

def get_access_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    session_token = authorization.split(" ")[1]
    session = OAuthService.get_session(session_token)
    return session.get("accessToken") if session else None

@router.get("", response_model=List[EmailMessage])
async def search_emails(
    q: str = Query(..., description="Query terms or natural language search query"),
    authorization: Optional[str] = Header(None)
):
    access_token = get_access_token(authorization)
    all_emails = await GmailService.get_messages(access_token=access_token)
    q_lower = q.lower().strip()
    
    if not q_lower:
        return all_emails
        
    filtered = []
    for email in all_emails:
        searchable_text = f"{email.subject} {email.sender} {email.snippet} {email.body} {email.category}".lower()
        if any(term in searchable_text for term in q_lower.split()):
            filtered.append(email)
            
    return filtered if filtered else all_emails
