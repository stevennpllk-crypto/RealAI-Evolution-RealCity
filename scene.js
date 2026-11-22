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
