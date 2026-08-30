# ✉️ Intelligent Email Assistant (IntelliMail)

> **In Simple Words:** IntelliMail is a smart web application that connects to your Gmail account using Google OAuth. It acts like an AI assistant for your inbox—reading long emails, creating bullet-point summaries, extracting deadlines/tasks, writing draft replies for you, and helping you manage your inbox faster.

---

## 💡 Quick Overview: What Does IntelliMail Do?

Imagine having a personal assistant sitting next to you while you read your emails:

1. 🔐 **Safe Google Login:** You sign in with your Google account. You **never** share your password.
2. 📥 **Clean Inbox View:** You see your real Gmail inbox in a clean, uncluttered interface.
3. 🤖 **AI Assistant Tools:** On any email, you can click AI action buttons:
   - **Summarize:** Gets straight to the point of a 5-page email in 2 bullet points.
   - **Explain This Email:** Translates complicated legal, academic, or corporate jargon into simple language.
   - **Extract Action Items:** Tells you exactly what to-do tasks exist and when they are due.
   - **Generate Reply:** Drafts a response for you in any tone (Professional, Friendly, Formal, Concise).
4. ✍️ **Human-in-the-Loop Review:** The AI **never** sends emails automatically. You review the draft, edit anything you want, and click **Send**.

---

## 🗺️ How the Whole System Works (In Simple Terms)

```text
 📱 USER (You)
   │
   ├── 1. Log in safely with Google OAuth (No passwords stored)
   ├── 2. Open an email (e.g., "Internship Interview Schedule")
   ├── 3. Click [ Summarize ] or [ Generate Reply ]
   │
   ▼
 💻 FRONTEND DASHBOARD (React Web Page)
   │  Sends a request: "Hey backend, process message #1234"
   ▼
 ⚙️ BACKEND SERVER (Python FastAPI)
   ├── 🟢 Talks to Gmail API ──► Fetches email text from your Gmail inbox
   ├── 🤖 Talks to AI Model ───► Asks AI to summarize or write a reply draft
   └── 💾 Talks to Firebase ───► Remembers your preferences & activity logs
   │
   ▼
 ✉️ RESULT SHOWN ON SCREEN
   You see the AI summary & draft reply -> Edit -> Click Send!
```

---

## 📋 Table of Contents

