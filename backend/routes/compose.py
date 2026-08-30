from fastapi import APIRouter, Header
from typing import Optional
from services.gmail_service import GmailService
from services.oauth_service import OAuthService
from firebase.firestore_service import FirestoreService
from models.email import SendEmailRequest, ScheduleEmailRequest, EmailMessage

router = APIRouter(prefix="/compose", tags=["Compose & Send"])

def get_access_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    session_token = authorization.split(" ")[1]
    session = OAuthService.get_session(session_token)
    return session.get("accessToken") if session else None

@router.post("/send", response_model=EmailMessage)
async def send_email(req: SendEmailRequest, authorization: Optional[str] = Header(None)):
    access_token = get_access_token(authorization)
    msg = await GmailService.send_email(to=req.to, subject=req.subject, body=req.body, thread_id=req.threadId, access_token=access_token)
    await FirestoreService.log_activity("user-demo-101", msg.id, "EMAIL_SENT")
    return msg

@router.post("/schedule", response_model=EmailMessage)
async def schedule_email(req: ScheduleEmailRequest, authorization: Optional[str] = Header(None)):
    access_token = get_access_token(authorization)
    msg = await GmailService.schedule_email(to=req.to, subject=req.subject, body=req.body, send_at=req.sendAt, thread_id=req.threadId, access_token=access_token)
    await FirestoreService.log_activity("user-demo-101", msg.id, f"EMAIL_SCHEDULED_{req.sendAt}")
    return msg
