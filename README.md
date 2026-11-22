# JASSIM GAME & APP BUILDER

Arabic-first experimental project for building app/site concepts and interactive 3D scene prototypes.

## Current milestone
- Browser-based 3D scene editor powered by Three.js.
- Starter scenes: island, city, forest, snow.
- Add/select/rename/move/scale/recolor/duplicate/delete scene objects.
- Local project save and JSON import/export.
- Optional private FastAPI gateway for a JASSIM AI server.

## Run
Serve the repository root with `python -m http.server 8000` and open `http://localhost:8000`.

The editor loads Three.js from jsDelivr, so internet access is required for the 3D module.

## Private AI gateway
See `backend/README.md`. Do not put API tokens in browser code or commit secrets.

## Honest scope
This is an early editor prototype, not an AAA game engine. JSON export is scene data only; APK, PSP/PPSSPP builds, native game packaging, and verified JASSIM inference are not implemented yet.
