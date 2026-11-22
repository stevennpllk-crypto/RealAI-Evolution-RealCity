import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");

assert.match(html, /id="messages"/, "chat message list must exist");
assert.match(html, /id="chatForm"/, "chat form must exist");
assert.match(html, /id="prompt"/, "chat prompt must exist");
assert.match(html, /id="sendBtn"/, "send button must exist");
assert.match(html, /id="viewport"/, "live 3D preview must exist");
assert.match(html, /id="gatewayUrl"/, "private gateway setting must exist");
assert.match(html, /class="studio"/, "main workspace must contain the chat and preview");
assert.match(html, /class="chat-panel"/, "chat panel must exist");
assert.match(html, /class="preview-panel"/, "preview panel must exist");

assert.doesNotMatch(html, /tools-panel|properties-panel|addBox|exportGLBBtn|importGLBBtn|undoBtn|redoBtn|data-template/, "old editor tool panels and controls must be removed");
assert.doesNotMatch(html, /TransformControls|buildingFloors|sculptBtn/, "advanced editor UI must be removed");

assert.match(app, /new THREE\.WebGLRenderer/, "Three.js preview renderer must be initialized");
assert.match(app, /function createObjects\(list\)/, "scene response must create preview objects");
assert.match(app, /function extractScene\(answer\)/, "AI scene JSON must be extracted from responses");
assert.match(app, /fetch\(base\+"\/api\/ai\/generate"/, "chat must call the configured private JASSIM gateway");
assert.match(app, /conversation_id:conversationId/, "chat must preserve conversation context");
assert.match(app, /function addMessage\(role,text\)/, "chat messages must be rendered");
assert.match(app, /localStorage\.setItem\("jassimGatewayUrl"/, "gateway URL must be saved locally");
assert.match(app, /AbortController/, "chat requests must have a timeout");
assert.ok(app.includes("async function verifyGateway(base)"), "gateway health must be checked explicitly");
assert.ok(app.includes('fetch(base+"/health"'), "connection status must use the gateway health endpoint");
assert.ok(app.includes('data.upstream_configured===true'), "health must confirm an upstream is configured");
assert.match(app, /عنوان محفوظ، لم يتم التحقق/, "configured URL must not be reported as a live connection");
assert.doesNotMatch(app, /متصل بعنوان خادم/, "UI must not claim connection merely because a URL is saved");
assert.match(app, /data-prompt/, "quick prompt suggestions must be wired");
assert.match(css, /grid-template-columns:minmax\(320px,.9fr\) minmax\(0,1.1fr\)/, "desktop chat and preview must sit side by side");
assert.match(css, /@media\(max-width:760px\)/, "mobile layout must be responsive");

console.log("Chat UI, side-by-side preview, private gateway wiring, and scene rendering checks passed.");
