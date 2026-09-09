/**
 * Convert Paul Nation BNC/COCA text lists into game JSON.
 *
 * Official source (CC BY-SA 4.0 / GPL as stated on the page):
 * https://www.wgtn.ac.nz/lals/resources/paul-nations-resources/vocabulary-lists
 *
 * Download the Range/AntWordProfiler "basewrdN.txt" files, or the headword PDFs
 * exported as one headword per line, then run:
 *
 *   node scripts/convert-bnc-coca.mjs ./incoming-bnc ./public/vocab/bnc-coca
 *
 * Expected input names: basewrd1.txt … basewrd25.txt  OR  band-01.txt …
 * Family format (Range):
 *   HEADWORD
 *     member
 *     member
 * Simple format: one headword per line.
 *
 * This script does NOT add Chinese glosses. Merge zh/emoji afterwards,
 * or keep English-only and let the game skip words without zh.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const SKIP = new Set(
  "the a an of to and in is it you that he was for on are as with his they i at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil sit now find long down day did get come made may part".split(
    " ",
  ),
);

function parseFamilies(text) {
  const families = [];
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.startsWith("#")) continue;
    const indented = /^\s/.test(raw);
    const token = raw.trim().split(/\s+/)[0];
    if (!token) continue;
    if (!indented) {
      current = { family: token.toLowerCase(), members: [] };
      families.push(current);
    } else if (current) {
      current.members.push(token.toLowerCase());
    }
  }
  if (families.length <= 1 && text.split(/\n/).filter(Boolean).length > 5) {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean)
      .map((family) => ({ family: family.toLowerCase(), members: [] }));
  }
  return families;
}

function bandFromName(name) {
  const m = String(name).match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

async function convertFile(srcPath, outDir) {
  const kBand = bandFromName(basename(srcPath));
  if (kBand < 1 || kBand > 25) return null;
  const text = await readFile(srcPath, "utf8");
  const families = parseFamilies(text);
  const words = families
    .map((item) => {
      const en = item.family;
      if (!en || SKIP.has(en) || !/^[a-z][a-z'-]*$/.test(en)) return null;
      return {
        en,
        zh: "",
        emoji: "🫧",
        family: item.family,
        members: item.members.slice(0, 12),
        kBand,
      };
    })
    .filter(Boolean);
  const file = `band-${String(kBand).padStart(2, "0")}.json`;
  await writeFile(
    join(outDir, file),
    `${JSON.stringify({ kBand, words }, null, 2)}\n`,
    "utf8",
  );
  return { kBand, count: words.length, file };
}

const srcDir = process.argv[2];
const outDir = process.argv[3] || "public/vocab/bnc-coca";
if (!srcDir) {
  console.error("Usage: node scripts/convert-bnc-coca.mjs <input-dir> [output-dir]");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
const names = (await readdir(srcDir)).filter((name) => /\.(txt|csv)$/i.test(name));
const results = [];
for (const name of names.sort()) {
  const info = await convertFile(join(srcDir, name), outDir);
  if (info) results.push(info);
}
await writeFile(
  join(outDir, "manifest.json"),
  `${JSON.stringify(
    {
      source: "bnc-coca-converted",
      attribution: "Nation, I.S.P. BNC/COCA word family lists. Victoria University of Wellington. CC BY-SA 4.0.",
      bands: results.length,
      maxBand: 25,
      files: results,
    },
    null,
    2,
  )}\n`,
);
console.log(results);
