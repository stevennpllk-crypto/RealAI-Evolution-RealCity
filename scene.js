const ALLOWED_KINDS = new Set(["tree", "building", "sphere", "road", "water", "box"]);

export function normalizeSceneObjects(input) {
  if (!Array.isArray(input) || input.length === 0 || input.length > 60) {
    throw new Error("قائمة عناصر المشهد يجب أن تحتوي من 1 إلى 60 عنصراً");
  }
  const result = [];
  for (const [index, item] of input.entries()) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const position = item.position;
    if (!Array.isArray(position) || position.length !== 3 ||
        !position.every(value => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 40)) continue;
    const kind = typeof item.kind === "string" ? item.kind.toLowerCase() : "";
    if (!ALLOWED_KINDS.has(kind)) continue;
    const scale = item.scale === undefined ? 1 : item.scale;
    if (typeof scale !== "number" || !Number.isFinite(scale) || scale < 0.2 || scale > 8) continue;
    const floors = item.floors === undefined ? 3 : item.floors;
    if (kind === "building" && (!Number.isInteger(floors) || floors < 1 || floors > 12)) continue;
    const color = item.color === undefined ? "#5688d8" : item.color;
    if (typeof color !== "string" || !/^#[0-9a-f]{6}$/i.test(color)) continue;
    result.push({
      kind, position: [...position], scale, floors,
      color, name: typeof item.name === "string" ? item.name.slice(0, 60) : kind
    });
  }
  if (!result.length) throw new Error("لم أجد عناصر صالحة ومدعومة للمعاينة");
  return result;
}

export function extractSceneResponse(answer) {
  if (typeof answer !== "string") return null;
  const source = answer.trim();
  const candidates = [source];
  const fenced = source.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) candidates.unshift(fenced[1].trim());
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start >= 0 && end > start) candidates.push(source.slice(start, end + 1));
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const objects = Array.isArray(parsed) ? parsed : parsed && parsed.objects;
      if (Array.isArray(objects)) return normalizeSceneObjects(objects);
    } catch {}
  }
  return null;
}


// Deterministic offline preview templates. This is explicitly a demo, not AI inference.
export function buildLocalDemoScene(prompt) {
  if (typeof prompt !== "string" || !prompt.trim()) return null;
  const text = prompt.toLowerCase();
  const items = [];
  const add = (kind, x, z, extra = {}) => items.push({
    kind, position: [x, 0, z], color: "#5688d8", scale: 1, ...extra
  });
  const island = /جزير|island|شاطئ|بحر|استوائ/.test(text);
  const house = /منزل|بيت|فيلا|house|villa/.test(text);
  const city = /مدين|ناطحات|عمارات|مبان|city|buildings/.test(text);
  const garden = /حديق|أشجار|اشجار|غاب|garden|forest/.test(text);
  if (!island && !house && !city && !garden) return null;
  if (island) {
    add("water", 0, 0, {color:"#268bb5",scale:3});
    add("box", 0, .2, {color:"#d7c18a",scale:1.8,name:"رمال الجزيرة"});
    for (const [x,z] of [[-2,-1],[2,-1],[-1,2],[2,2]]) add("tree",x,z,{color:"#29966b"});
    add("building",0,-2,{color:"#e2a85d",floors:1});
  } else if (house) {
    add("building",0,0,{color:"#d8dce5",floors:2,scale:1.5});
    add("road",0,3,{color:"#343b48",scale:1.5});
    add("tree",-2,-1); add("tree",2,-1);
    add("box",-2,2,{color:"#5a9b62",name:"حديقة"});
  } else if (city) {
    for (const [x,z,f] of [[-3,-2,5],[0,-2,8],[3,-2,4],[-3,2,3],[3,2,6]]) add("building",x,z,{floors:f,color:"#7187ae"});
    add("road",0,0,{color:"#343b48",scale:2});
    add("tree",-4,3); add("tree",4,3);
  } else {
    for (const [x,z] of [[-2,-2],[0,-2],[2,-2],[-2,2],[2,2],[0,3]]) add("tree",x,z);
    add("box",0,0,{color:"#5a9b62",scale:2,name:"مساحة خضراء"});
  }
  return normalizeSceneObjects(items);
}
