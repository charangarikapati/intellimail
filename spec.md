# Intelligent Email Assistant — Project Specification

## 1. Project Overview

**Project Name:** Intelligent Email Assistant (IntelliMail)

**Difficulty:** Medium (Recommended)

**Project Type:** AI + Full-Stack Web Application + Gmail API Integration

### Objective

Build an AI-powered email management application that securely connects to a user's Gmail account using Google OAuth. The application allows users to view, search, organize, and manage emails while using AI to summarize messages, explain emails, generate replies, extract action items, classify messages, and assist with composing emails.

The application acts as an AI layer on top of Gmail rather than attempting to replace Gmail itself.

---

## 2. Problem Statement

Users receive large numbers of emails every day. Important information is often buried inside long messages, while some emails require quick responses or contain deadlines and action items.

The application aims to reduce the time and effort required to understand and manage email by providing:

- A centralized email dashboard
- Gmail-based email management
- AI-powered summaries
- AI-generated replies
- Email explanation
- Action-item extraction
- Priority detection
- Intelligent classification
- AI-assisted composition

---

## 3. Core Concept

The project has two main layers.

### Email Management Layer

```text
User
  ↓
Frontend
  ↓
Backend
  ↓
Gmail API
  ↓
Gmail Account
```

This layer provides:

- Inbox
- Email reading
- Threads
- Search
- Star
- Archive
- Delete
- Read/unread
- Compose
- Send

### AI Layer

```text
Email Content
     ↓
Backend
     ↓
AI Model
     ↓
Summary / Reply / Explanation / Classification
```

The AI operates on email content retrieved through the Gmail API.

---

## 4. Example Workflow

```text
User
  ↓
Connect Gmail
  ↓
Google Login
  ↓
OAuth Consent
  ↓
OAuth Token
  ↓
Gmail API
  ↓
Fetch Emails
  ↓
Email Dashboard
  ↓
Open Email
  ↓
AI Feature
  ├── Summarize
  ├── Generate Reply
  ├── Explain
  ├── Extract Actions
  └── Classify
  ↓
Review / Edit
  ↓
Send Email
```

---

# 5. Required OAuth and Security Flow

The application must never ask the user for their Gmail password.

```text
Connect Gmail
      ↓
Google Login
      ↓
Google Consent Screen
      ↓
User Grants Permission
      ↓
OAuth Authorization Code
      ↓
Backend Exchanges Code
      ↓
Access / Refresh Token
      ↓
Gmail API
```

### Security Requirements

- Never collect Gmail passwords.
- Never expose OAuth client secrets in frontend code.
- Never expose refresh tokens to the frontend.
- Never commit API keys or client secrets to GitHub.
- Store secrets using environment variables.
- Use HTTPS in production.
- Request only the Gmail permissions required by the application.
- Handle access-token expiration and refresh.
- Provide an option to disconnect the Gmail account.
- Protect backend API endpoints with authentication and authorization.
- Validate and sanitize user-controlled input.
- Avoid logging sensitive OAuth tokens or email content unnecessarily.

---

# 6. Recommended Technology Stack

## Frontend

Recommended:

- React
- HTML
- CSS
- JavaScript

React is recommended for a richer dashboard experience, but the application can also be implemented using plain HTML/CSS/JavaScript.

## Backend

- Python
- FastAPI

FastAPI is recommended because the AI functionality can be implemented naturally in Python.

## Authentication

- Google OAuth 2.0
- Optionally Firebase Authentication for application-level authentication

## Email Integration

- Gmail API

## Database

**Firebase Firestore**

Firestore is recommended for this implementation because the project mainly requires document-oriented application data such as users, preferences, AI history, and activity logs.

## AI

Any suitable LLM API can be used for:

- Summarization
- Reply generation
- Rewriting
- Explanation
- Classification
- Action extraction

## Deployment

Example:

```text
Frontend → Netlify / Vercel
Backend  → Render / Railway / Similar
Database → Firebase Firestore
Email    → Gmail API
AI       → Selected LLM API
```

---

# 7. Why Firestore Instead of PostgreSQL/Supabase?

Firestore is fully suitable for this project.

