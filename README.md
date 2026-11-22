# JASSIM GAME & APP BUILDER

Arabic-first experimental project for building app/site concepts and interactive 3D scene prototypes.

## Current milestone
- Browser-based 3D scene editor powered by Three.js.
- Starter scenes: island, city, forest, snow.
- Add/select/rename/move/scale/recolor/duplicate/delete scene objects.
- Local project save and JSON import/export.
- Optional connection to the self-hosted JASSIM AI chat API through a private FastAPI gateway.

## Run the editor
Serve the repository root with `python -m http.server 8000` and open `http://localhost:8000`.

The editor loads Three.js from jsDelivr, so internet access is required for the 3D module.

## Connect your private JASSIM AI server
1. Deploy the gateway in `backend/` on a server you control.
2. Configure these environment variables on the gateway host (never in browser code or Git):
   - `JASSIM_UPSTREAM_URL`: your JASSIM API origin, for example `https://your-private-api.example`. The gateway appends `/api/chat` automatically. You may also provide the full `/api/chat` URL.
   - `JASSIM_API_TOKEN`: the same Bearer token configured on the JASSIM AI server.
   - `CORS_ORIGINS`: exact browser origin(s), comma-separated, such as `http://localhost:8000` or your deployed HTTPS site.
3. Start the gateway with `uvicorn backend.server:app --host 127.0.0.1 --port 8788` behind an HTTPS reverse proxy.
4. In the editor's JASSIM AI panel, enter the gateway's public HTTPS base URL. Only this URL is saved in browser local storage; the API token remains on the gateway server.

The gateway forwards only `message` and optional `conversation_id` to JASSIM AI, sends the Bearer token server-side, and normalizes the upstream `answer` or `reply` field. It rejects remote plain-HTTP upstream URLs. Do not expose the gateway directly without HTTPS and appropriate network controls.

Install dependencies with `pip install -r requirements.txt`.

## Tests
- Backend: `pytest -q`
- Frontend syntax: `npm run check`

GitHub Actions runs both checks on pushes and pull requests to `main`.

## Honest scope
The assistant can return genuine text from the connected JASSIM AI server. Scene selection and construction are still local template-based operations; the model does not yet generate arbitrary 3D geometry. This is an early editor prototype, not an AAA game engine. JSON export is scene data only; APK, PSP/PPSSPP builds, native game packaging, and a verified live JASSIM inference session are not implemented yet.
