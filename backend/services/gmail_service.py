import re
import html
import base64
import email.utils
from email.mime.text import MIMEText
from datetime import datetime, timezone
import requests
from typing import List, Optional, Dict, Any, Tuple
from models.email import EmailMessage, EmailThread
from services.ai_service import AIService

DEMO_EMAILS: List[EmailMessage] = [
    EmailMessage(
        id="msg-101",
        threadId="thread-101",
        sender="HR Team <hr@techinnovators.com>",
        senderEmail="hr@techinnovators.com",
        recipient="user@gmail.com",
        subject="Internship Technical Interview — Schedule & Next Steps",
        snippet="Thank you for applying to the Full-Stack Developer Internship. We would like to schedule your technical interview...",
        body="""Dear Charan,

Thank you for your application to the Full-Stack AI Developer Internship position at TechInnovators.

We were very impressed by your background and project portfolio. We would like to invite you for a 45-minute technical interview scheduled for:

Date: Wednesday, September 4, 2026
Time: 10:00 AM IST
Format: Google Meet (link will be sent upon confirmation)

Required Documents before September 1:
1. Updated PDF Resume
2. Government Issued ID Proof
3. Links to your GitHub repositories

Please confirm your availability for September 4 by responding to this email before Monday.

Best regards,
Ananya Sharma
Senior Technical Recruiter | TechInnovators Inc.""",
        date="10:32 AM",
        isRead=False,
        isStarred=True,
        isArchived=False,
        isDeleted=False,
        isSnoozed=False,
        isSent=False,
        category="Internship",
        priority="High",
        hasAttachments=True
    ),
    EmailMessage(
        id="msg-102",
        threadId="thread-102",
        sender="Prof. K. R. Varma <krvarma@university.edu>",
        senderEmail="krvarma@university.edu",
        recipient="student@gmail.com",
        subject="CSE402 Assignment Submission & Exam Schedule Notice",
        snippet="Please be reminded that Assignment 3 must be submitted to the online portal before Friday August 28...",
        body="""Dear Class,

This is an important reminder regarding CS402 Advanced Web Engineering.

1. Assignment 3 (FastAPI & Database Integration) deadline is set for Friday, August 28 at 11:59 PM.
2. The Mid-Term Examination is scheduled for September 10 at Exam Hall B.

Late submissions will incur a 10% penalty per day. Make sure to test your code locally before pushing to GitHub.

Regards,
Prof. K. R. Varma
Department of Computer Science""",
        date="Yesterday",
        isRead=False,
        isStarred=False,
        isArchived=False,
        isDeleted=False,
        isSnoozed=False,
        isSent=False,
        category="Academic",
        priority="High",
        hasAttachments=False
    ),
    EmailMessage(
        id="msg-103",
        threadId="thread-103",
        sender="HDFC Bank Alerts <alerts@hdfcbank.net>",
        senderEmail="alerts@hdfcbank.net",
        recipient="user@gmail.com",
        subject="Monthly E-Statement & Account Summary for Account ending in 4821",
        snippet="Your electronic account statement for August 2026 is now available for download...",
        body="""Dear Customer,

Your electronic bank account statement for August 2026 is now available.

Account Number: XXXX-XXXX-4821
Total Credits: INR 45,000.00
Total Debits: INR 12,350.00
Closing Balance: INR 1,28,450.00

Please review the attached statement. If you notice any unauthorized transactions, report them immediately within 24 hours.

Warm regards,
HDFC Bank Customer Support""",
        date="Aug 27",
        isRead=True,
        isStarred=False,
        isArchived=False,
        isDeleted=False,
        isSnoozed=False,
        isSent=False,
        category="Finance",
        priority="Medium",
        hasAttachments=True
    ),
    EmailMessage(
        id="msg-104",
        threadId="thread-104",
        sender="GitHub Notifications <notifications@github.com>",
        senderEmail="notifications@github.com",
        recipient="user@gmail.com",
        subject="[GitHub] Security Alert: 1 vulnerability found in repository dependencies",
        snippet="Dependabot detected 1 moderate severity security vulnerability in package axios...",
        body="""Hey @charan,

Dependabot has detected 1 moderate severity security vulnerability in your repository:
Repo: charan/intellimail-core
Package: axios (<1.7.4)

We recommend upgrading to the latest patched version to ensure security.

View full vulnerability details on GitHub Advisory Database.

Thanks,
The GitHub Team""",
        date="Aug 25",
        isRead=True,
        isStarred=False,
        isArchived=False,
        isDeleted=False,
        isSnoozed=False,
        isSent=False,
        category="Important",
        priority="High",
        hasAttachments=False
    )
]

