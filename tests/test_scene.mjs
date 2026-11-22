import assert from "node:assert/strict";
import { extractSceneResponse, normalizeSceneObjects, buildLocalDemoScene } from "../scene.js";

const valid = [{kind:"tree",position:[0,0,0],color:"#22aa77",scale:1.5}];
assert.equal(normalizeSceneObjects(valid).length,1);
assert.equal(extractSceneResponse(JSON.stringify({objects:valid})).length,1);
assert.equal(extractSceneResponse("```json\n"+JSON.stringify({objects:valid})+"\n```").length,1);
assert.equal(extractSceneResponse("نص عادي لا يحتوي مشهداً"),null);
assert.equal(extractSceneResponse(null),null);
assert.throws(()=>normalizeSceneObjects([]));
assert.throws(()=>normalizeSceneObjects(Array.from({length:61},()=>valid[0])));
assert.throws(()=>normalizeSceneObjects([{kind:"tree",position:[0,0,41]}]));
assert.throws(()=>normalizeSceneObjects([{kind:"tree",position:[0,0,0],scale:9}]));
assert.throws(()=>normalizeSceneObjects([{kind:"unknown",position:[0,0,0]}]));
assert.throws(()=>normalizeSceneObjects([{kind:"building",position:[0,0,0],floors:13}]));
assert.throws(()=>normalizeSceneObjects([{kind:"box",position:[0,0,0],color:"red"}]));
const partial=normalizeSceneObjects([
 {kind:"tree",position:[1,2,3]},
 {kind:"unknown",position:[0,0,0]},
 {kind:"road",position:[0,0,0],scale:2}
]);
assert.equal(partial.length,2);
assert.equal(partial[0].floors,3);
assert.equal(partial[1].scale,2);
console.log("Scene parser and validation tests passed.");

const cityDemo=buildLocalDemoScene("أنشئ مدينة صغيرة فيها مبانٍ وطرق");
assert.ok(cityDemo.length >= 5);
assert.ok(cityDemo.some(item=>item.kind==="building"));
assert.equal(buildLocalDemoScene("اكتب لي قصيدة"),null);
assert.equal(buildLocalDemoScene(""),null);
const islandDemo=buildLocalDemoScene("جزيرة استوائية");
assert.ok(islandDemo.some(item=>item.kind==="water"));
console.log("Offline Arabic demo scene tests passed.");
