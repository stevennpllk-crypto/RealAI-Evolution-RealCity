import * as THREE from "three";
import { extractSceneResponse, normalizeSceneObjects, buildLocalDemoScene } from "./scene.js";

const $ = id => document.getElementById(id);
const viewport = $("viewport");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1425);
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 300);
let theta = .75, phi = 1.02, radius = 17, target = new THREE.Vector3(0, 1, 0);
function orbit() {
  camera.position.set(target.x + radius * Math.sin(phi) * Math.sin(theta), target.y + radius * Math.cos(phi), target.z + radius * Math.sin(phi) * Math.cos(theta));
  camera.lookAt(target);
}
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewport.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xc8dcff, 0x26334a, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(8, 14, 7); sun.castShadow = true; scene.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x17283b, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -.08; ground.receiveShadow = true; scene.add(ground);
const grid = new THREE.GridHelper(50, 50, 0x3b5478, 0x243750); grid.position.y = -.06; scene.add(grid);
let objects = [], pointer = null;
const mat = color => new THREE.MeshStandardMaterial({ color, roughness: .78 });
function clearScene() {
  for (const object of objects) {
    scene.remove(object);
    object.traverse?.(n => {
      n.geometry?.dispose?.();
      if (n.material) for (const m of (Array.isArray(n.material) ? n.material : [n.material])) m.dispose?.();
    });
  }
  objects = []; updateCount();
}
function addMesh(geometry, color, name, x, y, z) {
  const mesh = new THREE.Mesh(geometry, mat(color));
  mesh.name = name; mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh); objects.push(mesh); return mesh;
}
function addTree(x, z, color = "#29966b") {
  const group = new THREE.Group(); group.name = "شجرة";
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.13, .18, 1.1, 8), mat("#76513a")); trunk.position.y = .55;
  const crown = new THREE.Mesh(new THREE.ConeGeometry(.72, 1.9, 9), mat(color)); crown.position.y = 1.9;
  group.add(trunk, crown); group.position.set(x, 0, z);
  group.traverse(n => { if (n.isMesh) n.castShadow = true; });
  scene.add(group); objects.push(group);
}
function addBuilding(x, z, color = "#7187ae", floors = 3) {
  floors = Math.max(1, Math.min(12, Number(floors) || 3));
  const group = new THREE.Group(); group.name = "مبنى";
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, floors * 1.15, 1.7), mat(color)); body.position.y = floors * .575; group.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.85, .15, 1.85), mat("#c7d4e8")); roof.position.y = floors * 1.15 + .08; group.add(roof);
  for (let y = 0; y < floors; y++) for (const xw of [-.48, .48]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(.28, .3, .035), mat("#9bd8f5"));
    win.position.set(xw, y * 1.15 + .55, .87); group.add(win);
  }
  group.position.set(x, 0, z);
  group.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
  scene.add(group); objects.push(group);
}
function createObjects(list) {
  const valid = normalizeSceneObjects(list);
  clearScene();
  for (const o of valid) {
    const [x, y, z] = o.position, color = o.color, kind = o.kind, scale = o.scale;
    if (kind === "tree") { addTree(x, z, color); objects.at(-1).scale.setScalar(scale); }
    else if (kind === "building") { addBuilding(x, z, color, o.floors); objects.at(-1).scale.setScalar(scale); }
    else if (kind === "sphere") { const m = addMesh(new THREE.SphereGeometry(.75, 24, 16), color, o.name, x, y, z); m.scale.setScalar(scale); }
    else if (kind === "road") { const m = addMesh(new THREE.BoxGeometry(5, .12, 1.2), color, o.name, x, y, z); m.scale.setScalar(scale); }
    else if (kind === "water") { const m = addMesh(new THREE.BoxGeometry(5, .08, 5), color, o.name, x, y, z); m.material.transparent = true; m.material.opacity = .78; m.scale.setScalar(scale); }
    else { const m = addMesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), color, o.name, x, y, z); m.scale.setScalar(scale); }
  }
  target.set(0, 1, 0); theta = .75; phi = 1.02; radius = 17; orbit();
  $("emptyPreview").hidden = true; updateCount(); $("previewStatus").textContent = "تم تحديث المعاينة";
}
function updateCount() {
  $("objectCount").textContent = objects.length ? objects.length + " عناصر" : "مشهد فارغ";
  if (!objects.length) $("emptyPreview").hidden = false;
}
function resize() {
  const w = Math.max(1, viewport.clientWidth), h = Math.max(1, viewport.clientHeight);
  camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
}
new ResizeObserver(resize).observe(viewport); resize(); orbit();
renderer.domElement.addEventListener("pointerdown", e => { pointer = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener("pointermove", e => {
  if (!pointer) return;
  theta -= (e.clientX - pointer.x) * .008;
  phi = Math.max(.2, Math.min(1.5, phi + (e.clientY - pointer.y) * .008));
  pointer = { x: e.clientX, y: e.clientY }; orbit();
});
window.addEventListener("pointerup", () => pointer = null);
renderer.domElement.addEventListener("wheel", e => { radius = Math.max(5, Math.min(45, radius + e.deltaY * .015)); orbit(); }, { passive: true });
$("resetView").onclick = () => { theta = .75; phi = 1.02; radius = 17; orbit(); };

function addMessage(role, text) {
  const article = document.createElement("article"); article.className = "message " + role;
  const avatar = document.createElement("div"); avatar.className = "avatar"; avatar.textContent = role === "user" ? "أنت" : "J";
  const bubble = document.createElement("div"); bubble.className = "bubble";
  const p = document.createElement("p"); p.textContent = text; bubble.appendChild(p);
  const time = document.createElement("span"); time.className = "message-time"; time.textContent = role === "user" ? "أنت" : "JASSIM";
  bubble.appendChild(time); article.append(avatar, bubble); $("messages").appendChild(article);
  $("messages").scrollTop = $("messages").scrollHeight; return article;
}

const gateway = $("gatewayUrl");
const DEFAULT_JASSIM_SERVER = "https://jassim-ai-core-final-production.up.railway.app";
gateway.value = localStorage.getItem("jassimGatewayUrl") || DEFAULT_JASSIM_SERVER;
let gatewayReady = false, gatewayVerified = false;
function connectionLabel() {
  if (gatewayVerified) return "تم اختبار رد JASSIM بنجاح";
  if (gatewayReady) return "الخادم متاح؛ سجّل الدخول لتفعيل المحادثة";
  return gateway.value.trim() ? "عنوان محفوظ، لم يتم التحقق" : "لم يتم إعداد الخادم";
}
async function verifyGateway(base) {
  gatewayReady = false; gatewayVerified = false;
  if (!base) { $("connectionStatus").textContent = connectionLabel(); return false; }
  $("connectionStatus").textContent = "جارٍ التحقق من الخادم…";
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(base + "/health", { method: "GET", cache: "no-store", signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    gatewayReady = response.ok && data.ok === true && data.service === "JASSIM AI";
    $("connectionStatus").textContent = gatewayReady ? "خادم JASSIM متاح؛ يلزم تسجيل الدخول" : "تعذر الوصول إلى خادم JASSIM";
    return gatewayReady;
  } catch {
    $("connectionStatus").textContent = "تعذر التحقق من خادم JASSIM"; return false;
  } finally { clearTimeout(timer); }
}

$("connectionStatus").textContent = connectionLabel();
if (sessionStorage.getItem("jassimSessionToken")) $("loginStatus").textContent = "توجد جلسة محفوظة لهذا التبويب؛ ستُستخدم تلقائياً.";
$("loginJassim").onclick = async () => {
  const base = gateway.value.trim().replace(/\/+$/, "");
  const email = $("accountEmail").value.trim(), password = $("accountPassword").value;
  if (!base || !email || !password) { $("loginStatus").textContent = "أدخل البريد وكلمة المرور لحساب JASSIM."; return; }
  $("loginJassim").disabled = true; $("loginStatus").textContent = "جارٍ تسجيل الدخول إلى خادم JASSIM…";
  try {
    const response = await fetch(base + "/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }), cache: "no-store"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data.token !== "string" || !data.token) throw new Error(data.error || "تعذر تسجيل الدخول (" + response.status + ")");
    sessionStorage.setItem("jassimSessionToken", data.token);
    $("accountPassword").value = "";
    gateway.value = base; localStorage.setItem("jassimGatewayUrl", base);
    gatewayReady = true; gatewayVerified = false;
    $("loginStatus").textContent = "تم تسجيل الدخول إلى JASSIM بنجاح. يمكنك بدء المحادثة.";
    $("connectionStatus").textContent = "تم الاتصال بحساب JASSIM";
    // Keep the settings panel state unchanged; avoid DOM open-property access during login.
  } catch (error) {
    sessionStorage.removeItem("jassimSessionToken");
    $("loginStatus").textContent = "فشل تسجيل الدخول: " + error.message;
  } finally { $("loginJassim").disabled = false; }
};
$("saveGateway").onclick = async () => {
  const value = gateway.value.trim().replace(/\/+$/, "");
  if (value && !/^https?:\/\//i.test(value)) { addMessage("assistant", "يرجى إدخال رابط يبدأ بـ https:// أو http://"); return; }
  gateway.value = value; localStorage.setItem("jassimGatewayUrl", value);
  await verifyGateway(value);
};
verifyGateway(gateway.value.trim().replace(/\/+$/, ""));

let conversationId = "builder-" + (crypto.randomUUID?.() || Date.now());
function setBusy(busy) {
  $("sendBtn").disabled = busy; $("prompt").disabled = busy;
  $("connectionStatus").textContent = busy ? "JASSIM يفكر…" : connectionLabel();
}
async function sendMessage(message) {
  const text = message.trim(); if (!text) return;
  addMessage("user", text); $("prompt").value = ""; $("prompt").style.height = "auto";
  const base = gateway.value.trim().replace(/\/+$/, "");
  if (!base) {
    const demo = buildLocalDemoScene(text);
    if (demo) {
      createObjects(demo); $("previewStatus").textContent = "معاينة محلية تجريبية · ليست مولّدة بالذكاء الاصطناعي";
      addMessage("assistant", "أنشأت معاينة محلية تجريبية. افتح ⚙ وسجّل الدخول إلى حساب JASSIM لتفعيل المحادثة الحقيقية.");
    } else addMessage("assistant", "افتح ⚙ وسجّل الدخول إلى حساب JASSIM لتفعيل المحادثة الحقيقية.");
    return;
  }
  const token = sessionStorage.getItem("jassimSessionToken");
  if (!token) { addMessage("assistant", "يلزم تسجيل الدخول أولاً. افتح ⚙ وأدخل بيانات حساب JASSIM؛ لا ترسل كلمة المرور داخل المحادثة."); return; }
  setBusy(true);
  const waiting = addMessage("assistant", "جارٍ التفكير…");
  waiting.querySelector(".bubble p").classList.add("typing");
  try {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 300000);
    let response;
    try {
      response = await fetch(base + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ message: text, conversation_id: conversationId }),
        signal: controller.signal, cache: "no-store"
      });
    } finally { clearTimeout(timer); }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) sessionStorage.removeItem("jassimSessionToken");
      throw new Error(data.detail || data.error || "تعذر الاتصال بالخادم (" + response.status + ")");
    }
    const answer = typeof data.answer === "string" ? data.answer : typeof data.reply === "string" ? data.reply : "";
    if (!answer.trim()) throw new Error("استجابة الخادم لا تحتوي على نص جواب صالح");
    waiting.remove();
    const sceneData = extractSceneResponse(answer);
    if (sceneData) {
      try { createObjects(sceneData); addMessage("assistant", "أنشأت معاينة من استجابة JASSIM. يمكنك متابعة المحادثة لطلب التعديلات."); }
      catch (err) { addMessage("assistant", "وصلتني استجابة، لكن تعذر تحويلها إلى معاينة: " + err.message + "\n\n" + answer); }
    } else addMessage("assistant", answer);
    if (data.conversation_id) conversationId = data.conversation_id;
    gatewayReady = true; gatewayVerified = true;
  } catch (error) {
    gatewayVerified = false;
    addMessage("assistant", error.name === "AbortError" ? "استغرق الاتصال وقتاً أطول من المتوقع. حاول مرة أخرى." : "تعذر الحصول على رد: " + error.message);
  } finally {
    waiting.remove?.(); setBusy(false); $("prompt").focus();
  }
}
$("chatForm").addEventListener("submit", e => { e.preventDefault(); sendMessage($("prompt").value); });
$("prompt").addEventListener("input", () => {
  $("prompt").style.height = "auto"; $("prompt").style.height = Math.min($("prompt").scrollHeight, 120) + "px";
});
$("prompt").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("chatForm").requestSubmit(); }
});
document.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => {
  $("prompt").value = button.dataset.prompt; $("prompt").focus();
}));
$("newChat").onclick = () => {
  $("messages").replaceChildren(); conversationId = "builder-" + (crypto.randomUUID?.() || Date.now());
  addMessage("assistant", "بدأنا محادثة جديدة. ما الذي تريد بناءه؟"); clearScene();
  $("previewStatus").textContent = "بانتظار وصف البناء";
};
function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); }
animate();
