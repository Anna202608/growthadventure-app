import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import KidVideoPlayer from "../components/KidVideoPlayer.jsx";
import VideoComments from "../components/VideoComments.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  EXCHANGE_LANGS,
  addExchangeVideo,
  getExchangeVideos,
  removeExchangeVideo,
} from "../db.js";
import { useLiveData } from "../hooks/useLiveData.js";
import {
  MAX_VIDEO_SECONDS,
  deleteCommentsForVideo,
  deleteVideoBlob,
  getVideoObjectUrl,
  prepareExchangeVideo,
  saveVideoBlob,
  uploadVideoToCloudinary,
} from "../videoStore.js";

const inputClass =
  "w-full rounded-2xl border-4 border-violet-200 px-4 py-3 text-lg font-bold text-violet-900 outline-none focus:border-violet-400";

export default function ParentUploadVideo() {
  useLiveData();
  const { user } = useAuth();
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const [lang, setLang] = useState("en");
  const [tag, setTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [active, setActive] = useState(null);
  const [src, setSrc] = useState("");
  const videos = getExchangeVideos();

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    async function load() {
      setSrc("");
      if (!active) return;
      if (active.storage === "cloudinary" && active.url) {
        if (!cancelled) setSrc(active.url);
        return;
      }
      objectUrl = await getVideoObjectUrl(active.id);
      if (!cancelled) setSrc(objectUrl);
    }
    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [active]);

  if (!user || user.role !== "parent") {
    return <Navigate to="/" replace />;
  }

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setOk("");
    const label = String(tag || "").trim();
    if (!label) {
      setError("先写一个简单标签，比如：hello / 你好");
      return;
    }
    setBusy(true);
    try {
      const duration = await prepareExchangeVideo(file);
      const id = `v-${Date.now()}`;
      let storage = "idb";
      let url = "";
      try {
        const cloudUrl = await uploadVideoToCloudinary(file);
        if (cloudUrl) {
          storage = "cloudinary";
          url = cloudUrl;
        }
      } catch {
        storage = "idb";
      }
      if (storage === "idb") await saveVideoBlob(id, file);
      addExchangeVideo({ id, lang, tag: label, duration, storage, url });
      setTag("");
      setOk(`上传成功！${Math.round(duration)} 秒 · ${label}`);
    } catch (err) {
      setError(err.message || "上传失败，请再试一次");
    } finally {
      setBusy(false);
      if (cameraRef.current) cameraRef.current.value = "";
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemove(video) {
    if (video.storage === "idb") await deleteVideoBlob(video.id);
    await deleteCommentsForVideo(video.id);
    removeExchangeVideo(video.id);
    if (active?.id === video.id) setActive(null);
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-orange-300 via-amber-200 to-rose-200 px-5 py-8">
      <div className="mx-auto max-w-md pb-10">
        <Link to="/parent" className="font-extrabold text-orange-900/70">
          ← 返回
        </Link>
        <h1 className="mt-4 font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(194,65,12,0.35)]">
          上传视频
        </h1>
        <p className="mt-1 font-bold text-orange-900/70">语言交换 / Language Exchange</p>
        <p className="mt-2 text-sm font-extrabold text-orange-800/80">
          录制或选择 {MAX_VIDEO_SECONDS} 秒以内的短视频，孩子看完就能学单词、拿积分。
        </p>

        <form className="mt-5 space-y-4 rounded-[32px] border-4 border-white bg-white/90 p-5" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend className="mb-2 text-sm font-extrabold text-violet-700">语言类别</legend>
            <div className="grid grid-cols-2 gap-2">
              {EXCHANGE_LANGS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLang(item.id)}
                  className={`rounded-2xl py-3 text-sm font-extrabold ${
                    lang === item.id ? "bg-orange-400 text-white" : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {item.label}
                  <span className="mt-0.5 block text-[10px] font-bold opacity-80">{item.en}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1 block text-sm font-extrabold text-violet-700">简单标签</span>
            <input className={inputClass} value={tag} onChange={(e) => setTag(e.target.value)} placeholder="如：apple / 打招呼" />
          </label>

          {error ? <p className="rounded-2xl bg-rose-100 px-3 py-2 text-center text-sm font-bold text-rose-600">{error}</p> : null}
          {ok ? <p className="rounded-2xl bg-emerald-100 px-3 py-2 text-center text-sm font-bold text-emerald-700">{ok}</p> : null}

          <input
            ref={cameraRef}
            type="file"
            accept="video/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <button
            type="button"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
            className="w-full rounded-2xl border-b-8 border-sky-700 bg-sky-400 py-4 font-display text-2xl text-white disabled:opacity-70"
          >
            {busy ? "正在处理…" : "拍摄视频"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl bg-violet-100 py-4 font-display text-xl text-violet-700 disabled:opacity-70"
          >
            选择本地视频
          </button>
        </form>

        <section className="mt-5 space-y-2">
          <h2 className="font-display text-xl text-violet-800">已上传</h2>
          {videos.length === 0 ? (
            <p className="rounded-[28px] border-4 border-white bg-white/80 px-4 py-6 text-center font-extrabold text-violet-400">
              还没有短视频
            </p>
          ) : (
            videos.map((video) => (
              <article key={video.id} className="rounded-[28px] border-4 border-white bg-white/90 px-4 py-3">
                <button type="button" onClick={() => setActive(video)} className="w-full text-left">
                  <p className="font-display text-xl text-violet-800">{video.tag}</p>
                  <p className="text-xs font-extrabold text-violet-400">
                    {video.lang === "zh" ? "汉语" : "英语"} · {Math.round(video.duration)} 秒 · {video.createdAt}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-sky-500">点击播放并参与评论</p>
                </button>
                <button type="button" onClick={() => handleRemove(video)} className="mt-2 rounded-2xl bg-rose-100 px-3 py-2 text-sm font-extrabold text-rose-600">
                  删除视频
                </button>
              </article>
            ))
          )}
        </section>
      </div>

      {active ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-orange-950/45 px-4 pb-6 pt-10 sm:items-center">
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[32px] border-4 border-white bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl text-violet-800">{active.tag}</p>
                <p className="text-sm font-extrabold text-violet-400">{active.lang === "zh" ? "汉语" : "英语"}</p>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-full bg-orange-100 px-3 py-1 text-sm font-extrabold text-orange-600"
              >
                关闭
              </button>
            </div>
            <div className="mt-3 aspect-video">
              {src ? (
                <KidVideoPlayer src={src} className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center rounded-[28px] bg-violet-100 font-extrabold text-violet-400">
                  正在打开视频…
                </div>
              )}
            </div>
            <VideoComments videoId={active.id} user={user} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
