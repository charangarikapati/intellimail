from fastapi import APIRouter
from services.ai_service import AIService
from services.gmail_service import GmailService
from firebase.firestore_service import FirestoreService
from models.ai import (
    SummarizeRequest, SummarizeResponse,
    GenerateReplyRequest, GenerateReplyResponse,
    ExplainRequest, ExplainResponse,
    ExtractActionsRequest, ExtractActionsResponse,
    ClassifyRequest, ClassifyResponse,
    QuickRepliesRequest, QuickRepliesResponse,
    ThreadSynthesizeRequest, ThreadSynthesizeResponse,
    PolishDraftRequest, PolishDraftResponse
)

router = APIRouter(prefix="/ai", tags=["AI Operations"])

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_email(req: SummarizeRequest):
    res = await AIService.summarize_email(req.emailId, req.content)
    await FirestoreService.log_activity("user-demo-101", req.emailId, "SUMMARY_GENERATED")
    await FirestoreService.log_ai_history("user-demo-101", req.emailId, "Summarize", req.content[:200], res.summary)
    return res

@router.post("/generate-reply", response_model=GenerateReplyResponse)
async def generate_reply(req: GenerateReplyRequest):
    res = await AIService.generate_reply(req.emailId, req.content, req.tone or "Professional", req.userInstruction)
    await FirestoreService.log_activity("user-demo-101", req.emailId, "REPLY_GENERATED")
    await FirestoreService.log_ai_history("user-demo-101", req.emailId, f"Reply ({req.tone})", req.content[:200], res.replyDraft)
    return res

@router.post("/explain", response_model=ExplainResponse)
async def explain_email(req: ExplainRequest):
    res = await AIService.explain_email(req.emailId, req.content)
    await FirestoreService.log_activity("user-demo-101", req.emailId, "EMAIL_EXPLAINED")
    return res

@router.post("/extract-actions", response_model=ExtractActionsResponse)
async def extract_actions(req: ExtractActionsRequest):
    res = await AIService.extract_actions(req.emailId, req.content)
    await FirestoreService.log_activity("user-demo-101", req.emailId, "ACTION_EXTRACTION")
    return res

@router.post("/classify", response_model=ClassifyResponse)
async def classify_email(req: ClassifyRequest):
    return await AIService.classify_email(req.emailId, req.subject, req.content)

@router.get("/overview")
async def get_ai_inbox_overview():
    emails = await GmailService.get_messages()
    high_p = sum(1 for e in emails if e.priority == "High")
    med_p = sum(1 for e in emails if e.priority == "Medium")
    low_p = sum(1 for e in emails if e.priority == "Low")
    
    return {
        "totalNew": len(emails),
        "highPriority": high_p,
        "mediumPriority": med_p,
        "lowPriority": low_p,
        "todayItems": [
            {"id": "1", "title": "TechInnovators Internship Interview", "date": "Sep 4 at 10:00 AM", "priority": "High"},
            {"id": "2", "title": "CS402 Assignment Submission", "date": "Aug 28 at 11:59 PM", "priority": "High"},
            {"id": "3", "title": "E-Statement Password Check", "date": "July Statement", "priority": "Medium"}
        ],
        "briefSummary": "Your inbox currently has 2 High-Priority items requiring response and submission before September 1."
    }

@router.post("/quick-replies", response_model=QuickRepliesResponse)
async def get_quick_replies(req: QuickRepliesRequest):
    return await AIService.suggest_quick_replies(req.emailId, req.content)

@router.post("/thread-synthesize", response_model=ThreadSynthesizeResponse)
async def synthesize_thread(req: ThreadSynthesizeRequest):
    return await AIService.synthesize_thread(req.threadId, req.messages)

@router.post("/polish-draft", response_model=PolishDraftResponse)
async def polish_draft(req: PolishDraftRequest):
    res = await AIService.polish_draft(req.content, req.action, req.tone or "Professional")
    await FirestoreService.log_activity("user-demo-101", "draft", f"AI_DRAFT_{req.action.upper()}")
    return res
