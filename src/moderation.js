const BLOCKLIST = [
  "暴力",
  "色情",
  "裸体",
  "自杀",
  "毒品",
  "枪支",
  "porn",
  "sex",
  "nude",
  "kill",
  "suicide",
  "drug",
  "gun",
  "fuck",
  "shit",
];

export function findSensitiveTerm(text) {
  const raw = String(text || "").toLowerCase();
  if (!raw.trim()) return "";
  return BLOCKLIST.find((word) => raw.includes(word.toLowerCase())) || "";
}

export function filterSensitiveText(text) {
  const hit = findSensitiveTerm(text);
  if (!hit) return { ok: true, text: String(text || "").trim() };
  return { ok: false, hit, reason: `包含不适合孩子的词语：${hit}` };
}

export function mockAiScanMedia({ title, description, fileName, kind }) {
  const blob = `${title} ${description} ${fileName} ${kind}`;
  const hit = findSensitiveTerm(blob);
  if (hit) {
    return {
      ok: false,
      labels: ["unsafe"],
      reason: `平台初审未通过（模拟 AI）：检测到风险词「${hit}」`,
    };
  }
  if (/fight|blood|weapon|血腥|打架/i.test(blob)) {
    return { ok: false, labels: ["violence"], reason: "平台初审未通过（模拟 AI）：疑似暴力内容" };
  }
  return {
    ok: true,
    labels: ["kids-safe", "family-life"],
    reason: "平台初审通过，等待家长白名单确认",
  };
}
