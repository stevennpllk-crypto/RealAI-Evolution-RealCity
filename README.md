# JASSIM GAME & APP BUILDER

Arabic-first experimental browser editor for app/site concepts and interactive 3D scene prototypes.

## Current editor features
- Three.js 3D viewport with orbit, zoom, and selection.
- Starter scenes: island, city, forest, snow.
- Scene objects: boxes, spheres, trees, grouped buildings, roads, procedural terrain patches, and water surfaces.
- Road-grid generation and interactive terrain sculpting with raise/lower modes and adjustable brush radius/strength.
- Sculpted terrain vertex heights are preserved in local saves and JSON scene exports, and restored on import.
- Startup restores the last saved project instead of immediately replacing it with the starter island.
- Rename, move, scale, recolor, duplicate, and delete scene objects.
- Local project save, JSON import, and JSON export. Project data preserves supported object types and transforms.
- Optional connection to a self-hosted JASSIM AI chat API through the private FastAPI gateway.
- AI scene responses are parsed as JSON and validated before supported objects are created.

## Run
Serve the repository root with `python -m http.server 8000` and open `http://localhost:8000`. The Three.js module is loaded from jsDelivr, so internet access is required.

## Connect your private JASSIM AI server
1. Run the gateway in `backend/` on a server you control.
2. Configure `JASSIM_UPSTREAM_URL`, `JASSIM_API_TOKEN`, and exact `CORS_ORIGINS` on the gateway host.
3. Start it with `uvicorn backend.server:app --host 127.0.0.1 --port 8788` behind an HTTPS reverse proxy.
4. Enter the gateway's public HTTPS base URL in the editor's JASSIM panel. The API token stays on the server and must never be placed in browser code or Git.

See [backend/README.md](backend/README.md) for security notes and API contract.

## Checks
- `npm run check` — frontend JavaScript syntax.
- `pytest -q` — gateway tests.
- GitHub Actions is configured to run both on pushes and pull requests to `main`.

## Honest scope and limitations
This is an early 3D editor prototype, not an AAA engine. AI scene generation depends on a reachable, correctly configured JASSIM server returning the requested JSON structure. Supported AI-generated primitives and grouped objects are assembled by the browser editor; the model does not generate arbitrary mesh topology or textures. JSON export is scene data only. APK/Android packaging, PSP/PPSSPP builds, full game runtime, asset pipeline, and a verified live JASSIM inference session are not implemented or verified.
