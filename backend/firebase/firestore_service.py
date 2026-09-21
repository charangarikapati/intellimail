import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from config import settings

LOCAL_DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "local_firestore_backup.json")

# In-memory storage fallback
DEFAULT_STORE: Dict[str, List[Dict[str, Any]]] = {
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
    "ai_history": [],
    "emails": [],
    "user_tokens": []
}

def load_local_db() -> Dict[str, List[Dict[str, Any]]]:
    if os.path.exists(LOCAL_DB_FILE):
        try:
            with open(LOCAL_DB_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                for k in DEFAULT_STORE:
                    if k not in data:
                        data[k] = DEFAULT_STORE[k]
                return data
        except Exception as e:
            print(f"[WARN] Failed to load local_firestore_backup.json ({e}). Resetting to default.")
    return DEFAULT_STORE.copy()

def save_local_db(data: Dict[str, List[Dict[str, Any]]]) -> None:
    try:
        with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
    except Exception as e:
        print(f"[ERROR] Failed to save local_firestore_backup.json: {e}")

IN_MEMORY_STORE = load_local_db()

# Firebase Admin SDK setup
db = None
firestore_status = {
    "firestore_active": False,
    "database_created": False,
    "message": "Initializing...",
    "mode": "Persistent Local Database Mode"
}

try:
    import firebase_admin
    from firebase_admin import credentials, firestore

    cred_path = settings.FIREBASE_CREDENTIALS_PATH
    if os.path.exists(cred_path):
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        # Verify and activate live Cloud Firestore
        try:
            db.collection("_health_check").document("status").set({
                "status": "connected",
                "timestamp": datetime.now().isoformat()
            })
            
            # Seed default collections if empty
            db.collection("users").document("user-demo-101").set(DEFAULT_STORE["users"][0], merge=True)
            db.collection("preferences").document("user-demo-101").set(DEFAULT_STORE["preferences"][0], merge=True)
            
            firestore_status = {
                "firestore_active": True,
                "database_created": True,
                "message": "Connected to live Google Cloud Firestore database.",
                "mode": "Live Cloud Firestore Database"
            }
            print("[OK] Firebase Cloud Firestore connected successfully! Collections initialized.")
        except Exception as db_err:
            error_str = str(db_err)
            if "504" in error_str or "NotFound" in error_str or "does not exist" in error_str.lower():
                firestore_status = {
                    "firestore_active": False,
                    "database_created": False,
                    "message": "Firebase Credentials valid, but Firestore Database has not been created yet in Firebase Console.",
                    "mode": "Persistent Local Database Mode (Fallback)"
                }
                print("[WARN] Firestore Database has not been created in Firebase Console yet.")
            else:
                firestore_status = {
                    "firestore_active": False,
                    "database_created": False,
                    "message": f"Firestore connection test error: {error_str}",
                    "mode": "Persistent Local Database Mode (Fallback)"
                }
                print(f"[WARN] Firestore connection error: {db_err}")
    else:
        firestore_status = {
            "firestore_active": False,
            "database_created": False,
            "message": f"Firebase credentials file ({cred_path}) not found. Running in persistent local storage mode.",
            "mode": "Persistent Local Database Mode"
        }
        print("[INFO] Firebase credentials file not found. Running persistent local database mode.")
except Exception as e:
    firestore_status = {
        "firestore_active": False,
        "database_created": False,
        "message": f"Firebase initialization skipped ({e}). Running in persistent local mode.",
        "mode": "Persistent Local Database Mode"
    }
    print(f"[INFO] Firebase initialization skipped ({e}). Running persistent local mode.")


class FirestoreService:
    @staticmethod
    def get_status() -> Dict[str, Any]:
        return firestore_status

    @staticmethod
    async def log_activity(user_id: str, email_id: str, action: str, result: str = "Success") -> Dict[str, Any]:
        doc_data = {
            "userId": user_id,
            "emailId": email_id,
            "action": action,
            "timestamp": datetime.now().isoformat(),
            "result": result
        }
        if db and firestore_status["firestore_active"]:
            try:
                db.collection("activity").add(doc_data)
            except Exception as e:
                print(f"[INFO] Firestore activity log write: {e}")

        doc_data["activityId"] = f"act-{len(IN_MEMORY_STORE.get('activity', [])) + 1}"
        if "activity" not in IN_MEMORY_STORE:
            IN_MEMORY_STORE["activity"] = []
        IN_MEMORY_STORE["activity"].insert(0, doc_data)
        save_local_db(IN_MEMORY_STORE)
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
        if db and firestore_status["firestore_active"]:
            try:
                db.collection("ai_history").add(doc_data)
            except Exception as e:
                print(f"[INFO] Firestore ai_history write: {e}")

        doc_data["historyId"] = f"hist-{len(IN_MEMORY_STORE.get('ai_history', [])) + 1}"
        if "ai_history" not in IN_MEMORY_STORE:
            IN_MEMORY_STORE["ai_history"] = []
        IN_MEMORY_STORE["ai_history"].insert(0, doc_data)
        save_local_db(IN_MEMORY_STORE)
        return doc_data

    @staticmethod
    async def get_preferences(user_id: str) -> Dict[str, Any]:
        if db and firestore_status["firestore_active"]:
            try:
                doc = db.collection("preferences").document(user_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception:
                pass

        for pref in IN_MEMORY_STORE.get("preferences", []):
            if pref.get("userId") == user_id:
                return pref
        return {"userId": user_id, "defaultTone": "Professional", "language": "English", "summaryLength": "Concise"}

    @staticmethod
    async def save_preferences(user_id: str, tone: str, language: str = "English", summary_length: str = "Concise") -> Dict[str, Any]:
        pref_data = {"userId": user_id, "defaultTone": tone, "language": language, "summaryLength": summary_length}
        if db and firestore_status["firestore_active"]:
            try:
                db.collection("preferences").document(user_id).set(pref_data)
            except Exception as e:
                print(f"[INFO] Firestore save pref error: {e}")

        if "preferences" not in IN_MEMORY_STORE:
            IN_MEMORY_STORE["preferences"] = []

        updated = False
        for p in IN_MEMORY_STORE["preferences"]:
            if p.get("userId") == user_id:
                p.update(pref_data)
                updated = True
                break
        if not updated:
            IN_MEMORY_STORE["preferences"].append(pref_data)

        save_local_db(IN_MEMORY_STORE)
        return pref_data

    @staticmethod
    async def save_user_tokens(user_id: str, tokens: Dict[str, Any]) -> None:
        if db and firestore_status["firestore_active"]:
            try:
                db.collection("user_tokens").document(user_id).set(tokens)
            except Exception as e:
                print(f"[INFO] Firestore token save: {e}")

        if "user_tokens" not in IN_MEMORY_STORE:
            IN_MEMORY_STORE["user_tokens"] = []

        existing = False
        for item in IN_MEMORY_STORE["user_tokens"]:
            if item.get("userId") == user_id:
                item["tokens"] = tokens
                item["updatedAt"] = datetime.now().isoformat()
                existing = True
                break
        if not existing:
            IN_MEMORY_STORE["user_tokens"].append({
                "userId": user_id,
                "tokens": tokens,
                "updatedAt": datetime.now().isoformat()
            })

        save_local_db(IN_MEMORY_STORE)

    @staticmethod
    async def get_user_tokens(user_id: str) -> Optional[Dict[str, Any]]:
        if db and firestore_status["firestore_active"]:
            try:
                doc = db.collection("user_tokens").document(user_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                print(f"[INFO] Firestore token get: {e}")

        for item in IN_MEMORY_STORE.get("user_tokens", []):
            if item.get("userId") == user_id:
                return item.get("tokens")
        return None

    @staticmethod
    async def save_custom_email(email_dict: Dict[str, Any]) -> None:
        if db and firestore_status["firestore_active"]:
            try:
                db.collection("emails").document(email_dict.get("id", str(datetime.now().timestamp()))).set(email_dict)
            except Exception as e:
                print(f"[INFO] Firestore custom email save: {e}")

        if "emails" not in IN_MEMORY_STORE:
            IN_MEMORY_STORE["emails"] = []
        IN_MEMORY_STORE["emails"].insert(0, email_dict)
        save_local_db(IN_MEMORY_STORE)

