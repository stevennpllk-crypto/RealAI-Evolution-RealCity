import httpx
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

def test_empty_and_whitespace_messages_are_rejected():
    for message in ("", "   "):
        response = client.post("/api/ai/generate", json={"message": message})
        assert response.status_code == 422

def test_oversized_message_is_rejected():
    response = client.post("/api/ai/generate", json={"message": "x" * 8001})
    assert response.status_code == 422

def test_gateway_forwards_to_real_jassim_contract(monkeypatch):
    monkeypatch.setenv("JASSIM_UPSTREAM_URL", "https://jassim.example")
    monkeypatch.setenv("JASSIM_API_TOKEN", "test-secret")
    captured = {}

    class FakeResponse:
        status_code = 200
        def json(self):
            return {"answer": "أهلاً بك", "conversation_id": "conv-1"}

    class FakeClient:
        def __init__(self, **kwargs):
            captured["timeout"] = kwargs["timeout"]
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            return False
        async def post(self, url, json, headers):
            captured.update(url=url, json=json, headers=headers)
            return FakeResponse()

    monkeypatch.setattr(httpx, "AsyncClient", FakeClient)
    response = client.post(
        "/api/ai/generate",
        json={"message": "مرحبا", "conversation_id": "conv-1"},
    )
    assert response.status_code == 200
    assert response.json()["answer"] == "أهلاً بك"
    assert captured["url"] == "https://jassim.example/api/chat"
    assert captured["json"] == {"message": "مرحبا", "conversation_id": "conv-1"}
    assert captured["headers"]["Authorization"] == "Bearer test-secret"

def test_gateway_requires_token(monkeypatch):
    monkeypatch.setenv("JASSIM_UPSTREAM_URL", "https://jassim.example")
    monkeypatch.delenv("JASSIM_API_TOKEN", raising=False)
    response = client.post("/api/ai/generate", json={"message": "مرحبا"})
    assert response.status_code == 503

def test_remote_http_upstream_is_rejected(monkeypatch):
    monkeypatch.setenv("JASSIM_UPSTREAM_URL", "http://example.com")
    monkeypatch.setenv("JASSIM_API_TOKEN", "test-secret")
    response = client.post("/api/ai/generate", json={"message": "مرحبا"})
    assert response.status_code == 503
