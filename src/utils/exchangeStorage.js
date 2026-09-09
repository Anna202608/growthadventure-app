import { DATA_EVENT } from "../db.js";
import { findSensitiveTerm } from "../moderation.js";

export const CONTENT_KEY = "gda.exchange.content.v1";
export const PAIRS_KEY = "gda.exchange.pairs.v1";
export const REPORTS_KEY = "gda.exchange.reports.v1";
export const PARK_FAMILY_ID = "fam-park-ca";
export const MAX_BYTES = 20 * 1024 * 1024;
export const MAX_SECONDS = 180;
export const COMMENT_EVENT = "gda-exchange-comments-v2";

const SESSION_KEY = "gda.session";
const IDB_NAME = "ExchangeDB";
const IDB_STORE = "comments";
const DEMO_BEEP =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

function notify() {
  window.dispatchEvent(new Event(DATA_EVENT));
}

function notifyComments() {
  window.dispatchEvent(new Event(COMMENT_EVENT));
}

function readJson(key, fallback) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    return raw ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  notify();
}

export function getFamilyId() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return session?.familyId || session?.userId || "gda-demo-family";
  } catch {
    return "gda-demo-family";
  }
}

export function listContent() {
  const list = readJson(CONTENT_KEY, []);
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item) =>
      item &&
      item.id &&
      item.familyId &&
      (item.fileType === "video" || item.fileType === "audio") &&
      ["ai_rejected", "parent_pending", "published", "rejected"].includes(item.status)
  );
}

function saveContent(list) {
  writeJson(CONTENT_KEY, list);
}

export function listPairs() {
  const list = readJson(PAIRS_KEY, []);
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      pairId: item.pairId || item.id,
      familyAId: item.familyAId || item.familyA,
      familyBId: item.familyBId || item.familyB,
      pairedAt: item.pairedAt || Date.now(),
    }))
    .filter((item) => item.pairId && item.familyAId && item.familyBId);
}

export function listReports() {
  const list = readJson(REPORTS_KEY, []);
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      reportId: item.reportId || item.id,
      contentId: item.contentId || item.targetId,
      reporterFamilyId: item.reporterFamilyId || item.reporterId,
      reason: item.reason || "不适合孩子",
      status: item.status === "resolved" ? "resolved" : "pending",
    }))
    .filter((item) => item.reportId && item.contentId);
}

export function getActivePair(familyId = getFamilyId()) {
  return (
    listPairs().find((item) => item.familyAId === familyId || item.familyBId === familyId) || null
  );
}

export function getPartnerFamilyId(familyId = getFamilyId()) {
  const pair = getActivePair(familyId);
  if (!pair) return "";
  return pair.familyAId === familyId ? pair.familyBId : pair.familyAId;
}

function seedParkClips() {
  const existing = listContent();
  if (existing.some((item) => item.familyId === PARK_FAMILY_ID && item.fileData)) return;
  const now = Date.now();
  saveContent([
    {
      id: `c-park-soccer-${now}`,
      title: "Soccer after school",
      description: "Kick the ball in the park.",
      fileType: "audio",
      fileData: DEMO_BEEP,
      status: "published",
      visibility: "public",
      familyId: PARK_FAMILY_ID,
      createdAt: now - 3600000,
    },
    {
      id: `c-park-breakfast-${now}`,
      title: "Breakfast with Dad",
      description: "We make toast and say good morning.",
      fileType: "audio",
      fileData: DEMO_BEEP,
      status: "published",
      visibility: "partner",
      familyId: PARK_FAMILY_ID,
      createdAt: now - 86400000,
    },
    ...existing,
  ]);
}

export function pairWithParkFamily() {
  const familyId = getFamilyId();
  const already = getActivePair(familyId);
  if (already) {
    seedParkClips();
    return { ok: true, already: true, pair: already };
  }
  const pair = {
    pairId: `pair-${Date.now()}`,
    familyAId: familyId,
    familyBId: PARK_FAMILY_ID,
    pairedAt: Date.now(),
  };
  writeJson(PAIRS_KEY, [pair, ...listPairs()]);
  seedParkClips();
  return { ok: true, already: false, pair };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });
}

function readDuration(file) {
  const isAudio = String(file.type || "").startsWith("audio/");
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement(isAudio ? "audio" : "video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const duration = Number(el.duration);
      URL.revokeObjectURL(url);
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("读不出时长，请换一个文件"));
        return;
      }
      resolve(duration);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("这个文件打不开"));
    };
    el.src = url;
  });
}

