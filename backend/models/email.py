from pydantic import BaseModel
from typing import List, Optional

class EmailMessage(BaseModel):
    id: str
    threadId: str
    sender: str
    senderEmail: str
    recipient: str
    subject: str
    snippet: str
    body: str
    date: str
    isRead: bool = True
    isStarred: bool = False
    isArchived: bool = False
    isDeleted: bool = False
    isSnoozed: bool = False
    isSent: bool = False
    snoozedUntil: Optional[str] = None
    scheduledFor: Optional[str] = None
    category: Optional[str] = "Important"
    priority: Optional[str] = "Medium"
    hasAttachments: bool = False
    htmlBody: Optional[str] = None

class EmailThread(BaseModel):
    threadId: str
    subject: str
    messages: List[EmailMessage]

class SendEmailRequest(BaseModel):
    to: str
    subject: str
    body: str
    threadId: Optional[str] = None
    inReplyTo: Optional[str] = None

class SnoozeEmailRequest(BaseModel):
    snoozeUntil: str  # e.g. "Later Today", "Tomorrow 9:00 AM", "This Weekend", "Next Week"

class ScheduleEmailRequest(BaseModel):
    to: str
    subject: str
    body: str
    sendAt: str  # e.g. "Tomorrow 9:00 AM", "Next Monday 9:00 AM"
    threadId: Optional[str] = None

class SearchQuery(BaseModel):
    query: str
