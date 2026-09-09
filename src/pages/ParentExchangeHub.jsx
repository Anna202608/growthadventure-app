import { useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import ExchangeComments, { ReportSheet } from "../components/ExchangeComments.jsx";
import KidVideoPlayer from "../components/KidVideoPlayer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useLiveData } from "../hooks/useLiveData.js";
import {
  MAX_BYTES,
  MAX_SECONDS,
  addReport,
  getActivePair,
  getFamilyContent,
  getParentPending,
  pairWithParkFamily,
  reviewContent,
  submitExchangeContent,
} from "../utils/exchangeStorage.js";

const inputClass =
  "w-full rounded-2xl border-4 border-violet-200 px-4 py-3 text-lg font-bold text-violet-900 outline-none focus:border-violet-400";

function statusLabel(status, isZh) {
  if (status === "parent_pending") return isZh ? "待家长审核" : "Awaiting parent";
  if (status === "published") return isZh ? "已发布" : "Published";
  if (status === "ai_rejected") return isZh ? "平台初审未通过" : "Blocked by AI";
  if (status === "rejected") return isZh ? "家长已拒绝" : "Rejected";
  return status;
}

export default function ParentExchangeHub() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === "zh";
  const fileRef = useRef(null);
  const [tab, setTab] = useState("review");
  const [fileType, setFileType] = useState("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState("");
  const [picked, setPicked] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [active, setActive] = useState(null);
  const [reportId, setReportId] = useState("");
  const queue = getParentPending();
  const mine = getFamilyContent();
  const pair = getActivePair();

  if (!user) return <Navigate to="/" replace />;
  if (user.role === "child") return <Navigate to="/child" replace />;

  function onPickFile(file) {
    if (!file) return;
    setPicked(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleUpload() {
    setError("");
    setOk("");
    setBusy(true);
    try {
      const result = await submitExchangeContent({ title, description, file: picked });
      if (!result.ok) {
        setError(result.reason);
        return;
      }
      setOk(isZh ? "已进入家长待审核队列" : "Sent to parent review");
      setTitle("");
      setDescription("");
      setPicked(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
      setTab("review");
    } catch (err) {
      setError(err.message || (isZh ? "上传失败" : "Upload failed"));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-orange-300 via-amber-200 to-rose-200 px-5 py-8">
      <div className="mx-auto max-w-md pb-10">
        <Link to="/parent" className="font-extrabold text-orange-900/70">
          ← {isZh ? "返回" : "Back"}
        </Link>
        <h1 className="mt-4 font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(194,65,12,0.35)]">
          {isZh ? "语言交换工作室" : "Exchange Studio"}
        </h1>
        <p className="mt-1 text-sm font-extrabold text-orange-800/80">
          {isZh ? "平台初审 → 家长白名单 → 社区举报" : "AI filter → parent whitelist → reports"}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ["review", isZh ? "审核" : "Review", queue.length],
            ["upload", isZh ? "上传" : "Upload", null],
            ["pair", isZh ? "配对" : "Pair", pair ? 1 : 0],
          ].map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-2xl py-2 text-sm font-extrabold ${tab === id ? "bg-white text-orange-600" : "bg-white/50 text-orange-800/70"}`}
            >
              {label}
              {count ? ` (${count})` : ""}
            </button>
          ))}
        </div>

        {tab === "pair" ? (
          <section className="mt-5 rounded-[28px] border-4 border-white bg-white/90 p-5">
            <h2 className="font-display text-2xl text-violet-800">{isZh ? "家庭配对" : "Pairing"}</h2>
            {pair ? (
              <p className="mt-3 font-extrabold text-emerald-700">{isZh ? "已与帕克家庭结成伙伴" : "Paired with the Park family"}</p>
            ) : (
              <button
                type="button"
                onClick={() => pairWithParkFamily()}
                className="mt-4 w-full rounded-2xl bg-teal-400 py-3 font-display text-xl text-white"
              >
                {isZh ? "匹配帕克家庭" : "Match Park family"}
              </button>
            )}
          </section>
        ) : null}

        {tab === "upload" ? (
          <div className="mt-5 space-y-3 rounded-[32px] border-4 border-white bg-white/90 p-5">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setFileType("video")} className={`rounded-2xl py-3 font-extrabold ${fileType === "video" ? "bg-sky-400 text-white" : "bg-violet-50 text-violet-600"}`}>
                {isZh ? "短视频" : "Video"}
              </button>
              <button type="button" onClick={() => setFileType("audio")} className={`rounded-2xl py-3 font-extrabold ${fileType === "audio" ? "bg-sky-400 text-white" : "bg-violet-50 text-violet-600"}`}>
                {isZh ? "纯音频" : "Audio"}
              </button>
            </div>
            <p className="text-xs font-bold text-violet-400">
              {isZh ? `小于 ${Math.round(MAX_BYTES / 1024 / 1024)}MB，最长 ${MAX_SECONDS / 60} 分钟` : `Under 20MB / 3 min`}
            </p>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={isZh ? "标题" : "Title"} />
            <textarea className={`${inputClass} min-h-20`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={isZh ? "描述" : "Description"} />
            <input
              ref={fileRef}
              type="file"
              accept={fileType === "audio" ? "audio/*" : "video/*"}
              className="w-full text-sm font-bold text-violet-600"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
            {preview && fileType === "video" ? <video src={preview} controls className="mt-2 w-full rounded-2xl" /> : null}
            {preview && fileType === "audio" ? <audio src={preview} controls className="mt-2 w-full" /> : null}
            {error ? <p className="rounded-2xl bg-rose-100 px-3 py-2 text-center text-sm font-bold text-rose-600">{error}</p> : null}
            {ok ? <p className="rounded-2xl bg-emerald-100 px-3 py-2 text-center text-sm font-bold text-emerald-700">{ok}</p> : null}
            <button type="button" disabled={busy || !picked} onClick={handleUpload} className="w-full rounded-2xl border-b-8 border-sky-700 bg-sky-400 py-4 font-display text-2xl text-white disabled:opacity-60">
              {busy ? "…" : isZh ? "提交审核" : "Submit"}
            </button>
          </div>
        ) : null}

        {tab === "review" ? (
          <section className="mt-5 space-y-3">
            <h2 className="font-display text-xl text-violet-800">{isZh ? "待审核（parent_pending）" : "parent_pending"}</h2>
            {queue.length === 0 ? (
              <p className="rounded-[28px] border-4 border-white bg-white/80 px-4 py-6 text-center font-extrabold text-violet-400">
                {isZh ? "没有待审核内容" : "Queue empty"}
              </p>
            ) : (
              queue.map((item) => (
                <article key={item.id} className="rounded-[28px] border-4 border-white bg-white/90 p-4">
                  <p className="font-display text-xl text-violet-800">{item.title}</p>
                  <p className="text-sm font-bold text-violet-400">{item.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => reviewContent(item.id, "publish", "partner")} className="rounded-2xl bg-emerald-400 py-2 font-extrabold text-white">
                      {isZh ? "发布给伙伴" : "Publish to partner"}
                    </button>
                    <button type="button" onClick={() => reviewContent(item.id, "publish", "public")} className="rounded-2xl bg-sky-400 py-2 font-extrabold text-white">
                      {isZh ? "公开并推荐" : "Public + featured"}
                    </button>
                  </div>
                  <button type="button" onClick={() => reviewContent(item.id, "reject")} className="mt-2 w-full rounded-2xl bg-rose-100 py-2 text-sm font-extrabold text-rose-600">
                    {isZh ? "拒绝" : "Reject"}
                  </button>
                </article>
              ))
            )}
            <h2 className="pt-2 font-display text-xl text-violet-800">{isZh ? "我家全部内容" : "All our clips"}</h2>
            {mine.map((item) => (
              <button key={item.id} type="button" onClick={() => setActive(item)} className="block w-full rounded-[28px] border-4 border-white bg-white/90 px-4 py-3 text-left">
                <p className="font-display text-lg text-violet-800">{item.title}</p>
                <p className="text-xs font-extrabold text-violet-400">{statusLabel(item.status, isZh)}</p>
              </button>
            ))}
          </section>
        ) : null}
      </div>

      {active ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-orange-950/45 px-4 pb-6 pt-10 sm:items-center">
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[32px] border-4 border-white bg-white p-4">
            <div className="flex justify-between">
              <p className="font-display text-2xl text-violet-800">{active.title}</p>
              <button type="button" onClick={() => setActive(null)} className="font-extrabold text-orange-500">
                {isZh ? "关闭" : "Close"}
              </button>
            </div>
            {active.fileType === "audio" ? (
              <audio className="mt-3 w-full" controls src={active.fileData} />
            ) : (
              <div className="mt-3 aspect-video">
                <KidVideoPlayer src={active.fileData} className="h-full w-full" />
              </div>
            )}
            <button type="button" className="mt-3 text-sm font-extrabold text-orange-600" onClick={() => setReportId(active.id)}>
              {isZh ? "举报" : "Report"}
            </button>
            <ExchangeComments contentId={active.id} isPublisherParent />
          </div>
        </div>
      ) : null}

      {reportId ? (
        <ReportSheet
          isZh={isZh}
          onClose={() => setReportId("")}
          onPick={(reason) => {
            addReport({ contentId: reportId, reason });
            setReportId("");
          }}
        />
      ) : null}
    </div>
  );
}
