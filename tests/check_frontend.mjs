import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");

assert.match(html, /id="exportGLBBtn"/, "GLB export button must exist");
assert.match(html, /<i>0\.6<\/i>/, "editor version label must be current");
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
console.log("Frontend structure and GLB export checks passed.");
