import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { buildLocalDemoScene, extractSceneResponse } from "../scene.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");

assert.match(html, /id="messages"/, "chat message list must exist");
assert.match(html, /id="chatForm"/, "chat form must exist");
assert.match(html, /id="prompt"/, "chat prompt must exist");
assert.match(html, /id="sendBtn"/, "send button must exist");
assert.match(html, /id="viewport"/, "live 3D preview must exist");
assert.match(html, /id="gatewayUrl"/, "private server setting must exist");
assert.match(html, /id="loginJassim"/, "JASSIM account login must exist");
assert.match(html, /id="accountEmail"/, "JASSIM account email field must exist");
assert.match(html, /id="accountPassword"/, "JASSIM account password field must exist");
assert.match(html, /class="studio"/, "main workspace must contain the chat and preview");
assert.match(html, /class="chat-panel"/, "chat panel must exist");
assert.match(html, /class="preview-panel"/, "preview panel must exist");

assert.doesNotMatch(html, /tools-panel|properties-panel|addBox|exportGLBBtn|importGLBBtn|undoBtn|redoBtn|data-template/, "old editor tool panels and controls must be removed");
assert.doesNotMatch(html, /TransformControls|buildingFloors|sculptBtn/, "advanced editor UI must be removed");

assert.match(app, /new THREE\.WebGLRenderer/, "Three.js preview renderer must be initialized");
assert.match(app, /function createObjects\(list\)/, "scene response must create preview objects");
assert.match(app, /function addPalm\(x, z, color/, "Three.js renderer must create tropical palm trees");
assert.match(app, /kind === "island"/, "Three.js renderer must create raised island terrain");
assert.match(app, /kind === "rock"/, "Three.js renderer must create decorative rocks");
assert.match(app, /tree\\\|palm\\\|island\\\|rock/, "scene generation prompt must advertise tropical scene object types");
assert.match(app, /extractSceneResponse/, "AI scene JSON must use the tested scene parser");
assert.match(app, /محرك إنشاء مشاهد ثلاثية الأبعاد/, "build requests must explicitly ask JASSIM for structured 3D scene output");
assert.match(app, /أنشئ من 8 إلى 24 عنصراً/, "scene requests must ask for a useful multi-object scene");
assert.match(app, /const fallbackScene = buildLocalDemoScene\(text\)/, "a local demo preview must prevent a blank viewport when the model returns prose only");
assert.match(app, /لم يُرجع النموذج بيانات مشهد/, "local fallback previews must be labeled honestly");
assert.match(app, /normalizeSceneObjects/, "scene objects must be validated before rendering");
assert.match(app, /fetch\(base\s*\+\s*"\/api\/chat"/, "chat must call the private JASSIM server directly");
assert.match(app, /"Authorization":\s*"Bearer "\s*\+\s*token/, "chat must use the authenticated JASSIM session");
assert.match(app, /fetch\(base\s*\+\s*"\/api\/auth\/login"/, "login must authenticate against JASSIM directly");
assert.doesNotMatch(app, /\.open\s*=\s*false/, "login must not mutate a possibly missing settings details element");
assert.match(html, /app\.js\?v=login-fix-2/, "login fix must use a cache-busted frontend module URL");
assert.match(app, /sessionStorage\.setItem\("jassimSessionToken"/, "session token must stay in tab-scoped storage");
assert.match(app, /DEFAULT_JASSIM_SERVER\s*=\s*"https:\/\/jassim-ai-core-final-production\.up\.railway\.app"/, "the Railway JASSIM host must be preconfigured");
assert.match(app, /conversation_id:\s*conversationId/, "chat must preserve conversation context");
assert.match(app, /function addMessage\(role,\s*text\)/, "chat messages must be rendered");
assert.match(app, /localStorage\.setItem\("jassimGatewayUrl"/, "JASSIM server URL must be saved locally");
assert.match(app, /AbortController/, "chat requests must have a timeout");
assert.ok(app.includes("async function verifyGateway(base)"), "server health must be checked explicitly");
assert.match(app, /fetch\(base\s*\+\s*"\/health"/, "connection status must use JASSIM health endpoint");
assert.match(app, /data\.ok\s*===\s*true\s*&&\s*data\.service\s*===\s*"JASSIM AI"/, "health must identify the actual JASSIM server");
assert.match(app, /let gatewayReady\s*=\s*false/, "server liveness must be tracked separately from successful inference");
assert.match(app, /الخادم متاح؛ سجّل الدخول لتفعيل المحادثة/, "health must not be presented as proof that model inference works");
assert.match(app, /تم اختبار رد JASSIM بنجاح/, "only a successful chat response may mark JASSIM as verified");
assert.match(app, /if\s*\(!answer\.trim\(\)\)\s*throw new Error\("استجابة الخادم لا تحتوي على نص جواب صالح"\)/, "empty upstream responses must not count as successful inference");
assert.match(app, /عنوان محفوظ، لم يتم التحقق/, "configured URL must not be reported as a live connection");
assert.doesNotMatch(app, /متصل بعنوان خادم/, "UI must not claim connection merely because a URL is saved");
assert.match(app, /data-prompt/, "quick prompt suggestions must be wired");
assert.match(css, /grid-template-columns:minmax\(320px,.9fr\) minmax\(0,1.1fr\)/, "desktop chat and preview must sit side by side");
assert.match(css, /@media\(max-width:760px\)/, "mobile layout must be responsive");

const islandDemo = buildLocalDemoScene("أنشئ جزيرة استوائية فيها أشجار وبحيرة");
assert.ok(Array.isArray(islandDemo) && islandDemo.length >= 6, "island prompt must produce a non-empty local preview");
assert.ok(islandDemo.some(item => item.kind === "water"), "island preview must include water");
assert.ok(islandDemo.some(item => item.kind === "palm"), "island preview must include tropical palms");
assert.ok(islandDemo.some(item => item.kind === "island"), "island preview must include a raised island landform");
assert.ok(islandDemo.some(item => item.kind === "rock"), "island preview must include decorative rocks");
assert.equal(buildLocalDemoScene("اشرح لي قانون نيوتن"), null, "unrelated chat prompts must not create a demo scene");

const parsedScene = extractSceneResponse(JSON.stringify({objects:[
  {kind:"tree",position:[0,0,0],scale:1,color:"#29966b"},
  {kind:"water",position:[2,0,2],scale:2,color:"#268bb5"}
]}));
assert.equal(parsedScene.length, 2, "valid model scene JSON must be parsed and normalized");
assert.equal(extractSceneResponse("هذا شرح نصي فقط ولا يحتوي على مشهد"), null, "plain prose must not be mistaken for scene JSON");

console.log("Chat UI, private gateway, AI scene parsing, and local island fallback checks passed.");
