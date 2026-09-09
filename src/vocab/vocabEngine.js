const bandCache = new Map();
let manifestCache = null;

export async function loadVocabManifest() {
  if (manifestCache) return manifestCache;
  const res = await fetch("/vocab/bnc-coca/manifest.json");
  if (!res.ok) {
    manifestCache = { bands: 3, maxBand: 3, source: "missing" };
    return manifestCache;
  }
  manifestCache = await res.json();
  return manifestCache;
}

export async function loadVocabBand(kBand) {
  const k = Math.max(1, Number(kBand) || 1);
  if (bandCache.has(k)) return bandCache.get(k);
  const file = `/vocab/bnc-coca/band-${String(k).padStart(2, "0")}.json`;
  const res = await fetch(file);
  if (!res.ok) {
    bandCache.set(k, []);
    return [];
  }
  const data = await res.json();
  const words = Array.isArray(data.words) ? data.words : [];
  const mapped = words
    .map((item) => ({
      en: String(item.en || "").trim(),
      zh: String(item.zh || "").trim(),
      emoji: item.emoji || "🫧",
      family: item.family || item.en,
      kBand: data.kBand || k,
    }))
    .filter((item) => item.en && item.zh);
  bandCache.set(k, mapped);
  return mapped;
}

export async function loadUnlockedVocab(unlockedMaxK = 1) {
  const manifest = await loadVocabManifest();
  const bundled = Number(manifest.bands) || 3;
  const maxK = Math.min(unlockedMaxK, bundled, Number(manifest.maxBand) || 25);
  const bands = await Promise.all(
    Array.from({ length: maxK }, (_, index) => loadVocabBand(index + 1)),
  );
  return bands.flat();
}

export function bandLabel(kBand, isZh) {
  if (kBand <= 3) return isZh ? `初级 ${kBand}k` : `Beginner ${kBand}k`;
  if (kBand <= 8) return isZh ? `中级 ${kBand}k` : `Intermediate ${kBand}k`;
  return isZh ? `高级 ${kBand}k` : `Advanced ${kBand}k`;
}
