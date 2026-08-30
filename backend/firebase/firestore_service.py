import os
from typing import Dict, Any, List
from datetime import datetime
from config import settings

# Attempt Firebase Admin SDK setup
db = None
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    
    cred_path = settings.FIREBASE_CREDENTIALS_PATH
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("[OK] Firebase Firestore initialized successfully.")
    else:
        print("[INFO] Firebase credentials file not found. Running in-memory database mode.")
except Exception as e:
    print(f"[INFO] Firebase initialization skipped ({e}). Running in-memory mode.")

# In-memory storage fallback
IN_MEMORY_STORE: Dict[str, List[Dict[str, Any]]] = {
    "users": [
        {
            "userId": "user-demo-101",
            "name": "Charan",
            "email": "user@gmail.com",
            "googleId": "demo-google-id-12345",
            "createdAt": "2026-08-23T10:00:00Z"
        }
    ],
    "preferences": [
        {
            "userId": "user-demo-101",
            "defaultTone": "Professional",
            "language": "English",
            "summaryLength": "Concise"
        }
    ],
    "activity": [
        {
            "activityId": "act-1",
            "userId": "user-demo-101",
            "emailId": "msg-101",
            "action": "SUMMARY_GENERATED",
            "timestamp": "2026-08-23T10:35:00Z",
            "result": "Success"
        }
    ],
    "ai_history": []
}

class FirestoreService:
    @staticmethod
    async def log_activity(user_id: str, email_id: str, action: str, result: str = "Success") -> Dict[str, Any]:
        doc_data = {
            "userId": user_id,
            "emailId": email_id,
            "action": action,
            "timestamp": datetime.now().isoformat(),
            "result": result
        }
        if db:
            try:
                db.collection("activity").add(doc_data)
            except Exception as e:
                print(f"Firestore write error: {e}")
        
        doc_data["activityId"] = f"act-{len(IN_MEMORY_STORE['activity']) + 1}"
        IN_MEMORY_STORE["activity"].insert(0, doc_data)
        return doc_data

    @staticmethod
    async def log_ai_history(user_id: str, email_id: str, action: str, prompt: str, response: str) -> Dict[str, Any]:
        doc_data = {
            "userId": user_id,
            "emailId": email_id,
            "action": action,
            "prompt": prompt,
            "response": response,
            "timestamp": datetime.now().isoformat()
        }
        if db:
            try:
                db.collection("ai_history").add(doc_data)
            except Exception as e:
                print(f"Firestore write error: {e}")
        
        doc_data["historyId"] = f"hist-{len(IN_MEMORY_STORE['ai_history']) + 1}"
        IN_MEMORY_STORE["ai_history"].insert(0, doc_data)
        return doc_data

    @staticmethod
    async def get_preferences(user_id: str) -> Dict[str, Any]:
        if db:
            try:
                doc = db.collection("preferences").document(user_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception:
                pass
        
        for pref in IN_MEMORY_STORE["preferences"]:
            if pref["userId"] == user_id:
                return pref
        return {"userId": user_id, "defaultTone": "Professional", "language": "English", "summaryLength": "Concise"}

    @staticmethod
    async def save_preferences(user_id: str, tone: str, language: str = "English", summary_length: str = "Concise") -> Dict[str, Any]:
        pref_data = {"userId": user_id, "defaultTone": tone, "language": language, "summaryLength": summary_length}
        if db:
            try:
                db.collection("preferences").document(user_id).set(pref_data)
            except Exception as e:
                print(f"Firestore save pref error: {e}")
        
        updated = False
        for p in IN_MEMORY_STORE["preferences"]:
            if p["userId"] == user_id:
                p.update(pref_data)
                updated = True
                break
        if not updated:
            IN_MEMORY_STORE["preferences"].append(pref_data)
        return pref_data

    @staticmethod
    async def save_user_tokens(user_id: str, tokens: Dict[str, Any]) -> None:
        if db:
            try:
                db.collection("user_tokens").document(user_id).set(tokens)
            except Exception as e:
                print(f"[INFO] Firestore token save: {e}")

    @staticmethod
    async def get_user_tokens(user_id: str) -> Optional[Dict[str, Any]]:
        if db:
            try:
                doc = db.collection("user_tokens").document(user_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                print(f"[INFO] Firestore token get: {e}")
        return None
