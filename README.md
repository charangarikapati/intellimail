# IntelliMail — Intelligent AI Email Assistant

> **Live Demo**: [https://intellimailai.vercel.app](https://intellimailai.vercel.app)  
> **Backend API**: [https://intellimail-api-oy0x.onrender.com](https://intellimail-api-oy0x.onrender.com)

---

## 1. Project Name
**IntelliMail** — Next-Generation AI-Powered Email Assistant Layer for Gmail.

---

## 2. Problem Statement
Modern professionals and students receive dozens to hundreds of emails daily. Reading long threads, identifying urgent tasks, writing professional responses, and keeping track of deadlines requires significant time and mental energy. 

**IntelliMail** solves email overload by combining official **Google Gmail OAuth 2.0** with **Google Gemini AI**. It instantly summarizes long emails, extracts action items with deadlines, generates context-aware reply drafts in custom tones, and organizes your inbox by priority — all while keeping your data private and giving you full human control over sent messages.

---

## 3. Features

### Core Features
- 🔐 **Secure Google OAuth 2.0 Login**: Passwordless, industry-standard authentication directly with Google.
- 📥 **Live Paginated Inbox Sync**: Parallel multi-threaded synchronization of Inbox, Sent, Trash, and Archive folders via Gmail REST API.
- 🤖 **AI Executive Briefings**: Instant 2-sentence executive summaries, key bullet points, and extracted dates/deadlines powered by Google Gemini AI.
- ⚡ **1-Click Smart Quick Replies**: Context-aware response templates generated on-the-fly with tone options (Professional, Friendly, Formal, Concise).
- 💬 **Thread Synthesis & Timeline**: Aggregates multi-participant email conversations into a chronological summary with key decisions and pending questions.
- ⏰ **Snooze & Scheduled Send**: Set smart reminders and schedule future email dispatches.
- 🏷️ **Smart Category Classification**: Automatically classifies incoming emails into *Internship*, *Academic*, *Finance*, or *Important*.
- 🌓 **Dark & Light Mode**: Sleek, modern responsive UI with custom color palettes and smooth glassmorphism.
- 🎮 **High-Fidelity Demo Mode**: Full interactive preview mode for evaluation without requiring immediate Google login.

---

## 4. Technology Stack

- **Frontend**: React 18, Vanilla CSS3 (Custom Design System), Lucide React Icons, Axios
- **Backend**: Python 3.11, FastAPI, Uvicorn, Requests, Pytest
- **Database**: Google Firebase / Firestore (Session management & activity logs)
- **AI & Cloud APIs**: Google Gemini 1.5 Pro / Flash, Google Gmail REST API v1, Google OAuth 2.0

---

## 5. Screenshots

### Login Screen & Value Proposition
![Login Screen](https://raw.githubusercontent.com/dev-intruder/intellimail/main/docs/screenshots/login.png)

### Executive Inbox & Reader View
![Inbox View](https://raw.githubusercontent.com/dev-intruder/intellimail/main/docs/screenshots/inbox.png)

### AI Executive Briefing Modal
![AI Briefing](https://raw.githubusercontent.com/dev-intruder/intellimail/main/docs/screenshots/briefing.png)

---

## 6. Live Demo
🌐 **Frontend (Vercel)**: [https://intellimailai.vercel.app](https://intellimailai.vercel.app)

---

## 7. Backend
⚡ **Backend API Gateway (Render)**: [https://intellimail-api-oy0x.onrender.com](https://intellimail-api-oy0x.onrender.com)

---

## 8. Setup Instructions

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/dev-intruder/intellimail.git
cd intellimail
```

### 2. Backend Setup (FastAPI)
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from environment variables guide
# (See Environment Variables section below)

# Run backend development server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup (React)
```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
# (See Environment Variables section below)

# Run frontend development server
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 9. Environment Variables

> ⚠️ **SECURITY WARNING**: Never commit `.env` files, API keys, OAuth secrets, or credentials to GitHub.

### Backend (`backend/.env`)

| Variable Name | Description | Example / Allowed Values |
|---|---|---|
| `HOST` | Server host address | `127.0.0.1` |
| `PORT` | Server listening port | `8000` |
| `SECRET_KEY` | Application session signing key | *Random string (min 32 chars)* |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web Client ID | `your-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Web Client Secret | `your-client-secret` |
| `GOOGLE_REDIRECT_URI` | Google OAuth redirect URI | `http://127.0.0.1:8000/auth/google/callback` |
| `FRONTEND_URL` | Frontend URL for OAuth redirects | `http://localhost:3000` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed domains | `http://localhost:3000,https://intellimailai.vercel.app` |
| `GEMINI_API_KEY` | Google Gemini AI Studio API Key | `your-gemini-api-key` |
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase service account JSON | `serviceAccountKey.json` |
| `FIREBASE_PROJECT_ID` | Google Firebase Project ID | `your-firebase-project-id` |

### Frontend (`frontend/.env`)

| Variable Name | Description | Example / Allowed Values |
|---|---|---|
| `REACT_APP_API_URL` | URL of the backend FastAPI service | `http://127.0.0.1:8000` |
