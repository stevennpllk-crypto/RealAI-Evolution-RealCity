import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");

assert.match(html, /id="exportGLBBtn"/, "GLB export button must exist");
assert.match(html, /<i>0\.2\.2<\/i>/, "editor version label must match the current release");
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

assert.match(html, /id="undoBtn"/, "undo control must exist");
assert.match(html, /id="redoBtn"/, "redo control must exist");
assert.match(app, /function cloneForHistory\(object\)/, "history snapshots must deep-clone object geometry and materials");
assert.match(app, /function recordHistory\(\)/, "history checkpoint function must exist");
assert.match(app, /function restoreHistory\(nextIndex\)/, "history restore function must exist");
assert.match(app, /function undo\(\)/, "undo action must exist");
assert.match(app, /function redo\(\)/, "redo action must exist");
assert.match(app, /refresh\(false\);persistLocalProject\(\)/, "undo and redo restores must update the local saved project");
assert.match(app, /let c=cloneForHistory\(selected\)/, "duplicated objects must own cloned geometry and materials");
assert.match(app, /event\.key\.toLowerCase\(\)==="z"/, "Ctrl+Z shortcut must exist");
assert.match(app, /event\.key\.toLowerCase\(\)==="y"/, "Ctrl+Y shortcut must exist");
assert.match(app, /historyBatch\(\(\)=>buildTemplate\(t\)\)/, "template generation must be a single history action");
assert.match(app, /historyBatch\(\(\)=>loadData\(d\)\)/, "project loading must be a single history action");
assert.match(app, /history\.length>40/, "history must have a bounded memory footprint");

assert.match(html, /class="workspace"/, "simplified workspace layout must exist");
assert.match(html, /<details class="section"/, "tools must be grouped into collapsible sections");
assert.match(html, /class="advanced-tools"/, "advanced tools must be tucked away");
assert.match(html, /placeholder="مثلاً: أنشئ جزيرة خضراء/, "AI prompt must include a simple example");
assert.match(html, /id="saveBtn"/, "simple save action must remain available");
assert.match(html, /id="generateBtn"/, "AI scene generation action must remain available");
console.log("Simplified Arabic workspace layout checks passed.");

assert.match(html, /id="projectName"/, "project name field must exist");
assert.ok(app.includes("function persistLocalProject()"), "automatic local persistence must exist");
assert.ok(app.includes("updateHistoryButtons();persistLocalProject()"), "history checkpoints must persist the project");
assert.ok(app.includes('name:($("projectName").value.trim()||"مشروعي الأول")'), "project name must be included in exported project data");
