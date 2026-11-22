# Private JASSIM gateway

This FastAPI gateway is an optional server-side adapter. It never embeds the API token in browser code.

Set `JASSIM_UPSTREAM_URL` to the actual JASSIM AI endpoint and optionally `JASSIM_API_TOKEN`. The upstream request contract currently sends JSON `{ "message": "...", "source": "jassim-game-app-builder" }` and is a placeholder until verified against the deployed JASSIM API.

Install: `pip install -r requirements.txt`; run: `uvicorn backend.server:app --host 127.0.0.1 --port 8787`.

No upstream configured returns HTTP 503 (fail-closed). Never commit credentials.