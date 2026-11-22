import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");

assert.match(html, /id="exportGLBBtn"/, "GLB export button must exist");
assert.match(html, /<i>0\.8<\/i>/, "editor version label must be current");
assert.match(app, /async function exportGLB\(\)/, "GLB export handler must exist");
assert.match(html, /id="importGLBBtn"/, "GLB import button must exist");
assert.match(app, /async function importGLBFile\(file\)/, "GLB import handler must exist");
assert.match(app, /examples\/jsm\/loaders\/GLTFLoader\.js/, "GLTFLoader must load on demand");
assert.match(app, /50\*1024\*1024/, "GLB import size must be capped");
assert.match(app, /function pack\(\)\{if\(items\.some\(o=>o\.userData\.kind==="importedAsset"\)\)/, "JSON saves must refuse lossy imported GLB assets");
assert.match(app, /\$\("importGLBBtn"\)\.onclick/, "GLB import button must be wired");
assert.match(app, /examples\/jsm\/exporters\/GLTFExporter\.js/, "GLTFExporter must load on demand");
assert.match(app, /binary:true/, "GLB export must request binary glTF");
assert.match(app, /model\/gltf-binary/, "GLB download must use the binary glTF MIME type");
assert.match(app, /\$\("exportGLBBtn"\)\.onclick=exportGLB/, "GLB button must be wired");

assert.match(app, /function firstMaterialColor\(o\)/, "group inspector must find a nested mesh material");
assert.match(app, /selected\.traverse\(apply\)/, "group color editing must include nested imported GLB meshes");
assert.match(app, /mats\.forEach\(m=>m\.color\?\.set\(color\)\)/, "material arrays must be handled safely");

assert.match(html, /data-transform-mode="translate"/, "translate gizmo mode button must exist");
assert.match(html, /data-transform-mode="rotate"/, "rotate gizmo mode button must exist");
assert.match(html, /data-transform-mode="scale"/, "scale gizmo mode button must exist");
assert.match(app, /examples\/jsm\/controls\/TransformControls\.js/, "TransformControls must load from matching Three.js version");
assert.match(app, /new TransformControls\(camera,renderer\.domElement\)/, "transform gizmo must use the scene camera and canvas");
assert.match(app, /transformControls\.attach\(o\)/, "selected objects must attach to the transform gizmo");
assert.match(app, /transformControls\.detach\(\)/, "gizmo must detach when selection is cleared");
assert.match(app, /transformControls\.setMode\(mode\)/, "toolbar must switch gizmo modes");
assert.match(app, /if\(gizmoUsed\)/, "gizmo drags must not trigger scene selection");
console.log("Frontend structure, GLB import/export, group inspector, and transform gizmo checks passed.");

assert.match(app, /Keyboard shortcuts: W = move, E = rotate, R = scale/, "keyboard shortcut handler must be documented");
assert.match(app, /event\.key\.toLowerCase\(\)==="d"/, "Ctrl+D duplicate shortcut must exist");
assert.match(app, /event\.key==="Delete"/, "Delete shortcut must exist");
assert.match(app, /event\.key==="Escape"/, "Escape selection shortcut must exist");
assert.match(app, /isContentEditable/, "keyboard shortcuts must not intercept contenteditable text");
