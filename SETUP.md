# 🚀 Running IntelliMail Locally — Step-by-Step Setup Guide

This guide will walk you through setting up and running **IntelliMail** on your local machine.

---

## 📋 Prerequisites

Before starting, make sure you have the following installed:

- **Python**: Version 3.10 or higher (`python --version`)
- **Node.js**: Version 18.0 or higher (`node -v`)
- **npm**: Version 8.0 or higher (`npm -v`)
- **Git**

---

## 📁 Project Overview

```text
IntelliMail/
├── backend/          # FastAPI Python Server
├── frontend/         # React.js Web Application
├── spec.md           # Master Project Specification
├── README.md         # General Overview & System Architecture
└── SETUP.md          # Local Setup Guide (This file)
```

---

## ⚡ Quick Start (Demo Mode)

IntelliMail includes a **Built-in Demo Mode**. You can run and explore the full frontend UI, inbox, email reader, AI summarization, reply generation, action extraction, and priority features **immediately** without configuring any Google OAuth or AI keys!

---

## 🛠️ Step 1: Backend Setup (FastAPI)

1. Open your terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   # Windows:
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your environment configuration file:
   - Copy `.env.example` to `.env`:
     ```bash
     # Windows PowerShell:
     Copy-Item .env.example .env

     # macOS/Linux:
     cp .env.example .env
     ```
   - *Optional:* Fill in your Google OAuth Client ID/Secret, Gemini/OpenAI API key, and Firebase key path. (If left blank, the system automatically runs in high-fidelity **Demo Mode**).

5. Start the FastAPI backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   - Server running at: `http://localhost:8000`
   - Interactive API Docs at: `http://localhost:8000/docs`

---

## 🎨 Step 2: Frontend Setup (React)

1. Open a **new terminal window** and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create frontend environment configuration:
   - Copy `.env.example` to `.env`:
     ```bash
     # Windows PowerShell:
     Copy-Item .env.example .env

     # macOS/Linux:
     cp .env.example .env
     ```

4. Start the React development server:
   ```bash
   npm start
   ```
   - Application opening at: `http://localhost:3000`

---

## 🔑 Step 3: Configuring Live Google OAuth & AI Keys (Optional)

When you are ready to connect to your real Gmail account and live AI model:

### 1. Google OAuth Credentials:
- Go to [Google Cloud Console](https://console.cloud.google.com/).
- Enable **Gmail API**.
- Configure OAuth Consent Screen & add test users.
- Create OAuth 2.0 Client ID (Web Application):
  - Authorized Redirect URI: `http://localhost:8000/auth/callback`
  - Authorized JavaScript Origin: `http://localhost:3000`
- Copy Client ID & Client Secret into `backend/.env`:
  ```env
  GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your_client_secret
  ```

### 2. AI Model API Key:
- Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/) or an OpenAI API Key.
- Add key to `backend/.env`:
  ```env
  AI_API_KEY=your_ai_key_here
  AI_PROVIDER=gemini  # or openai
  ```

### 3. Firebase Firestore (Optional):
- Download your private key JSON from Firebase Console → Project Settings → Service Accounts.
- Save as `backend/firebase/firebase-key.json`.
- Add path to `backend/.env`:
  ```env
  FIREBASE_CREDENTIALS_PATH=firebase/firebase-key.json
  ```

---

## 🧪 Step 4: Testing & Verification

1. **Verify Backend Health**: Open `http://localhost:8000/` in browser; should return `{"status": "online", "mode": "..."}`.
2. **Verify Frontend UI**: Open `http://localhost:3000`. You should see the dark mode IntelliMail inbox.
3. **Test AI Actions**: Click on any email in the inbox list, then click `[ Summarize ]`, `[ Explain ]`, `[ Action Items ]`, or `[ Generate Reply ]`.
4. **Test Compose**: Click `+ New Email` in the sidebar, type a recipient, subject, and message, and click `Send`.

---

## ❓ Troubleshooting & FAQs

- **"npm command not found" on Windows right after installing Node.js?**
  Open a **new terminal tab** or run this command in PowerShell to refresh environment variables:
  ```powershell
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
  ```
  Or run npm directly using full path: `& "C:\Program Files\nodejs\npm.cmd" start`.

- **Port 8000 or 3000 already in use?**
  Change the port in `backend/.env` (e.g. `PORT=8080`) and update `REACT_APP_BACKEND_URL` in `frontend/.env`.

- **Python virtualenv permissions on Windows?**
  Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` in PowerShell.

- **npm install errors?**
  Run `npm install --legacy-peer-deps`.