The application does not require relational database functionality for its core features. Gmail remains the source of truth for actual email messages, while Firestore stores application-specific data.

### Advantages

- Easy setup
- Serverless
- Simple document-based structure
- Good integration with Firebase Authentication
- Real-time capabilities
- Easy deployment
- Suitable for user preferences and activity data
- Suitable for AI history
- Good fit for a student project

### Important Design Principle

Do **not** unnecessarily copy the entire Gmail mailbox into Firestore.

Prefer:

```text
Gmail → Source of truth for emails

Firestore → Application data
```

Firestore can optionally cache selected email metadata when useful.

---

# 8. Firestore Data Model

## Users

```text
users
 └── userId
      ├── name
      ├── email
      ├── googleId
      └── createdAt
```

## Activity

```text
activity
 └── activityId
      ├── userId
      ├── emailId
      ├── action
      ├── timestamp
      └── result
```

Possible actions:

```text
SUMMARY_GENERATED
REPLY_GENERATED
EMAIL_EXPLAINED
ACTION_EXTRACTION
EMAIL_SENT
EMAIL_ARCHIVED
EMAIL_STARRED
EMAIL_DELETED
```

## AI History

```text
ai_history
 └── historyId
      ├── userId
      ├── emailId
      ├── action
      ├── prompt
      ├── response
      └── timestamp
```

## Preferences

```text
preferences
 └── userId
      ├── defaultTone
      ├── language
      └── summaryLength
```

---

# 9. System Architecture

```text
                         USER
                           │
                           ▼
                 ┌──────────────────┐
                 │    Frontend      │
                 │ React / HTML CSS │
                 │       JS         │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │     Backend      │
                 │     FastAPI      │
                 └────────┬─────────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
       Google OAuth   Gmail API     AI Service
             │            │            │
             ▼            ▼            ▼
          Google        Emails         LLM
                                      │
                                      ▼
                             AI Generated Output

                          │
                          ▼
                    ┌───────────┐
                    │ Firestore │
                    └───────────┘
```

---

# 10. Must-Have Features

## 10.1 Email Account Connection

Users must be able to connect their Gmail account using Google OAuth.

## 10.2 Secure Authentication

The application must securely identify the user and protect their account-specific data.

## 10.3 Email Dashboard / Inbox

Display the user's Gmail inbox in a clean dashboard.

Each email can show:

- Sender
- Subject
- Preview
- Date/time
- Read/unread status
- Star status
- Attachment indicator

## 10.4 View and Read Emails

Users can open individual emails and view:

- Sender
- Recipient
- Subject
- Date
- Body
- Attachments where supported

## 10.5 Email Threads

Related messages should be grouped into conversations where possible.

Example:

```text
Internship Application

HR:
Thank you for applying...

You:
Thank you for considering my application...

HR:
We would like to schedule an interview...

You:
I am available on September 4...
```

## 10.6 Email Search

Users can search their mailbox.

Examples:

```text
internship
assignment
from:professor
after:2026/08/01
```

The backend should use Gmail's search capabilities appropriately instead of downloading the entire mailbox unnecessarily.

## 10.7 Basic Email Management

Required actions:

- Mark read
- Mark unread
- Star
- Unstar
- Archive
- Delete

## 10.8 AI Email Summarization

Users can click **Summarize** on an email.

Example:

```text
Summary

Your technical interview is scheduled for
September 4 at 10:00 AM.

You need to submit your resume and ID
before September 1.
```

The summary should preserve important facts, dates, deadlines, and requested actions.

## 10.9 AI-Generated Replies

The application generates a draft reply based on the email context.

Example:

```text
Thank you for sharing the interview details.
I confirm my availability for September 4.

Best regards,
Charan
```

The application must not automatically send AI-generated replies.

## 10.10 Reply Editing

Users must be able to review and edit AI-generated replies before sending.

Flow:

```text
Generate Reply
      ↓
Review
      ↓
Edit
      ↓
Approve
      ↓
Send
```

## 10.11 Email Composition

Users can compose and send new emails.

Fields:

```text
To
Subject
Message
```

## 10.12 Email History / Activity

Store application actions in Firestore.

Example:

