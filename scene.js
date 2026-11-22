const ALLOWED_KINDS = new Set(["tree", "palm", "island", "rock", "building", "sphere", "road", "water", "box"]);

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
  if (typeof answer !== "string" || !answer.trim()) return null;
  const source = answer.trim();
  const candidates = [];
  const add = value => {
    if (typeof value === "string" && value.trim() && !candidates.includes(value.trim())) candidates.push(value.trim());
  };
  add(source);
  for (const match of source.matchAll(/```(?:json)?\\s*([\\s\\S]*?)\\s*```/gi)) add(match[1]);

  // Extract balanced JSON objects without being confused by braces inside quoted strings.
  for (let start = 0; start < source.length; start++) {
    if (source[start] !== "{" && source[start] !== "[") continue;
    const opening = source[start], closing = opening === "{" ? "}" : "]";
    let depth = 0, quoted = false, escaped = false;
    for (let i = start; i < source.length; i++) {
      const ch = source[i];
      if (quoted) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') quoted = false;
        continue;
      }
      if (ch === '"') { quoted = true; continue; }
      if (ch === opening) depth++;
      else if (ch === closing && --depth === 0) {
        add(source.slice(start, i + 1));
        break;
      }
    }
  }

  const findObjects = (value, seen = new Set(), depth = 0) => {
    if (!value || typeof value !== "object" || depth > 5 || seen.has(value)) return null;
    seen.add(value);
    if (Array.isArray(value)) {
      if (value.length && value.every(item => item && typeof item === "object" && !Array.isArray(item) && "kind" in item)) return value;
      for (const item of value) { const found = findObjects(item, seen, depth + 1); if (found) return found; }
      return null;
    }
    if (Array.isArray(value.objects)) return value.objects;
    for (const key of ["scene", "result", "data", "output", "content", "response"]) {
      if (key in value) { const found = findObjects(value[key], seen, depth + 1); if (found) return found; }
    }
    return null;
  };

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const objects = findObjects(parsed);
      if (objects) {
        try { return normalizeSceneObjects(objects); } catch { /* Try another candidate before failing. */ }
      }
    } catch { /* Continue searching for a valid JSON payload. */ }
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
    add("water", 0, 0, {color:"#1689bd",scale:3});
    add("island", 0, .25, {color:"#d8bd7b",scale:1.8,name:"جزيرة رملية"});
    for (const [x,z] of [[-3,-1],[-2,2],[2,-2],[3,1],[-.5,3],[1,-.5]]) add("palm",x,z,{color:"#239b69",scale:1.15});
    for (const [x,z] of [[-1,-1],[1,1],[3,-2],[-3,2]]) add("rock",x,z,{color:"#777b78",scale:.7});
    add("water", 0, .1, {color:"#38b9d4",scale:.45,name:"بحيرة داخلية"});
    add("box",0,.32,{color:"#d9c17e",scale:.55,name:"شاطئ رملي"});
    add("sphere",-1,.65,{color:"#f2a84a",scale:.28,name:"زهرة استوائية"});
    add("sphere",1,.7,{color:"#e96b82",scale:.25,name:"زهرة استوائية"});
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
