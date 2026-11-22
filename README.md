# JASSIM AI Studio

واجهة عربية مبسطة تجمع محادثة JASSIM AI ومعاينة بناء ثلاثية الأبعاد بجانبها.

## الواجهة الحالية
- محادثة لإرسال وصف البناء إلى بوابة JASSIM الخاصة.
- معاينة Three.js مع تدوير وتقريب العرض.
- إنشاء عناصر المعاينة عند استلام JSON صالح من رد النموذج.
- إعداد رابط البوابة وحفظه محلياً على الجهاز.
- فحص `GET /health` عند حفظ الرابط؛ لا تعرض الواجهة حالة «الخادم يستجيب» لمجرد حفظ العنوان.
- حالات اتصال تميّز بين الإعداد والتحقق الفعلي.
- تخطيط متجاوب: الدردشة والمعاينة جنباً إلى جنب على الشاشات الواسعة، ومتراصتان على الهاتف.

## تشغيل الواجهة
شغّل خادم ملفات ثابتة من جذر المستودع وافتح الصفحة. تعتمد مكتبة Three.js على jsDelivr، لذا يلزم اتصال إنترنت لتحميلها.

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
- Automatic local persistence stores supported JSON scene data in browser localStorage. Projects containing imported GLB assets cannot be fully auto-saved as JSON; export the scene as GLB to preserve those assets.

This is an early 3D editor prototype, not an AAA engine. AI scene generation depends on a reachable, correctly configured JASSIM server returning the requested JSON structure. Supported AI-generated primitives and grouped objects are assembled by the browser editor; the model does not generate arbitrary mesh topology or textures. GLB export packages the current supported scene objects as a binary glTF asset; GLB import loads a binary asset into the current scene. These flows have not yet been validated in a live browser session. Imported GLB geometry is preserved in GLB export, but is not represented in the editable JSON scene format. APK/Android packaging, PSP/PPSSPP builds, full game runtime, asset pipeline, and a verified live JASSIM inference session are not implemented or verified.