```text
12:30 PM  AI summary generated
12:34 PM  Reply generated
12:36 PM  Reply edited
12:37 PM  Email sent
```

## 10.13 Backend API Integration

Frontend and backend must communicate through secure APIs.

## 10.14 Environment Variables

Sensitive values must be configured through environment variables.

Example:

```text
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AI_API_KEY=...
FIREBASE_PROJECT_ID=...
DATABASE_URL=...
```

Do not commit `.env` to GitHub.

## 10.15 Working Deployment

The application must be deployed and accessible through a working URL.

---

# 11. Email Dashboard UI

Suggested layout:

```text
┌─────────────────────────────────────────────────────┐
│ IntelliMail                              👤 User   │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│ 📥 Inbox     │ Inbox                                │
│ ⭐ Starred   │                                      │
│ 📨 Sent      │ ● Internship Interview        10:32 │
│ 🗄 Archive   │   Company XYZ                        │
│ 🗑 Trash     │                                      │
│              │ ○ Assignment Submission              │
│              │   Faculty                            │
│              │                                      │
│              │ ○ Bank Statement                     │
│              │   Bank of Baroda                     │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

---

# 12. Email Reading Interface

```text
← Back

Subject:
Internship Interview — Next Steps

From:
hr@company.com

To:
student@gmail.com

Date:
22 Aug 2026

────────────────────────

Email Content

────────────────────────

AI Actions

[ Summarize ]
[ Explain ]
[ Extract Actions ]
[ Generate Reply ]

[ Reply ]
```

---

# 13. AI Summarization

### Prompt Requirements

The summarization system should:

- Be factual
- Avoid hallucinations
- Preserve deadlines
- Preserve dates
- Preserve requested actions
- Remain concise

Conceptual prompt:

```text
You are an email summarization assistant.

Summarize the following email accurately.

Rules:
- Do not invent information.
- Preserve important dates.
- Preserve deadlines.
- Preserve requested actions.
- Keep the summary concise.

Email:
{email_content}
```

---

# 14. AI Reply Generation

Conceptual prompt:

```text
You are an email writing assistant.

Generate a reply to the email below.

Tone:
{tone}

Rules:
- Do not invent commitments.
- Do not claim actions were completed.
- Keep the reply relevant.
- The user will review the response before sending.

Original Email:
{email_content}
```

---

# 15. AI Tone Selection

Allow users to choose:

```text
Professional
Friendly
Formal
Concise
```

Example:

Input:

```text
I cannot attend the meeting tomorrow because
I have an exam.
```

Professional output:

```text
Dear Professor,

I regret to inform you that I will be unable
to attend tomorrow's meeting due to an
examination commitment. I apologize for the
inconvenience and would appreciate the
opportunity to reschedule.

Best regards,
Charan
```

---

# 16. Bonus Features

## High Priority

- AI email classification
- Automatic priority detection
- Important email detection
- AI-generated subject lines
- Tone selection
- Grammar correction
- Email rewriting
- Explain This Email
- Extract action items
- Extract dates and deadlines
- Smart AI email search
- AI-based email categorization

## Medium Priority

- Calendar integration
- Bulk email management
- Email templates
- Multiple email accounts
- Daily email summary
- Email analytics

## Advanced

- Outlook integration
- Voice-to-email
- Advanced inbox prioritization
- Automated workflows

---

# 17. AI Email Classification

Emails can be classified into categories such as:

```text
Academic
Internship
Finance
Personal
Promotional
Important
```

Example:

```text
Incoming Email
      ↓
AI Classifier
      ↓
Category
```

---

# 18. Priority Detection

Assign:

```text
🔴 High Priority
🟡 Medium Priority
🟢 Low Priority
```

Example:

```text
"Your examination registration closes today."
→ High Priority

"New promotional offers from XYZ."
→ Low Priority
```

---

# 19. Explain This Email

The user can select:

**Explain This Email**

The AI converts complicated email content into simple language.

Example:

```text
Original:
Complicated university notice

Explanation:
You need to complete the registration before
Friday. If you do not complete it, you may not
be able to register for the examination.
```

---

# 20. Action Item Extraction

The AI can extract tasks.

Example email:

```text
Please submit your resume before Monday,
complete the registration form, and attend
the orientation session on Tuesday.
```

Output:

```text
Action Items

