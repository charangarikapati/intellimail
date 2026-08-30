import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "IntelliMail" in data["app"]

def test_get_google_auth_url():
    response = client.get("/auth/google/url")
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert "isDemo" in data

def test_get_current_user():
    response = client.get("/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["userId"] == "user-demo-101"
    assert data["email"] == "user@gmail.com"

def test_disconnect_account():
    response = client.post("/auth/disconnect")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
