from fastapi.testclient import TestClient
from backend.server import app

client = TestClient(app)

def test_health_is_available_without_upstream(monkeypatch):
    monkeypatch.delenv("JASSIM_UPSTREAM_URL", raising=False)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "upstream_configured": False}

def test_generate_fails_closed_without_upstream(monkeypatch):
    monkeypatch.delenv("JASSIM_UPSTREAM_URL", raising=False)
    response = client.post("/api/ai/generate", json={"message": "مرحبا"})
    assert response.status_code == 503
    assert response.json()["detail"] == "JASSIM upstream is not configured"

def test_empty_message_is_rejected():
    response = client.post("/api/ai/generate", json={"message": ""})
    assert response.status_code == 422

def test_oversized_message_is_rejected():
    response = client.post("/api/ai/generate", json={"message": "x" * 8001})
    assert response.status_code == 422