- [💡 Quick Overview: What Does IntelliMail Do?](#-quick-overview-what-does-intellimail-do)
- [🗺️ How the Whole System Works](#️-how-the-whole-system-works-in-simple-terms)
- [1. Simple Step-by-Step Setup Guide](#1-simple-step-by-step-setup-guide)
  - [Step 1: Get Your API Keys & Credentials](#step-1-get-your-api-keys--credentials)
  - [Step 2: Setup the Backend (Python/FastAPI)](#step-2-setup-the-backend-pythonfastapi)
  - [Step 3: Setup the Database (Firebase Firestore)](#step-3-setup-the-database-firebase-firestore)
  - [Step 4: Setup the Frontend (React App)](#step-4-setup-the-frontend-react-app)
  - [Step 5: Run the Project](#step-5-run-the-project)
- [2. Process & Workflows](#2-process--workflows)
- [3. Critical Cautions & Safety Rules ⚠️](#3-critical-cautions--safety-rules-️)
- [4. Limitations & What to Watch Out For ⚠️](#4-limitations--what-to-watch-out-for-️)
- [5. System Architecture & Technical Data Model](#5-system-architecture--technical-data-model)
- [6. Team Role Division](#6-team-role-division)

---

## 1. Simple Step-by-Step Setup Guide

### Step 1: Get Your API Keys & Credentials
Before running the code, you need 3 items from external providers:
1. **Google OAuth Client ID & Secret:** Go to [Google Cloud Console](https://console.cloud.google.com/), create a project, enable the **Gmail API**, and generate OAuth Web Client Credentials.
2. **AI API Key:** Get an API key from Google AI Studio (Gemini) or OpenAI.
3. **Firebase Firestore Key:** Create a free project on [Firebase Console](https://console.firebase.google.com/), turn on Firestore Database, and download the `firebase-key.json` file.

---

### Step 2: Setup the Backend (Python/FastAPI)
The backend is the server engine written in Python.

1. Open your terminal in the `backend/` folder:
   ```bash
   cd backend
   ```
2. Create a virtual python environment and activate it:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install fastapi uvicorn google-auth-oauthlib google-api-python-client google-generativeai firebase-admin python-dotenv
   ```
4. Create a `.env` file inside `backend/` and fill in your keys:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   AI_API_KEY=your_gemini_or_openai_api_key_here
   FIREBASE_CREDENTIALS_PATH=firebase/firebase-key.json
   ```

---

### Step 3: Setup the Database (Firebase Firestore)
- Firestore is used to save:
  - User profiles (Name, Email)
  - User settings (Preferred reply tone: Professional vs Friendly)
  - Activity log (e.g., *"10:30 AM: Generated summary for email #42"*)
  - AI history
- **Note:** Real email messages stay in Gmail. Firestore only saves app settings and logs!

---

### Step 4: Setup the Frontend (React App)
The frontend is the visual app you see in your browser.

1. Open a new terminal in the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install axios lucide-react react-router-dom
   ```
3. Create a `.env` file inside `frontend/`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

---

### Step 5: Run the Project

1. **Start Backend (Terminal 1):**
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```
2. **Start Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm start
   ```
3. Open `http://localhost:3000` in your web browser and click **"Connect Gmail"**.

---

## 2. Process & Workflows

### Standard User Flow:
1. **Connect Gmail:** User logs in via Google OAuth popup.
2. **Fetch Inbox:** App requests recent emails from Gmail API.
3. **Analyze:** User opens an email and clicks AI actions:
   - `[ Summarize ]` -> AI extracts main points, dates, and deadlines.
   - `[ Extract Actions ]` -> AI turns email into a task checkbox list.
   - `[ Generate Reply ]` -> AI drafts a reply based on tone (Professional / Friendly).
4. **Edit & Send:** User edits the text box and clicks `[ Send ]`. Email is sent through Gmail API.

---

## 3. Critical Cautions & Safety Rules ⚠️

> [!CAUTION]
> **Safety Rules to Never Break:**

1. 🛑 **Never Ask for Passwords:** Users must sign in via official Google OAuth screens. Never create password input boxes for Gmail passwords.
2. 🛑 **Never Auto-Send AI Emails:** The AI must NEVER send an email on its own without a human clicking "Send". Always force a review/edit screen.
3. 🛑 **Never Push Keys to GitHub:** Never upload `.env` or `firebase-key.json` files to public GitHub repositories. Use `.gitignore`.
4. 🛑 **Keep Refresh Tokens on Backend:** Never send Google OAuth refresh tokens to the browser frontend. Keep them safe in backend server memory or encrypted database storage.

---

## 4. Limitations & What to Watch Out For ⚠️

1. ⚠️ **Gmail API Quotas:** Google limits how many requests your app can make per second. Fetching thousands of emails at once will temporarily block API requests.
2. ⚠️ **Google OAuth Unverified App Warning:** During testing, Google will show a warning screen saying *"App is unverified"*. Click *Advanced -> Proceed to IntelliMail* to test.
3. ⚠️ **AI Hallucinations:** AI can occasionally mistake or misread dates in vague emails (e.g., "See you next Tuesday"). Always double-check dates before confirming.
4. ⚠️ **Firestore Search Limits:** Firestore doesn't do complex text searches well. Always use Gmail API search features (`from:professor`, `after:2026/08/01`) to search emails.

---

## 5. System Architecture & Technical Data Model

### Data Ownership Split
- **Gmail (Source of Truth):** Email contents, threads, labels, unread status, stars, trash.
- **Firestore (App Layer):** User settings, prompt history, activity logs.

### Database Collections Schema

#### `users/{userId}`
```json
{
  "name": "Charan",
  "email": "student@gmail.com",
  "googleId": "1234567890",
  "createdAt": "2026-08-23T10:00:00Z"
}
```

#### `preferences/{userId}`
```json
{
  "defaultTone": "Professional",
  "language": "English",
  "summaryLength": "Concise"
}
```

#### `activity/{activityId}`
```json
{
  "userId": "12345",
  "emailId": "msg_99",
  "action": "REPLY_GENERATED",
  "timestamp": "2026-08-23T12:34:00Z",
  "result": "Success"
}
```

---

## 6. Team Role Division

If working in a 3-4 person team:

- 👤 **Member 1 (Frontend):** Builds the React Dashboard, Inbox list, email reader UI, and reply text editor.
- 👤 **Member 2 (OAuth & Gmail Backend):** Builds Google Login, token handling, Gmail email fetching, search, and send functionality.
- 👤 **Member 3 (AI Engineer):** Writes Python prompts for summarization, reply generation, priority detection, and task extraction.
- 👤 **Member 4 (Database & DevOps):** Sets up Firestore, writes user preference/activity tracking, handles `.env` security, and deploys the app to the web.
