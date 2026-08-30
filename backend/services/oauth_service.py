import os
import json
import secrets
import requests
from typing import Optional, Dict, Any
from config import settings
from firebase.firestore_service import FirestoreService

CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", "session_cache.json")

def load_session_cache() -> Dict[str, Dict[str, Any]]:
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_session_cache(sessions: Dict[str, Dict[str, Any]]) -> None:
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(sessions, f, indent=2)
    except Exception as e:
        print(f"[INFO] Failed to write session cache: {e}")

ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = load_session_cache()

class OAuthService:
    @staticmethod
    def get_authorization_url() -> str:
        """Returns the Google OAuth 2.0 Login URL."""
        if not settings.GOOGLE_CLIENT_ID:
            return "http://localhost:3000/?demo=true"
            
        scopes = [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/gmail.send"
        ]
        
        scope_str = "%20".join(scopes)
        auth_url = (
            "https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={settings.GOOGLE_CLIENT_ID}&"
            f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
            "response_type=code&"
            f"scope={scope_str}&"
            "access_type=offline&"
            "prompt=consent"
        )
        return auth_url

    @staticmethod
    async def exchange_code_for_tokens(code: str) -> Optional[Dict[str, Any]]:
        """Exchanges Google authorization code for access & refresh tokens."""
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            return None

        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }

        try:
            res = requests.post(token_url, data=payload, timeout=12)
            if res.status_code != 200:
                print(f"[ERROR] Token exchange failed ({res.status_code}): {res.text}")
                return None
            token_data = res.json()
            access_token = token_data.get("access_token")
            
            # Fetch user profile
            profile = OAuthService.get_user_profile(access_token)
            if not profile:
                return None

            session_token = secrets.token_hex(32)
            session_info = {
                "sessionToken": session_token,
                "accessToken": access_token,
                "refreshToken": token_data.get("refresh_token"),
                "expiresIn": token_data.get("expires_in"),
                "user": profile,
                "isDemo": False
            }
            ACTIVE_SESSIONS[session_token] = session_info
            save_session_cache(ACTIVE_SESSIONS)

            # Log to Firestore
            try:
                await FirestoreService.save_user_tokens(
                    user_id=profile["email"],
                    tokens=session_info
                )
            except Exception as fe:
                print(f"[INFO] Firestore session log: {fe}")

            return session_info
        except Exception as e:
            print(f"[ERROR] OAuth exchange error: {e}")
            return None

    @staticmethod
    def get_user_profile(access_token: str) -> Optional[Dict[str, Any]]:
        """Fetches user details using access token."""
        try:
            res = requests.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10
            )
            if res.status_code == 200:
                data = res.json()
                return {
                    "userId": data.get("id", "google-user"),
                    "name": data.get("name", "Google User"),
                    "email": data.get("email", ""),
                    "avatar": data.get("picture", ""),
                    "isDemo": False
                }
        except Exception as e:
            print(f"[ERROR] Failed to fetch Google userinfo: {e}")
        return None

    @staticmethod
    def get_session(session_token: Optional[str]) -> Optional[Dict[str, Any]]:
        if not session_token:
            return None
        # Reload cache if missing in memory
        if session_token not in ACTIVE_SESSIONS:
            cache = load_session_cache()
            ACTIVE_SESSIONS.update(cache)
        return ACTIVE_SESSIONS.get(session_token)

    @staticmethod
    def revoke_session(session_token: str) -> bool:
        if session_token in ACTIVE_SESSIONS:
            del ACTIVE_SESSIONS[session_token]
            save_session_cache(ACTIVE_SESSIONS)
            return True
        return False
