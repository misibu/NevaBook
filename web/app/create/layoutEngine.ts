export type PhotoAsset = {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
};

export type Rect = { x: number; y: number; w: number; h: number };
export type PlacedPhoto = { photoId: string; rect: Rect; focusX: number; focusY: number };
export type Spread = {
  id: string;
  items: PlacedPhoto[];
  variants: Rect[][];
  layoutIndex: number;
  seed: number;
};

const ratiosHero = [0.36, 0.40, 0.42, 0.50, 0.58, 0.60, 0.64];
const ratiosBalanced = [0.333, 0.40, 0.50, 0.60, 0.667];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function choice<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)] ?? arr[0];
}

function cleanRecursiveRects(x: number, y: number, w: number, h: number, n: number, gap: number, rnd: () => number): Rect[] {
  if (n <= 1) return [{ x, y, w, h }];
  const shape = w / Math.max(h, 1e-9);
  const vertical = shape > 1.45 ? rnd() < 0.86 : shape < 0.70 ? rnd() < 0.14 : rnd() < 0.5;

  let k: number;
  if (n >= 3 && rnd() < 0.45) k = rnd() < 0.5 ? 1 : n - 1;
  else {
    const candidates = Array.from({ length: n - 1 }, (_, i) => i + 1);
    const center = n / 2;
    const weights = candidates.map(v => 1 / (1 + Math.abs(v - center)));
    const sum = weights.reduce((a, b) => a + b, 0);
    let p = rnd() * sum;
    k = candidates[candidates.length - 1];
    for (let i = 0; i < candidates.length; i++) {
      p -= weights[i];
      if (p <= 0) { k = candidates[i]; break; }
    }
  }

  let ratio: number;
  if (k === 1 || n - k === 1) ratio = choice(ratiosHero, rnd);
  else {
    const ideal = k / n;
    const nearest = [...ratiosBalanced].sort((a, b) => Math.abs(a - ideal) - Math.abs(b - ideal)).slice(0, 3);
    ratio = choice(nearest, rnd);
  }

  if (vertical) {
    const usable = w - gap;
    let w1 = usable * ratio;
    let w2 = usable - w1;
    if (Math.min(w1, w2) < 18) { w1 = usable * 0.5; w2 = usable - w1; }
    return [...cleanRecursiveRects(x, y, w1, h, k, gap, rnd),
      ...cleanRecursiveRects(x + w1 + gap, y, w2, h, n - k, gap, rnd)];
  }
  const usable = h - gap;
  let h1 = usable * ratio;
  let h2 = usable - h1;
  if (Math.min(h1, h2) < 18) { h1 = usable * 0.5; h2 = usable - h1; }
  return [...cleanRecursiveRects(x, y, w, h1, k, gap, rnd),
    ...cleanRecursiveRects(x, y + h1 + gap, w, h2, n - k, gap, rnd)];
}

function cropCost(photoAspect: number, slotAspect: number) {
  const keep = Math.min(photoAspect / slotAspect, slotAspect / photoAspect);
  return 1 - keep;
}

function assignmentScore(photos: PhotoAsset[], rects: Rect[]) {
  const areas = rects.map(r => r.w * r.h);
  const maxArea = Math.max(...areas, 1);
  const remaining = new Set(photos.map((_, i) => i));
  let score = 0;
  for (const slot of rects.map((_, i) => i).sort((a, b) => areas[b] - areas[a])) {
    const r = rects[slot];
    const slotAspect = r.w / Math.max(r.h, 1e-9);
    const areaWeight = 0.65 + 0.70 * (areas[slot] / maxArea);
    let best = -1, bestCost = Number.POSITIVE_INFINITY;
    for (const pidx of remaining) {
      const p = photos[pidx];
      const c = cropCost(p.width / Math.max(1, p.height), slotAspect) * areaWeight;
      if (c < bestCost) { bestCost = c; best = pidx; }
    }
    if (best >= 0) { remaining.delete(best); score += bestCost; }
  }
  return score + layoutPenalty(rects);
}

