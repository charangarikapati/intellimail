import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", 8000))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "intellimail_default_secret_key_2026")

    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "https://intellimail-api-oy0x.onrender.com/auth/google/callback")

    # The deployed frontend URL — used in OAuth callback redirects
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Comma-separated list of allowed CORS origins (supports multiple domains)
    ALLOWED_ORIGINS: list = [
        o.strip() for o in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,https://intellimailai.vercel.app"
        ).split(",") if o.strip()
    ]

    # Gemini AI key (matches the key name used in .env)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("AI_API_KEY", ""))
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")

    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase/firebase-key.json")
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")

    @property
    def is_demo_mode(self) -> bool:
        """Returns True if live OAuth credentials are not provided."""
        return not bool(self.GOOGLE_CLIENT_ID and self.GOOGLE_CLIENT_SECRET)

settings = Settings()
