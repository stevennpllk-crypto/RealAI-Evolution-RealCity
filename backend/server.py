import os
from urllib.parse import urlsplit

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

app = FastAPI(title="JASSIM Builder Gateway", version="0.3.0")

origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:8000").split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

class GenerateRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    conversation_id: str | None = Field(default=None, min_length=1, max_length=128)

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("message must not be blank")
        return value.strip()

    @field_validator("conversation_id")
    @classmethod
    def clean_conversation_id(cls, value: str | None) -> str | None:
        return value.strip() if value else None


def upstream_chat_url() -> str:
    configured = os.getenv("JASSIM_UPSTREAM_URL", "").strip()
    if not configured:
        raise HTTPException(503, "JASSIM upstream is not configured")
    parsed = urlsplit(configured)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise HTTPException(503, "JASSIM upstream URL must be an absolute HTTP(S) URL")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise HTTPException(503, "JASSIM upstream URL contains unsupported components")
    local_hosts = {"localhost", "127.0.0.1", "::1"}
    if parsed.scheme != "https" and parsed.hostname not in local_hosts:
        raise HTTPException(503, "JASSIM upstream must use HTTPS outside localhost")
    path = parsed.path.rstrip("/")
    if not path.endswith("/api/chat"):
        path += "/api/chat"
    return parsed._replace(path=path).geturl()


@app.get("/health")
async def health():
    return {"status": "ok", "upstream_configured": bool(os.getenv("JASSIM_UPSTREAM_URL", "").strip())}


@app.post("/api/ai/generate")
async def generate(body: GenerateRequest):
    url = upstream_chat_url()
    token = os.getenv("JASSIM_API_TOKEN", "").strip()
    if not token:
        raise HTTPException(503, "JASSIM API token is not configured on the gateway")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {"message": body.message}
    if body.conversation_id:
        payload["conversation_id"] = body.conversation_id

    try:
        async with httpx.AsyncClient(timeout=310.0, follow_redirects=False) as client:
            response = await client.post(url, json=payload, headers=headers)
    except httpx.TimeoutException:
        raise HTTPException(504, "JASSIM upstream timed out")
    except httpx.HTTPError:
        raise HTTPException(502, "Could not reach JASSIM upstream")

    if response.status_code in (401, 403):
        raise HTTPException(502, "JASSIM upstream authentication failed; check the gateway token")
    if response.status_code >= 500:
        raise HTTPException(502, "JASSIM upstream is temporarily unavailable")
    if response.status_code >= 400:
        raise HTTPException(502, "JASSIM upstream rejected the request")

    try:
        data = response.json()
    except ValueError:
        raise HTTPException(502, "JASSIM upstream returned non-JSON")
    if not isinstance(data, dict):
        raise HTTPException(502, "JASSIM upstream returned an unexpected response")
    answer = data.get("answer") or data.get("reply")
    if not isinstance(answer, str) or not answer.strip():
        raise HTTPException(502, "JASSIM upstream response did not contain an answer")
    return {"ok": True, "answer": answer, "reply": answer, "conversation_id": data.get("conversation_id")}