☐ Submit resume
   Deadline: Monday

☐ Complete registration form

☐ Attend orientation
   Date: Tuesday
```

---

# 21. Date and Deadline Extraction

The system can identify important dates:

```text
📅 September 4
Interview

⏰ September 1
Document submission deadline

📅 September 10
Registration closes
```

This can later be connected to Google Calendar.

---

# 22. AI Inbox Overview

An advanced dashboard can provide:

```text
Good Morning 👋

You have 24 new emails.

🔴 3 High Priority
🟡 7 Need Attention
🟢 14 Low Priority

Today's Important Items:

1. Internship interview — Sep 4
2. Assignment submission — Tomorrow
3. Fee payment deadline — Aug 28

AI Summary:
Your inbox contains 3 emails requiring
action today.
```

---

# 23. Natural Language Email Search

An advanced search interface can accept:

```text
Show me emails from professors about assignments this month.
```

The system can translate the request into an appropriate Gmail search strategy and/or AI-assisted filtering.

---

# 24. Backend Project Structure

Recommended structure:

```text
backend/
│
├── main.py
│
├── routes/
│   ├── auth.py
│   ├── emails.py
│   ├── search.py
│   ├── ai.py
│   └── compose.py
│
├── services/
│   ├── gmail_service.py
│   ├── oauth_service.py
│   ├── ai_service.py
│   └── email_parser.py
│
├── firebase/
│   └── firestore_service.py
│
├── models/
│   ├── user.py
│   └── activity.py
│
└── utils/
    └── security.py
```

---

# 25. Suggested API Endpoints

```text
POST /auth/google
GET  /auth/callback

GET  /emails
GET  /emails/{id}
GET  /emails/{id}/thread

POST /emails/{id}/read
POST /emails/{id}/unread
POST /emails/{id}/star
POST /emails/{id}/archive
DELETE /emails/{id}

GET  /emails/search

POST /ai/summarize
POST /ai/generate-reply
POST /ai/explain
POST /ai/extract-actions
POST /ai/classify

POST /emails/send
POST /emails/draft
```

---

# 26. OAuth and Google Cloud Setup

Development setup:

```text
Google Cloud Project
        ↓
Enable Gmail API
        ↓
Configure OAuth Consent Screen
        ↓
Create OAuth Client
        ↓
Configure Redirect URI
        ↓
Store Credentials Securely
        ↓
Implement OAuth Flow
```

The application should request only the scopes needed for its features.

Google's OAuth testing and verification requirements should be considered when deploying the application publicly.

---

# 27. Token Management

OAuth tokens are sensitive.

Recommended flow:

```text
Google OAuth
      ↓
Backend
      ↓
Secure Token Storage
      ↓
Gmail API
```

Requirements:

- Keep refresh tokens on the backend.
- Never send refresh tokens to the browser.
- Encrypt tokens if stored persistently.
- Handle token expiry.
- Refresh access tokens when required.
- Avoid logging tokens.

---

# 28. Firestore vs PostgreSQL

| Requirement | Firestore | PostgreSQL |
|---|---:|---:|
| User data | ✅ | ✅ |
| Activity history | ✅ | ✅ |
| AI history | ✅ | ✅ |
| Preferences | ✅ | ✅ |
| Gmail metadata/cache | ✅ | ✅ |
| Authentication integration | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Real-time updates | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Setup simplicity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Relational queries | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Complex analytics | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Vector/RAG search | ❌ Not ideal | ⭐⭐⭐⭐⭐ |
| Suitable for this project | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

For this project, Firestore is a good choice because the core system does not require a vector database.

---

# 29. Important Data Ownership Principle

The system should distinguish between Gmail data and application data.

```text
Gmail
 └── Source of truth
      ├── Emails
      ├── Threads
      ├── Labels
      └── Gmail state

Firestore
 └── Application data
      ├── Users
      ├── Preferences
      ├── AI history
      └── Activity
