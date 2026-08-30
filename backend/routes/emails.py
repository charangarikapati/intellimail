from fastapi import APIRouter, HTTPException, Query, Header
from typing import Optional, List
from services.gmail_service import GmailService
from services.oauth_service import OAuthService
from firebase.firestore_service import FirestoreService
from models.email import EmailMessage, EmailThread, SnoozeEmailRequest

router = APIRouter(prefix="/emails", tags=["Emails"])

def get_access_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    session_token = authorization.split(" ")[1]
    session = OAuthService.get_session(session_token)
    return session.get("accessToken") if session else None

@router.get("", response_model=List[EmailMessage])
async def list_emails(
    category: Optional[str] = Query(None),
    force_refresh: bool = Query(False),
    authorization: Optional[str] = Header(None)
):
    access_token = get_access_token(authorization)
    return await GmailService.get_messages(category=category, access_token=access_token, force_refresh=force_refresh)

@router.get("/{msg_id}", response_model=EmailMessage)
async def get_email(msg_id: str, authorization: Optional[str] = Header(None)):
    access_token = get_access_token(authorization)
    msg = await GmailService.get_message_by_id(msg_id, access_token=access_token)
    if not msg:
        raise HTTPException(status_code=404, detail="Email not found")
    return msg

@router.get("/{msg_id}/thread", response_model=EmailThread)
async def get_email_thread(msg_id: str, authorization: Optional[str] = Header(None)):
    access_token = get_access_token(authorization)
    msg = await GmailService.get_message_by_id(msg_id, access_token=access_token)
    thread_id = msg.threadId if msg else "thread-101"
    return await GmailService.get_thread(thread_id, access_token=access_token)

@router.post("/{msg_id}/star")
async def toggle_star(msg_id: str, authorization: Optional[str] = Header(None)):
    access_token = get_access_token(authorization)
    new_state = await GmailService.toggle_star(msg_id, access_token=access_token)
    await FirestoreService.log_activity("user-demo-101", msg_id, "EMAIL_STARRED")
    return {"id": msg_id, "isStarred": new_state}

@router.post("/{msg_id}/read")
async def mark_read(msg_id: str, isRead: bool = True, authorization: Optional[str] = Header(None)):
    access_token = get_access_token(authorization)
    new_state = await GmailService.mark_read(msg_id, isRead, access_token=access_token)
    return {"id": msg_id, "isRead": new_state}

@router.post("/{msg_id}/archive")
async def toggle_archive(msg_id: str, authorization: Optional[str] = Header(None)):
    access_token = get_access_token(authorization)
    new_state = await GmailService.toggle_archive(msg_id, access_token=access_token)
    await FirestoreService.log_activity("user-demo-101", msg_id, "EMAIL_ARCHIVED")
    return {"id": msg_id, "isArchived": new_state}

@router.post("/{msg_id}/snooze")
async def snooze_email(msg_id: str, req: SnoozeEmailRequest, authorization: Optional[str] = Header(None)):
    access_token = get_access_token(authorization)
    msg = await GmailService.snooze_message(msg_id, req.snoozeUntil, access_token=access_token)
    if not msg:
        raise HTTPException(status_code=404, detail="Email not found")
    await FirestoreService.log_activity("user-demo-101", msg_id, f"EMAIL_SNOOZED_{req.snoozeUntil}")
    return {"id": msg_id, "isSnoozed": True, "snoozedUntil": req.snoozeUntil}

@router.post("/{msg_id}/unsnooze")
async def unsnooze_email(msg_id: str, authorization: Optional[str] = Header(None)):
    access_token = get_access_token(authorization)
    msg = await GmailService.unsnooze_message(msg_id, access_token=access_token)
    if not msg:
        raise HTTPException(status_code=404, detail="Email not found")
    await FirestoreService.log_activity("user-demo-101", msg_id, "EMAIL_UNSNOOZED")
    return {"id": msg_id, "isSnoozed": False}

@router.post("/{msg_id}/restore")
async def restore_email(msg_id: str, authorization: Optional[str] = Header(None)):
    access_token = get_access_token(authorization)
    await GmailService.restore_message(msg_id, access_token=access_token)
    await FirestoreService.log_activity("user-demo-101", msg_id, "EMAIL_RESTORED")
    return {"id": msg_id, "isDeleted": False}

@router.delete("/{msg_id}")
async def delete_email(msg_id: str, authorization: Optional[str] = Header(None)):
    access_token = get_access_token(authorization)
    await GmailService.delete_message(msg_id, access_token=access_token)
    await FirestoreService.log_activity("user-demo-101", msg_id, "EMAIL_DELETED")
    return {"id": msg_id, "isDeleted": True}
