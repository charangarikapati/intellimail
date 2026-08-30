import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

client = TestClient(app)

SAMPLE_INTERVIEW_EMAIL = """Dear Charan,
Thank you for your application to TechInnovators. We would like to schedule a 45-minute technical interview for Sept 4 at 10:00 AM IST.
Please submit your resume and ID before September 1.
Best, Ananya"""

def test_ai_summarize():
    response = client.post("/ai/summarize", json={
        "emailId": "msg-101",
        "content": SAMPLE_INTERVIEW_EMAIL
    })
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "keyPoints" in data
    assert len(data["keyPoints"]) > 0

def test_ai_generate_reply():
    response = client.post("/ai/generate-reply", json={
        "emailId": "msg-101",
        "content": SAMPLE_INTERVIEW_EMAIL,
        "tone": "Professional"
    })
    assert response.status_code == 200
    data = response.json()
    assert "replyDraft" in data
    assert data["tone"] == "Professional"

def test_ai_explain():
    response = client.post("/ai/explain", json={
        "emailId": "msg-101",
        "content": SAMPLE_INTERVIEW_EMAIL
    })
    assert response.status_code == 200
    data = response.json()
    assert "explanation" in data

def test_ai_extract_actions():
    response = client.post("/ai/extract-actions", json={
        "emailId": "msg-101",
        "content": SAMPLE_INTERVIEW_EMAIL
    })
    assert response.status_code == 200
    data = response.json()
    assert "actionItems" in data
    assert len(data["actionItems"]) > 0
    assert "task" in data["actionItems"][0]

def test_ai_overview_briefing():
    response = client.get("/ai/overview")
    assert response.status_code == 200
    data = response.json()
    assert "totalNew" in data
    assert "highPriority" in data
    assert "todayItems" in data

def test_ai_quick_replies():
    response = client.post("/ai/quick-replies", json={
        "emailId": "msg-101",
        "content": SAMPLE_INTERVIEW_EMAIL
    })
    assert response.status_code == 200
    data = response.json()
    assert "options" in data
    assert len(data["options"]) >= 2
    assert "label" in data["options"][0]
    assert "fullDraft" in data["options"][0]

def test_ai_thread_synthesize():
    response = client.post("/ai/thread-synthesize", json={
        "threadId": "thread-101",
        "messages": [
            {"sender": "HR Team <hr@techinnovators.com>", "snippet": "Interview schedule notice", "body": SAMPLE_INTERVIEW_EMAIL}
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert "overallSummary" in data
    assert "keyDecisions" in data
    assert "timeline" in data

def test_ai_polish_draft():
    response = client.post("/ai/polish-draft", json={
        "content": "I am confirming for the interview.",
        "action": "formalize",
        "tone": "Formal"
    })
    assert response.status_code == 200
    data = response.json()
    assert "polished" in data
    assert data["action"] == "formalize"
    assert len(data["polished"]) > 10
