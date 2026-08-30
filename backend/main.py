from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes import auth, emails, search, ai, compose

app = FastAPI(
    title="IntelliMail Backend Service",
    description="AI-powered email assistant layer built on Gmail REST API and Google OAuth 2.0",
    version="1.0.0"
)

# Configure CORS — origins are set via ALLOWED_ORIGINS env var (comma-separated)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(emails.router)
app.include_router(search.router)
app.include_router(ai.router)
app.include_router(compose.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "IntelliMail API Gateway",
        "version": "1.0.0",
        "mode": "Demo Mode (High Fidelity)" if settings.is_demo_mode else "Live Mode (Connected to OAuth & AI APIs)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
