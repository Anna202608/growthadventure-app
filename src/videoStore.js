import { filterSensitiveText } from "./moderation.js";

const DB_NAME = "gda-exchange-videos";
const STORE = "blobs";
const COMMENTS = "comments";
const DB_VERSION = 2;
export const MAX_VIDEO_SECONDS = 180;
export const MIN_CLIP_SECONDS = 8;
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
export const COMMENT_MAX_CHARS = 280;
export const COMMENT_EVENT = "gda-exchange-comments";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      if (!db.objectStoreNames.contains(COMMENTS)) {
        const comments = db.createObjectStore(COMMENTS, { keyPath: "id" });
        comments.createIndex("videoId", "videoId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function readMediaDuration(file) {
  const isAudio = String(file.type || "").startsWith("audio/");
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement(isAudio ? "audio" : "video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const duration = Number(el.duration);
      URL.revokeObjectURL(url);
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("读不出时长，请换一个短片"));
        return;
      }
      resolve(duration);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("这个文件打不开，请换一个再试"));
    };
    el.src = url;
  });
}

export async function saveVideoBlob(id, blob) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(blob, id);
  });
  db.close();
}

export async function deleteVideoBlob(id) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).delete(id);
  });
  db.close();
}

export async function getVideoObjectUrl(id) {
  const db = await openDb();
  const blob = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  if (!blob) return "";
  return URL.createObjectURL(blob);
}

export async function uploadVideoToCloudinary(file) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) return null;
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", preset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/video/upload`, {
    method: "POST",
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || "云端上传失败，已改为保存在本机");
  }
  return data.secure_url;
}

export async function prepareExchangeVideo(file) {
  return prepareExchangeMedia(file, "video");
}

export async function prepareExchangeMedia(file, kind = "video") {
  const type = String(file?.type || "");
  const expect = kind === "audio" ? "audio/" : "video/";
  if (!file || !type.startsWith(expect)) {
    throw new Error(kind === "audio" ? "请选择一个音频文件" : "请选择一个视频文件");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("文件太大了，请控制在 20MB 以内");
  }
  const duration = await readMediaDuration(file);
  if (duration > MAX_VIDEO_SECONDS + 0.4) {
    throw new Error(`时长要在 3 分钟以内，这个有 ${Math.round(duration)} 秒`);
  }
  return duration;
}

function notifyComments() {
  window.dispatchEvent(new Event(COMMENT_EVENT));
}

export async function listVideoComments(videoId) {
  if (!videoId) return [];
  const db = await openDb();
  const rows = await new Promise((resolve, reject) => {
    const tx = db.transaction(COMMENTS, "readonly");
    const index = tx.objectStore(COMMENTS).index("videoId");
    const req = index.getAll(videoId);
    req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
}

export function isCommentVisible(comment, { userId, isPublisherParent }) {
  const status = comment.status || "approved";
  if (status === "approved") return true;
  if (status === "rejected") return Boolean(isPublisherParent);
  return comment.authorId === userId || Boolean(isPublisherParent);
}

export async function reviewVideoComment(commentId, action) {
  const db = await openDb();
  const current = await new Promise((resolve, reject) => {
    const tx = db.transaction(COMMENTS, "readonly");
    const req = tx.objectStore(COMMENTS).get(commentId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  if (!current) {
    db.close();
    throw new Error("找不到这条评论");
  }
  const next = { ...current, status: action === "approve" ? "approved" : "rejected" };
  await new Promise((resolve, reject) => {
    const tx = db.transaction(COMMENTS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(COMMENTS).put(next);
  });
  db.close();
  notifyComments();
  return next;
}

export async function addVideoComment({ videoId, authorId, authorName, content }) {
  const text = String(content || "").trim();
  if (!videoId || !authorId || !text) throw new Error("请先写一点想法");
  if (text.length > COMMENT_MAX_CHARS) throw new Error(`评论最多 ${COMMENT_MAX_CHARS} 个字`);
  const textCheck = filterSensitiveText(text);
  if (!textCheck.ok) throw new Error(textCheck.reason);
  const comment = {
    id: `cm-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    videoId,
    authorId,
    authorName: String(authorName || "家长").trim() || "家长",
    content: text,
    createdAt: Date.now(),
    status: "pending",
  };
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(COMMENTS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(COMMENTS).put(comment);
  });
  db.close();
  notifyComments();
  return comment;
}

export async function deleteVideoComment(commentId, authorId) {
  const db = await openDb();
  const current = await new Promise((resolve, reject) => {
    const tx = db.transaction(COMMENTS, "readonly");
    const req = tx.objectStore(COMMENTS).get(commentId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  if (!current || current.authorId !== authorId) {
    db.close();
    throw new Error("只能删除自己的评论");
  }
  await new Promise((resolve, reject) => {
    const tx = db.transaction(COMMENTS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(COMMENTS).delete(commentId);
  });
  db.close();
  notifyComments();
}

export async function deleteCommentsForVideo(videoId) {
  const rows = await listVideoComments(videoId);
  if (!rows.length) return;
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(COMMENTS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(COMMENTS);
    rows.forEach((item) => store.delete(item.id));
  });
  db.close();
  notifyComments();
}
