import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

client = TestClient(app)

def test_compose_and_send_email():
    payload = {
        "to": "test-recruiter@techinnovators.com",
        "subject": "Interview Confirmation & Resume Attached",
        "body": "Dear Ananya, I confirm my availability for Wednesday, September 4 at 10:00 AM IST.",
        "threadId": "thread-101"
    }
    response = client.post("/compose/send", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recipient"] == payload["to"]
    assert data["subject"] == payload["subject"]
    assert "id" in data

def test_search_emails():
    # Search for known keyword
    response = client.get("/search?q=interview")
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, list)
    assert len(results) > 0
    assert any("interview" in (r.get("subject", "") + r.get("snippet", "") + r.get("body", "")).lower() for r in results)

def test_schedule_email():
    payload = {
        "to": "hiring-manager@techinnovators.com",
        "subject": "Follow up on Project Submission",
        "body": "Hi, just checking in on the project submission status.",
        "sendAt": "Tomorrow 9:00 AM"
    }
    response = client.post("/compose/schedule", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recipient"] == payload["to"]
    assert data["scheduledFor"] == "Tomorrow 9:00 AM"
