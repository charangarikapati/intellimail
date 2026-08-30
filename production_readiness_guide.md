# 🛡️ IntelliMail — Live Mode & Production Readiness Guide

This guide walks through configuring **Google Cloud OAuth 2.0**, **Gemini API**, and **Firebase Admin SDK** to transition IntelliMail from High-Fidelity Demo Mode to Live Multi-User Production.

---

## 1. Google Cloud Console & Gmail OAuth 2.0 Setup

### Step A: Create a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and select **New Project**.
3. Name your project (e.g. `IntelliMail-Production`) and click **Create**.

### Step B: Enable Required Google APIs
1. Go to **APIs & Services > Library**.
2. Search for and enable the following APIs:
   - **Gmail API**
   - **Google People API** (for user profile & avatar)
   - **Generative Language API** (for Gemini)

### Step C: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Choose **External** (or Internal if using Google Workspace).
3. Fill in:
   - App Name: `IntelliMail`
   - User Support Email: your email
   - Developer Contact Email: your email
4. In **Scopes for Google APIs**, click **Add or Remove Scopes** and add:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/gmail.send`
5. In **Test Users**, add your Gmail address so you can authenticate during development.

### Step D: Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Select Application type: **Web application**.
4. Set:
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://127.0.0.1:3000`
     - `https://your-production-domain.com`
   - **Authorized redirect URIs**:
     - `http://127.0.0.1:8000/auth/google/callback`
     - `http://localhost:8000/auth/google/callback`
     - `https://your-backend-api.com/auth/google/callback`
5. Click **Create** and copy your **Client ID** and **Client Secret**.

---

## 2. Gemini AI API Key Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **Create API key** (choose your Google Cloud project).
4. Copy your `GEMINI_API_KEY`.

---

## 3. Firebase Firestore & Admin SDK Setup

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and link your existing Google Cloud project.
3. In the left navigation, click **Build > Firestore Database** -> **Create Database** (Start in Production mode or Test mode).
4. Go to **Project Settings (gear icon) > Service accounts**.
5. Click **Generate new private key** and download the JSON file.
6. Rename the downloaded file to `serviceAccountKey.json` and place it inside the `backend/` directory (or set the path in `FIREBASE_CREDENTIALS_PATH`).

---

## 4. Environment Variables Configuration

### Backend `.env` (`backend/.env`)
Create a `.env` file in `backend/` with the following keys:

```env
# Server Config
HOST=127.0.0.1
PORT=8000
SECRET_KEY=generate-a-strong-random-32-byte-hex-string

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback

# Gemini AI
GEMINI_API_KEY=AIzaSy...your-gemini-api-key

# Firebase
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
```

### Frontend `.env` (`frontend/.env`)
Create a `.env` file in `frontend/` with:

```env
REACT_APP_API_URL=http://127.0.0.1:8000
```

---

## 5. Dual-Mode Architecture Reference

IntelliMail features zero-downtime graceful fallback:

| Component | Unset Credentials (Demo Mode) | Provided Credentials (Live Mode) |
| :--- | :--- | :--- |
| **Authentication** | Instant 1-click Demo Login with mock session tokens | Real Google OAuth 2.0 flow with refresh token persistence |
| **Email Retrieval** | Curated high-fidelity mock dataset with realistic threads | Live bidirectional synchronization via Gmail REST API v1 |
| **AI Intelligence** | Heuristic natural language algorithms with deterministic tone shaping | Live Google Gemini 1.5 Pro / Flash generative models |
| **Database** | In-memory thread storage & session cache | Cloud Firestore NoSQL documents with encrypted tokens |

---

## 6. Production Deployment Commands

### Running Backend with Gunicorn / Uvicorn Workers:
```bash
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Building Optimized Frontend Bundle:
```bash
cd frontend
npm run build
```

### Executing Automated Test Suite:
```bash
cd backend
pytest -v
```