LIVE_CACHE: Dict[str, List[EmailMessage]] = {}

def clean_html_to_text(raw_html: str) -> str:
    """Converts raw HTML email markup into clean, formatted readable text."""
    if not raw_html:
        return ""
    text = re.sub(r'<!--[\s\S]*?-->', '', raw_html)
    text = re.sub(r'<(head|style|script|xml)[^>]*>[\s\S]*?</\1>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<(br|p|div|tr|h1|h2|h3|h4|h5|h6|li|blockquote)[^>]*>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html.unescape(text)
    lines = [re.sub(r'[ \t\r]+', ' ', line).strip() for line in text.split('\n')]
    cleaned = '\n'.join([line for line in lines if line])
    return cleaned.strip()

def format_date(raw_date: Optional[str]) -> str:
    """Formats RFC 2822 dates into clean relative timestamps."""
    if not raw_date:
        return "Recent"
    try:
        parsed_tuple = email.utils.parsedate_to_datetime(raw_date)
        now = datetime.now(timezone.utc)
        diff = now - parsed_tuple
        if diff.days == 0:
            return parsed_tuple.strftime("%I:%M %p").lstrip("0")
        elif diff.days == 1:
            return "Yesterday"
        elif diff.days < 7:
            return parsed_tuple.strftime("%a")
        else:
            return parsed_tuple.strftime("%b %d")
    except Exception:
        return raw_date.split("+")[0].split("-")[0].strip()[:16]

def extract_body_and_html(payload: dict) -> Tuple[str, Optional[str]]:
    """Recursively traverses multipart payload to extract clean text and raw HTML."""
    plain_text = ""
    raw_html = ""

    def _walk(part: dict):
        nonlocal plain_text, raw_html
        mime = part.get("mimeType", "")
        data = part.get("body", {}).get("data", "")

        if data:
            try:
                decoded = base64.urlsafe_b64decode(data.encode("ASCII")).decode("utf-8", errors="ignore")
                if mime == "text/plain" and not plain_text:
                    plain_text = decoded
                elif mime == "text/html" and not raw_html:
                    raw_html = decoded
            except Exception:
                pass

        for sub in part.get("parts", []):
            _walk(sub)

    _walk(payload)

    if plain_text and not plain_text.startswith("<!doctype") and not plain_text.startswith("<html"):
        clean_text = plain_text.strip()
    elif raw_html:
        clean_text = clean_html_to_text(raw_html)
    elif plain_text:
        clean_text = clean_html_to_text(plain_text)
    else:
        clean_text = ""

    return clean_text, raw_html if raw_html else None

class GmailService:
    @staticmethod
    def _parse_gmail_message(item: dict) -> Optional[EmailMessage]:
        try:
            msg_id = item.get("id")
            thread_id = item.get("threadId", f"thread-{msg_id}")
            payload = item.get("payload", {})
            headers = {h["name"].lower(): h["value"] for h in payload.get("headers", [])}
            
            subject = headers.get("subject", "(No Subject)")
            sender = headers.get("from", "Unknown Sender")
            sender_email = sender
            if "<" in sender and ">" in sender:
                sender_email = sender.split("<")[1].split(">")[0]
            recipient = headers.get("to", "me")
            raw_date = headers.get("date", "")
            formatted_date = format_date(raw_date)
            snippet = item.get("snippet", "")
            
            # Recursive Body & HTML Extraction
            clean_body, raw_html = extract_body_and_html(payload)
            if not clean_body or len(clean_body.strip()) < 5:
                clean_body = clean_html_to_text(snippet) or snippet or "No message content available."

            labels = item.get("labelIds", [])
            is_read = "UNREAD" not in labels
            is_starred = "STARRED" in labels
            is_deleted = "TRASH" in labels
            # An email is truly "sent" (i.e. lives in Sent folder) only when it has SENT
            # but NOT INBOX — emails sent-to-self have both labels and should appear in inbox
            is_in_inbox = "INBOX" in labels
            is_sent = "SENT" in labels and not is_in_inbox
            is_archived = not is_in_inbox and not is_deleted and "SPAM" not in labels and not is_sent

            # Smart classification
            subj_lower = (subject + " " + snippet).lower()
            category = "Important"
            priority = "Medium"
            if any(k in subj_lower for k in ["interview", "offer", "internship", "hiring", "job", "recruiter", "careers", "application"]):
                category = "Internship"
                priority = "High"
            elif any(k in subj_lower for k in ["assignment", "course", "exam", "grade", "university", "professor", "lecture", "student", "class"]):
                category = "Academic"
                priority = "High"
            elif any(k in subj_lower for k in ["bank", "statement", "invoice", "receipt", "payment", "credit", "debit", "upi", "bill", "salary"]):
                category = "Finance"
                priority = "Medium"

            return EmailMessage(
                id=msg_id,
                threadId=thread_id,
                sender=sender,
                senderEmail=sender_email,
                recipient=recipient,
                subject=subject,
                snippet=snippet,
                body=clean_body,
                date=formatted_date,
                isRead=is_read,
                isStarred=is_starred,
                isArchived=is_archived,
                isDeleted=is_deleted,
                isSnoozed=False,
                isSent=is_sent,
                category=category,
                priority=priority,
                hasAttachments=len(payload.get("parts", [])) > 1,
                htmlBody=raw_html
            )
        except Exception as e:
            print(f"[ERROR] Failed to parse Gmail item {item.get('id')}: {e}")
            return None

    @staticmethod
    def _fetch_all_message_ids(q_param: str, headers: dict, max_pages: int = 10) -> List[str]:
        """Fetches ALL message IDs for a query, following nextPageToken pagination."""
        ids = []
        url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages?{q_param}"
        page = 0
        while url and page < max_pages:
            try:
                res = requests.get(url, headers=headers, timeout=15)
                if res.status_code != 200:
                    break
                data = res.json()
                for m in data.get("messages", []):
                    ids.append(m["id"])
                next_token = data.get("nextPageToken")
                if next_token:
                    base = f"https://gmail.googleapis.com/gmail/v1/users/me/messages?{q_param}"
                    url = f"{base}&pageToken={next_token}"
                    page += 1
                else:
                    break
            except Exception as qe:
                print(f"[INFO] Pagination error for {q_param}: {qe}")
                break
        return ids

    @staticmethod
    async def get_messages(category: Optional[str] = None, access_token: Optional[str] = None, force_refresh: bool = False) -> List[EmailMessage]:
        if access_token:
            if not force_refresh and access_token in LIVE_CACHE and len(LIVE_CACHE[access_token]) > 0:
                emails = LIVE_CACHE[access_token]
            else:
                try:
                    import concurrent.futures
                    print("[INFO] Synchronizing entire Inbox, Sent, Trash & Archive from Gmail API...")
                    headers = {"Authorization": f"Bearer {access_token}"}

                    # Optimize queries for lightning fast load (latest emails first)
                    queries = [
                        ("inbox",   "q=in:inbox&maxResults=40"),
                        ("sent",    "q=in:sent&maxResults=20"),
                        ("trash",   "includeSpamTrash=true&q=in:trash&maxResults=10"),
                        ("archive", "q=-in:inbox+-in:trash+-in:spam+-in:chats&maxResults=10"),
                    ]

                    all_msg_ids: List[str] = []
                    seen_ids: set = set()

                    for label, q_param in queries:
                        try:
                            fetched_ids = GmailService._fetch_all_message_ids(q_param, headers, max_pages=1)
                            added = 0
                            for mid in fetched_ids:
                                if mid not in seen_ids:
                                    seen_ids.add(mid)
                                    all_msg_ids.append(mid)
                                    added += 1
                            print(f"[INFO] {label}: fetched {len(fetched_ids)} ids, {added} new unique.")
                        except Exception as qe:
                            print(f"[INFO] Folder query '{label}' skipped: {qe}")

                    def fetch_single_msg(mid: str) -> Optional[EmailMessage]:
                        try:
                            m_res = requests.get(
                                f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{mid}",
                                headers=headers,
                                timeout=10
                            )
                            if m_res.status_code == 200:
                                return GmailService._parse_gmail_message(m_res.json())
                        except Exception:
                            pass
                        return None

                    live_emails = []
                    # Fetch all messages concurrently with 30 parallel worker threads
                    with concurrent.futures.ThreadPoolExecutor(max_workers=30) as executor:
                        results = list(executor.map(fetch_single_msg, all_msg_ids))
                        live_emails = [r for r in results if r is not None]

                    if live_emails:
                        print(f"[OK] Total mailbox synchronized: {len(live_emails)} live emails loaded.")
                        LIVE_CACHE[access_token] = live_emails
                        emails = live_emails
                    else:
                        print("[WARN] Live sync returned 0 emails, falling back to demo data.")
                        emails = DEMO_EMAILS
                except Exception as e:
                    print(f"[ERROR] Full sync failed: {e}")
                    emails = DEMO_EMAILS
        else:
            emails = DEMO_EMAILS

        if category and category.lower() != "all":
            return [m for m in emails if m.category and m.category.lower() == category.lower()]
        return emails

    @staticmethod
    async def get_message_by_id(msg_id: str, access_token: Optional[str] = None) -> Optional[EmailMessage]:
        pool = LIVE_CACHE.get(access_token, DEMO_EMAILS) if access_token else DEMO_EMAILS
        for m in pool:
            if m.id == msg_id:
                return m
        for m in DEMO_EMAILS:
            if m.id == msg_id:
                return m
        return None

    @staticmethod
    async def get_thread(thread_id: str, access_token: Optional[str] = None) -> EmailThread:
        pool = LIVE_CACHE.get(access_token, DEMO_EMAILS) if access_token else DEMO_EMAILS
        msgs = [m for m in pool if m.threadId == thread_id]
        if not msgs:
            msgs = [m for m in DEMO_EMAILS if m.threadId == thread_id]
        if not msgs:
            msgs = [pool[0]] if pool else [DEMO_EMAILS[0]]
        return EmailThread(
            threadId=thread_id,
            subject=msgs[0].subject if msgs else "Conversation",
            messages=msgs
        )

    @staticmethod
    async def toggle_star(msg_id: str, access_token: Optional[str] = None) -> bool:
        pool = LIVE_CACHE.get(access_token, DEMO_EMAILS) if access_token else DEMO_EMAILS
        for m in pool:
            if m.id == msg_id:
                m.isStarred = not m.isStarred
                if access_token and not m.id.startswith("msg-"):
                    try:
                        action = {"addLabelIds": ["STARRED"]} if m.isStarred else {"removeLabelIds": ["STARRED"]}
                        requests.post(
                            f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}/modify",
                            headers={"Authorization": f"Bearer {access_token}"},
                            json=action,
                            timeout=6
                        )
                    except Exception as e:
                        print(f"[ERROR] Live star error: {e}")
                return m.isStarred
        return False

    @staticmethod
    async def mark_read(msg_id: str, is_read: bool = True, access_token: Optional[str] = None) -> bool:
        pool = LIVE_CACHE.get(access_token, DEMO_EMAILS) if access_token else DEMO_EMAILS
        for m in pool:
            if m.id == msg_id:
                m.isRead = is_read
                return m.isRead
        return is_read

    @staticmethod
    async def toggle_archive(msg_id: str, access_token: Optional[str] = None) -> bool:
        pool = LIVE_CACHE.get(access_token, DEMO_EMAILS) if access_token else DEMO_EMAILS
        for m in pool:
            if m.id == msg_id:
                m.isArchived = not m.isArchived
                if access_token and not m.id.startswith("msg-"):
                    try:
                        action = {"removeLabelIds": ["INBOX"]} if m.isArchived else {"addLabelIds": ["INBOX"]}
                        requests.post(
                            f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}/modify",
                            headers={"Authorization": f"Bearer {access_token}"},
                            json=action,
                            timeout=6
                        )
                    except Exception as e:
                        print(f"[ERROR] Live archive error: {e}")
                return m.isArchived
        return False

    @staticmethod
    async def delete_message(msg_id: str, access_token: Optional[str] = None) -> bool:
        pool = LIVE_CACHE.get(access_token, DEMO_EMAILS) if access_token else DEMO_EMAILS
        for m in pool:
            if m.id == msg_id:
                m.isDeleted = True
                if access_token and not m.id.startswith("msg-"):
                    try:
                        requests.post(
                            f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}/trash",
                            headers={"Authorization": f"Bearer {access_token}"},
                            timeout=6
                        )
                    except Exception as e:
                        print(f"[ERROR] Live trash error: {e}")
                return True
        return False

    @staticmethod
    async def restore_message(msg_id: str, access_token: Optional[str] = None) -> bool:
        pool = LIVE_CACHE.get(access_token, DEMO_EMAILS) if access_token else DEMO_EMAILS
        for m in pool:
            if m.id == msg_id:
                m.isDeleted = False
                if access_token and not m.id.startswith("msg-"):
                    try:
                        requests.post(
                            f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}/untrash",
                            headers={"Authorization": f"Bearer {access_token}"},
                            timeout=6
                        )
                    except Exception as e:
                        print(f"[ERROR] Live untrash error: {e}")
                return True
        return False

    @staticmethod
    async def snooze_message(msg_id: str, snooze_until: str, access_token: Optional[str] = None) -> Optional[EmailMessage]:
        pool = LIVE_CACHE.get(access_token, DEMO_EMAILS) if access_token else DEMO_EMAILS
        for m in pool:
            if m.id == msg_id:
                m.isSnoozed = True
                m.snoozedUntil = snooze_until
                return m
        return None

    @staticmethod
    async def unsnooze_message(msg_id: str, access_token: Optional[str] = None) -> Optional[EmailMessage]:
        pool = LIVE_CACHE.get(access_token, DEMO_EMAILS) if access_token else DEMO_EMAILS
        for m in pool:
            if m.id == msg_id:
                m.isSnoozed = False
                m.snoozedUntil = None
                return m
        return None

    @staticmethod
    async def send_email(to: str, subject: str, body: str, thread_id: Optional[str] = None, access_token: Optional[str] = None) -> EmailMessage:
        if access_token:
            try:
                mime_msg = MIMEText(body)
                mime_msg['to'] = to
                mime_msg['subject'] = subject
                raw = base64.urlsafe_b64encode(mime_msg.as_bytes()).decode()
                send_payload: Dict[str, Any] = {'raw': raw}
                if thread_id and not thread_id.startswith("thread-msg-"):
                    send_payload['threadId'] = thread_id

                res = requests.post(
                    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                    headers={"Authorization": f"Bearer {access_token}"},
                    json=send_payload,
                    timeout=12
                )
                if res.status_code == 200:
                    sent_data = res.json()
                    new_id = sent_data.get("id", f"msg-live-{len(DEMO_EMAILS)+101}")
                    new_thread = sent_data.get("threadId", thread_id or f"thread-{new_id}")
                    new_msg = EmailMessage(
                        id=new_id,
                        threadId=new_thread,
                        sender="You <user@gmail.com>",
                        senderEmail="user@gmail.com",
                        recipient=to,
                        subject=subject,
                        snippet=body[:100] + "...",
                        body=body,
                        date="Just now",
                        isRead=True,
                        isStarred=False,
                        isArchived=False,
                        isDeleted=False,
                        isSnoozed=False,
                        isSent=True,
                        category="Important",
                        priority="Medium",
                        hasAttachments=False
                    )
                    if access_token in LIVE_CACHE:
                        LIVE_CACHE[access_token].insert(0, new_msg)
                    return new_msg
            except Exception as e:
                print(f"[ERROR] Live send failed: {e}")

        # Local / Demo fallback
        new_id = f"msg-{len(DEMO_EMAILS) + 101}"
        classification = await AIService.classify_email(new_id, subject, body)
        new_msg = EmailMessage(
            id=new_id,
            threadId=thread_id or f"thread-{new_id}",
            sender="Charan (You) <user@gmail.com>",
            senderEmail="user@gmail.com",
            recipient=to,
            subject=subject,
            snippet=body[:100] + "...",
            body=body,
            date="Just now",
            isRead=True,
            isStarred=False,
            isArchived=False,
            isDeleted=False,
            isSnoozed=False,
            isSent=True,
            category=classification.category,
            priority=classification.priority,
            hasAttachments=False
        )
        DEMO_EMAILS.insert(0, new_msg)
        return new_msg

    @staticmethod
    async def schedule_email(to: str, subject: str, body: str, send_at: str, thread_id: Optional[str] = None, access_token: Optional[str] = None) -> EmailMessage:
        new_id = f"msg-{len(DEMO_EMAILS) + 101}"
        classification = await AIService.classify_email(new_id, subject, body)
        new_msg = EmailMessage(
            id=new_id,
            threadId=thread_id or f"thread-{new_id}",
            sender="Charan (You) <user@gmail.com>",
            senderEmail="user@gmail.com",
            recipient=to,
            subject=subject,
            snippet=f"[Scheduled: {send_at}] " + body[:80] + "...",
            body=body,
            date=f"Scheduled for {send_at}",
            isRead=True,
            isStarred=False,
            isArchived=False,
            isDeleted=False,
            isSnoozed=False,
            isSent=True,
            scheduledFor=send_at,
            category=classification.category,
            priority=classification.priority,
            hasAttachments=False
        )
        DEMO_EMAILS.insert(0, new_msg)
        return new_msg
