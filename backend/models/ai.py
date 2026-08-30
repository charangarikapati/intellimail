from pydantic import BaseModel
from typing import List, Optional

class SummarizeRequest(BaseModel):
    emailId: str
    content: str

class SummarizeResponse(BaseModel):
    emailId: str
    summary: str
    keyPoints: List[str]
    datesMentioned: List[str]

class GenerateReplyRequest(BaseModel):
    emailId: str
    content: str
    tone: Optional[str] = "Professional"  # Professional, Friendly, Formal, Concise
    userInstruction: Optional[str] = None

class GenerateReplyResponse(BaseModel):
    emailId: str
    replyDraft: str
    tone: str

class ExplainRequest(BaseModel):
    emailId: str
    content: str

class ExplainResponse(BaseModel):
    emailId: str
    explanation: str

class ExtractActionsRequest(BaseModel):
    emailId: str
    content: str

class ActionItem(BaseModel):
    task: str
    deadline: Optional[str] = None
    completed: bool = False

class ExtractActionsResponse(BaseModel):
    emailId: str
    actionItems: List[ActionItem]

class ClassifyRequest(BaseModel):
    emailId: str
    content: str
    subject: str

class ClassifyResponse(BaseModel):
    emailId: str
    category: str  # Academic, Internship, Finance, Personal, Promotional, Important
    priority: str  # High, Medium, Low
    reason: str

class QuickReplyOption(BaseModel):
    id: str
    label: str
    preview: str
    fullDraft: str
    tone: str = "Professional"

class QuickRepliesRequest(BaseModel):
    emailId: str
    content: str

class QuickRepliesResponse(BaseModel):
    emailId: str
    options: List[QuickReplyOption]

class ThreadHighlight(BaseModel):
    speaker: str
    summary: str
    sentiment: Optional[str] = "Neutral"

class ThreadSynthesizeRequest(BaseModel):
    threadId: str
    messages: List[dict]

class ThreadSynthesizeResponse(BaseModel):
    threadId: str
    overallSummary: str
    keyDecisions: List[str]
    pendingQuestions: List[str]
    timeline: List[ThreadHighlight]

class PolishDraftRequest(BaseModel):
    content: str
    action: str = "polish"  # polish, shorten, expand, formalize, friendly
    tone: Optional[str] = "Professional"

class PolishDraftResponse(BaseModel):
    original: str
    polished: str
    action: str
    improvements: List[str]