function layoutPenalty(rects: Rect[]) {
  let penalty = 0;
  const areas: number[] = [];
  for (const r of rects) {
    areas.push(r.w * r.h);
    if (r.w < 32) penalty += (32 - r.w) * 0.025;
    if (r.h < 30) penalty += (30 - r.h) * 0.028;
    const a = r.w / Math.max(r.h, 1e-9);
    if (a > 4.2) penalty += (a - 4.2) * 0.18;
    if (a < 0.24) penalty += (0.24 - a) * 0.8;
    if (a > 3.3 || a < 0.30) penalty += 0.18;
  }
  if (areas.length >= 4) {
    const avg = areas.reduce((a, b) => a + b, 0) / areas.length;
    if (Math.max(...areas) / Math.max(avg, 1e-9) < 1.25) penalty += 0.08;
  }
  return penalty;
}

function signature(rects: Rect[]) {
  return rects.map(r => [r.x, r.y, r.w, r.h].map(v => v.toFixed(2)).join(',')).join('|');
}

export function buildLayoutVariants(photos: PhotoAsset[], pageW = 406, pageH = 206, gap = 2, seed = Date.now(), targetCount = 36): Rect[][] {
  if (!photos.length) return [];
  const master = mulberry32(seed);
  const seen = new Set<string>();
  const scored: { score: number; rects: Rect[] }[] = [];
  const attempts = Math.max(180, targetCount * 8);
  for (let i = 0; i < attempts; i++) {
    const rnd = mulberry32(Math.floor(master() * 2_000_000_000) + 1);
    const rects = cleanRecursiveRects(0, 0, pageW, pageH, photos.length, gap, rnd);
    const sig = signature(rects);
    if (seen.has(sig)) continue;
    seen.add(sig);
    scored.push({ score: assignmentScore(photos, rects), rects });
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, targetCount).map(x => x.rects);
}

export function assignPhotos(photos: PhotoAsset[], rects: Rect[], previous?: PlacedPhoto[]): PlacedPhoto[] {
  const focus = new Map(previous?.map(x => [x.photoId, [x.focusX, x.focusY]]) ?? []);
  const areas = rects.map(r => r.w * r.h);
  const maxArea = Math.max(...areas, 1);
  const remaining = new Set(photos.map((_, i) => i));
  const result: (PlacedPhoto | undefined)[] = new Array(rects.length);

  for (const slot of rects.map((_, i) => i).sort((a, b) => areas[b] - areas[a])) {
    const r = rects[slot];
    const slotAspect = r.w / Math.max(r.h, 1e-9);
    const areaWeight = 0.65 + 0.70 * (areas[slot] / maxArea);
    let best = -1, bestCost = Number.POSITIVE_INFINITY;
    for (const pidx of remaining) {
      const p = photos[pidx];
      const c = cropCost(p.width / Math.max(1, p.height), slotAspect) * areaWeight;
      if (c < bestCost) { bestCost = c; best = pidx; }
    }
    if (best < 0) continue;
    remaining.delete(best);
    const p = photos[best];
    const old = focus.get(p.id);
    result[slot] = { photoId: p.id, rect: r, focusX: old?.[0] ?? 0.5, focusY: old?.[1] ?? 0.5 };
  }
  return result.filter(Boolean) as PlacedPhoto[];
}

export function makeSpread(photos: PhotoAsset[], seed: number): Spread {
  const variants = buildLayoutVariants(photos, 406, 206, 2, seed, 36);
  return {
    id: crypto.randomUUID(),
    variants,
    layoutIndex: 0,
    seed,
    items: variants[0] ? assignPhotos(photos, variants[0]) : []
  };
}

export function autoBuild(photos: PhotoAsset[], spreadCount: number): Spread[] {
  if (!photos.length || spreadCount < 1) return [];
  const safeCount = Math.min(spreadCount, photos.length);
  const base = Math.floor(photos.length / safeCount);
  const remainder = photos.length % safeCount;
  const spreads: Spread[] = [];
  let idx = 0;
  for (let i = 0; i < safeCount; i++) {
    const count = base + (i < remainder ? 1 : 0);
    const group = photos.slice(idx, idx + count);
    idx += count;
    spreads.push(makeSpread(group, Date.now() + i * 911));
  }
  return spreads;
}