```

This reduces unnecessary data duplication.

---

# 30. MVP Scope

The first working version should include:

```text
✓ Google OAuth
✓ Gmail API integration
✓ Inbox
✓ Read email
✓ Thread view
✓ Search
✓ Mark read/unread
✓ Star/unstar
✓ Archive
✓ Delete
✓ Compose email
✓ Send email
✓ AI summarization
✓ AI reply generation
✓ Reply editing
✓ Activity history
✓ Firestore integration
✓ Secure environment variables
✓ Deployment
```

Do not implement all bonus features before the MVP works end-to-end.

---

# 31. Advanced Version

After completing the MVP:

```text
MVP
 │
 ├── AI Classification
 ├── Priority Detection
 ├── Explain Email
 ├── Action Extraction
 ├── Deadline Extraction
 ├── Smart Search
 ├── Calendar Integration
 ├── Multiple Accounts
 ├── Analytics
 ├── Daily Summary
 └── Voice-to-Email
```

---

# 32. Evaluation

The AI features should be evaluated rather than only demonstrated.

## Summarization

Evaluate:

- Factual accuracy
- Important information retention
- Hallucination rate
- Summary length

## Reply Generation

Evaluate:

- Relevance
- Tone
- Grammar
- Context preservation
- Hallucination rate

## Classification

Use:

- Accuracy
- Precision
- Recall
- F1-score

## System Performance

Measure:

- Gmail API response time
- AI response time
- End-to-end response time
- Error rate

---

# 33. Team Division

For a 3–4 member team:

## Member 1 — Frontend

- Dashboard
- Inbox
- Email viewer
- Compose
- Reply editor
- UI/UX

## Member 2 — Gmail/OAuth Backend

- Google OAuth
- Gmail API
- Email retrieval
- Search
- Threading
- Send
- Archive
- Delete
- Star

## Member 3 — AI

- Summarization
- Reply generation
- Classification
- Action extraction
- Prompt engineering
- AI evaluation

## Member 4 — Database / DevOps / Integration

- Firestore
- Activity history
- Token security
- Frontend/backend integration
- Deployment
- Testing
- Documentation

---

# 34. Complete End-to-End Example

Suppose the user receives:

**Subject:** Internship Interview — Important

### Step 1 — Priority Detection

```text
🔴 High Priority
```

### Step 2 — Open Email

```text
Internship Interview — Important
```

### Step 3 — AI Summary

```text
Your technical interview is scheduled for
September 4 at 10:00 AM.

You need to submit your resume and ID
before September 1.
```

### Step 4 — Action Extraction

```text
☐ Submit resume
   Deadline: September 1

☐ Submit ID
   Deadline: September 1
```

### Step 5 — Generate Reply

```text
Thank you for sharing the interview details.
I confirm my availability for September 4.
```

### Step 6 — User Edits

```text
Thank you for sharing the interview details.
I confirm that I will be available on September 4
at 10:00 AM.
```

### Step 7 — Send

```text
[ Send Email ]
```

### Step 8 — Activity

```text
✓ Summary generated
✓ Reply generated
✓ Reply edited
✓ Email sent
```

---

# 35. Project Goals

The final application should demonstrate:

1. Real-world API integration
2. Secure OAuth authentication
3. Full-stack development
4. Cloud database usage
5. AI integration
6. Prompt engineering
7. Email automation
8. Security best practices
9. Deployment
10. AI feature evaluation

---

# 36. Final Project Definition

> **Intelligent Email Assistant is a full-stack AI-powered email management application that securely connects to Gmail through Google OAuth and Gmail APIs. It enables users to read, search, organize, compose, and send emails while providing AI-powered capabilities such as summarization, reply generation, explanation, classification, priority detection, and action-item extraction. Firestore is used to store application-specific data such as user profiles, preferences, AI history, and activity logs, while Gmail remains the source of truth for email data.**

---

# 37. Final Recommended Stack

```text
Frontend
React + HTML + CSS + JavaScript

Backend
Python + FastAPI

Authentication
Google OAuth 2.0

Email
Gmail API

Database
Firebase Firestore

AI
LLM API

Deployment
Netlify / Vercel
+
Render / Railway
+
Firebase
```

This stack keeps the project manageable while still demonstrating **AI + full-stack + OAuth + API integration + cloud database + security + deployment**.
