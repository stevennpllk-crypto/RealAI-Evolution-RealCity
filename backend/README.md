# JASSIM Builder Gateway

This FastAPI service securely bridges the browser editor to the existing self-hosted JASSIM AI API.

## Configuration

Set these variables on the gateway host, not in the browser and not in Git:

- `JASSIM_UPSTREAM_URL`: JASSIM server origin (the gateway appends `/api/chat`) or the complete chat endpoint.
- `JASSIM_API_TOKEN`: the JASSIM server's Bearer token.
- `CORS_ORIGINS`: exact allowed browser origins, comma-separated.

Remote upstreams must use HTTPS. Plain HTTP is accepted only for localhost development.

## Run

```sh
pip install -r requirements.txt
uvicorn backend.server:app --host 127.0.0.1 --port 8788
```

Place the gateway behind an HTTPS reverse proxy. The browser calls `POST /api/ai/generate`; the gateway calls JASSIM `POST /api/chat` with `message`, optional `conversation_id`, and a server-side Bearer token. It accepts either `answer` or `reply` in the upstream JSON response.

`GET /health` is a public liveness endpoint and reports whether an upstream URL is configured. It does not prove that JASSIM is reachable or that inference works.

## Security boundaries

- Never place `JASSIM_API_TOKEN` in frontend JavaScript, HTML, local storage, or committed files.
- Restrict CORS to the exact editor origin.
- Use HTTPS for public traffic and a strong private token.
- Keep the gateway on a private network or behind a trusted reverse proxy with rate limiting.
- This prototype does not implement end-user accounts, per-user quotas, or gateway authentication. Do not expose it as a public unrestricted relay.

Run tests from the repository root with `pytest -q`.