export async function submitExchangeContent({ title, description, file }) {
  const familyId = getFamilyId();
  const headline = String(title || "").trim();
  const desc = String(description || "").trim();
  if (!headline) throw new Error("请先填写标题");
  if (!file) throw new Error("请选择视频或音频");

  const hit = findSensitiveTerm(`${headline} ${desc}`);
  const fileType = String(file.type || "").startsWith("audio/") ? "audio" : "video";
  if (file.size > MAX_BYTES) throw new Error("文件需小于 20MB");
  const duration = await readDuration(file);
  if (duration > MAX_SECONDS + 0.4) throw new Error("时长需在 3 分钟以内");

  let fileData = "";
  try {
    fileData = await fileToBase64(file);
  } catch (err) {
    throw new Error(err.message || "无法读取文件");
  }

  const item = {
    id: `c-${Date.now()}`,
    title: headline,
    description: desc,
    fileType,
    fileData,
    status: hit ? "ai_rejected" : "parent_pending",
    visibility: "partner",
    familyId,
    createdAt: Date.now(),
  };

  try {
    saveContent([item, ...listContent()]);
  } catch (err) {
    if (err?.name === "QuotaExceededError") {
      throw new Error("本机存储空间不够，请换更短的视频或音频");
    }
    throw err;
  }

  if (hit) {
    return {
      ok: false,
      item,
      reason: `包含不适合孩子的词语「${hit}」，已标记为平台拦截`,
    };
  }
  return { ok: true, item };
}

export function getParentPending(familyId = getFamilyId()) {
  return listContent()
    .filter((item) => item.familyId === familyId && item.status === "parent_pending")
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
}

export function getFamilyContent(familyId = getFamilyId()) {
  return listContent()
    .filter((item) => item.familyId === familyId)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
}

export function reviewContent(id, action, visibility = "partner") {
  const familyId = getFamilyId();
  const next = listContent().map((item) => {
    if (item.id !== id || item.familyId !== familyId) return item;
    if (action === "reject") return { ...item, status: "rejected" };
    return {
      ...item,
      status: "published",
      visibility: visibility === "public" ? "public" : "partner",
    };
  });
  saveContent(next);
  return { ok: true };
}

export function getChildFeeds(familyId = getFamilyId()) {
  const partnerId = getPartnerFamilyId(familyId);
  const published = listContent().filter((item) => item.status === "published");
  const partner = published
    .filter((item) => partnerId && item.familyId === partnerId && item.visibility === "partner")
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  const featured = published
    .filter((item) => item.visibility === "public")
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  return { partner, featured };
}

export function addReport({ contentId, reason }) {
  const row = {
    reportId: `rp-${Date.now()}`,
    contentId,
    reporterFamilyId: getFamilyId(),
    reason: String(reason || "不适合孩子").trim() || "不适合孩子",
    status: "pending",
  };
  writeJson(REPORTS_KEY, [row, ...listReports()]);
  return row;
}

export function reportExchangeTarget(payload = {}) {
  return addReport({
    contentId: payload.contentId || payload.targetId,
    reason: payload.reason,
  });
}

function openCommentDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        const store = db.createObjectStore(IDB_STORE, { keyPath: "id" });
        store.createIndex("contentId", "contentId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addComment({ contentId, text }) {
  const cleaned = String(text || "").trim();
  if (!contentId || !cleaned) throw new Error("请先写一点留言");
  const hit = findSensitiveTerm(cleaned);
  if (hit) throw new Error(`留言包含不适合孩子的词语「${hit}」`);
  const comment = {
    id: `cm-${Date.now()}`,
    contentId,
    commenterFamilyId: getFamilyId(),
    text: cleaned,
    status: "pending",
  };
  const db = await openCommentDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(IDB_STORE).put(comment);
  });
  db.close();
  notifyComments();
  return comment;
}

export async function listComments(contentId) {
  if (!contentId) return [];
  const db = await openCommentDb();
  const rows = await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const index = tx.objectStore(IDB_STORE).index("contentId");
    const req = index.getAll(contentId);
    req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows.sort((a, b) => String(b.id).localeCompare(String(a.id)));
}

export async function approveComment(id) {
  const db = await openCommentDb();
  const current = await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  if (!current) {
    db.close();
    throw new Error("找不到这条评论");
  }
  const next = { ...current, status: "approved" };
  await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(IDB_STORE).put(next);
  });
  db.close();
  notifyComments();
  return next;
}

export function visibleComments(rows, { familyId, isPublisherParent }) {
  const me = familyId || getFamilyId();
  return rows.filter((item) => {
    if (item.status === "approved") return true;
    if (item.status === "pending") return item.commenterFamilyId === me || isPublisherParent;
    return false;
  });
}
