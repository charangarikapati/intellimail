import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

client = TestClient(app)

def test_list_emails():
    response = client.get("/emails")
    assert response.status_code == 200
    emails = response.json()
    assert isinstance(emails, list)
    assert len(emails) > 0
    assert "subject" in emails[0]
    assert "sender" in emails[0]

def test_list_emails_by_category():
    response = client.get("/emails?category=Internship")
    assert response.status_code == 200
    emails = response.json()
    assert len(emails) > 0
    for e in emails:
        assert e["category"].lower() == "internship"

def test_get_single_email():
    response = client.get("/emails/msg-101")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "msg-101"
    assert "TechInnovators" in data["body"] or "TechInnovators" in data["sender"]

def test_get_email_thread():
    response = client.get("/emails/msg-101/thread")
    assert response.status_code == 200
    data = response.json()
    assert "threadId" in data
    assert "messages" in data
    assert len(data["messages"]) > 0

def test_star_and_archive_toggle():
    # Toggle star
    star_res = client.post("/emails/msg-101/star")
    assert star_res.status_code == 200
    assert "isStarred" in star_res.json()

    # Toggle archive
    arch_res = client.post("/emails/msg-101/archive")
    assert arch_res.status_code == 200
    assert "isArchived" in arch_res.json()

def test_delete_and_restore_email():
    # Delete
    del_res = client.delete("/emails/msg-101")
    assert del_res.status_code == 200
    assert del_res.json()["isDeleted"] is True

    # Restore
    rest_res = client.post("/emails/msg-101/restore")
    assert rest_res.status_code == 200
    assert rest_res.json()["isDeleted"] is False

def test_snooze_and_unsnooze_email():
    # Snooze
    snooze_res = client.post("/emails/msg-101/snooze", json={"snoozeUntil": "Tomorrow 9:00 AM"})
    assert snooze_res.status_code == 200
    assert snooze_res.json()["isSnoozed"] is True
    assert snooze_res.json()["snoozedUntil"] == "Tomorrow 9:00 AM"

    # Unsnooze
    unsnooze_res = client.post("/emails/msg-101/unsnooze")
    assert unsnooze_res.status_code == 200
    assert unsnooze_res.json()["isSnoozed"] is False
