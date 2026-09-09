import { useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import LanguageToggle from "../components/LanguageToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { recognizeWorldPhoto } from "../explorerApi.js";
import { useAppLang } from "../hooks/useAppLang.js";
import { useLiveData } from "../hooks/useLiveData.js";
import { speakText } from "../language.js";
import {
  EXPLORE_POINTS,
  getExplorerReviewState,
  getExplorerStats,
  recordExplorerDiscovery,
} from "../db.js";
import { compressImage } from "../utils/image.js";
import ChildBottomNav from "../components/ChildBottomNav.jsx";

export default function ChildWorldExplorer() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [lang] = useAppLang();
  const inputRef = useRef(null);
  const [photo, setPhoto] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState("");
  const stats = getExplorerStats();
  const review = getExplorerReviewState();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 核心逻辑：中文界面学英文，英文界面学中文
  const displayWord = lang === "zh" ? result?.en : result?.zh;
  const displaySentence = lang === "zh" ? result?.enSentence : result?.zhSentence;
  const speakLang = lang === "zh" ? "en" : "zh";

  async function onPick(file) {
    if (!file) return;
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const dataUrl = await compressImage(file, 512);
      setPhoto(dataUrl);
      const identified = await recognizeWorldPhoto(dataUrl);
      const thumb = await compressImage(file, 240);
      const saved = recordExplorerDiscovery({
        photo: thumb,
        en: identified.en,
        zh: identified.zh,
        enSentence: identified.enSentence,
        zhSentence: identified.zhSentence,
        emoji: identified.emoji,
      });
      const next = { ...identified, mocked: identified.mocked };
      setResult(next);
      // 中文界面读英文，英文界面读中文
      speakText(lang === "zh" ? next.en : next.zh, speakLang);
      if (saved.pending) {
        setToast(isZh ? "📚 新单词已记录，去复习吧！" : "📚 New word saved. Go review!");
        setTimeout(() => setToast(""), 2200);
      }
    } catch (err) {
      setError(err.message || (isZh ? "识别失败，请再拍一张试试" : "Recognition failed, try again"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function replay() {
    if (!result) return;
    speakText(lang === "zh" ? result.en : result.zh, speakLang);
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-200">
      <div className="relative z-10 mx-auto max-w-md px-4 pb-20 pt-4">
        {toast ? (
          <div className="pointer-events-none fixed left-1/2 top-24 z-40 -translate-x-1/2 rounded-full bg-emerald-500 px-5 py-2 font-display text-2xl text-white shadow-lg">
            {toast}
          </div>
        ) : null}

        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl leading-none text-white drop-shadow-[0_3px_0_rgba(3,105,161,0.35)]">
              {isZh ? "世界探索" : "World Explorer"}
            </h1>
            <p className="mt-1 text-sm font-extrabold tracking-wide text-sky-900/70">World Explorer</p>
          </div>
          <LanguageToggle />
        </header>

        <p className="mt-3 text-sm font-bold text-sky-900/80">
          {isZh
            ? `拍下身边的东西，先记入今日复习。每复习完一个单词 +${EXPLORE_POINTS} 分。`
            : `Photograph things around you, then review. Each reviewed word +${EXPLORE_POINTS} pts.`}
        </p>
        <p className="mt-1 text-xs font-extrabold text-sky-800/70">
          {isZh
            ? `待复习 ${review.pendingCount} 个 · 已学 ${stats.wordCount} 个词`
            : `${review.pendingCount} to review · ${stats.wordCount} learned`}
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-5 w-full rounded-[32px] border-b-8 border-sky-700 bg-sky-400 py-6 font-display text-3xl text-white disabled:opacity-70"
        >
          {busy ? (isZh ? "正在识别…" : "Recognizing...") : (isZh ? "📷 拍照" : "📷 Take Photo")}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />

        {error ? (
          <p className="mt-4 rounded-2xl bg-rose-100 px-4 py-3 text-center text-sm font-extrabold text-rose-600">{error}</p>
        ) : null}

        {photo ? (
          <img src={photo} alt="探索照片" className="mt-4 h-48 w-full rounded-[28px] border-4 border-white object-cover" />
        ) : (
          <div className="mt-4 flex h-48 items-center justify-center rounded-[28px] border-4 border-dashed border-white/80 bg-white/50 font-extrabold text-sky-700/70">
            {isZh ? "对着杯子、书本、玩具拍一张吧" : "Take a photo of a cup, book, or toy"}
          </div>
        )}

        {result ? (
          <section className="mt-4 rounded-[32px] border-4 border-white bg-white/90 p-5 text-center">
            <div className="text-6xl">{result.emoji}</div>
            <p className="mt-2 font-display text-4xl text-violet-800">{displayWord}</p>
            <p className="mt-2 text-lg font-extrabold text-violet-500">{displaySentence}</p>
            {result.mocked ? (
              <p className="mt-2 text-xs font-bold text-amber-600">
                {isZh ? "当前是演示识别。配置视觉 API 后可识别真实物体。" : "Demo mode. Configure vision API for real recognition."}
              </p>
            ) : null}
            <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-extrabold text-amber-700">
              {isZh ? "新单词已记录，完成复习才能获得积分！" : "Word saved. Review it to earn points!"}
            </p>
            <button
              type="button"
              onClick={replay}
              className="mt-4 w-full rounded-2xl bg-violet-100 py-3 font-extrabold text-violet-700"
            >
              {isZh ? "再听一遍" : "Listen Again"}
            </button>
            <Link
              to="/child/explore/review"
              className="mt-3 block w-full rounded-2xl bg-violet-500 py-3 font-display text-xl text-white"
            >
              {isZh ? "去复习拿积分" : "Review for points"}
            </Link>
          </section>
        ) : null}

        <Link
          to="/child/explore/review"
          className="mt-5 block rounded-[28px] border-4 border-white bg-white/90 px-4 py-4 text-center"
        >
          <div className="font-display text-xl text-violet-800">{isZh ? "今日单词复习" : "Today's Review"}</div>
          <div className="text-xs font-extrabold text-violet-400">
            {review.pendingCount > 0
              ? isZh
                ? `还有 ${review.pendingCount} 个单词等你复习`
                : `${review.pendingCount} words waiting`
              : isZh
                ? "复习后才能获得积分"
                : "Review to earn points"}
          </div>
        </Link>

        <Link
          to="/child/explore/words"
          className="mt-3 block rounded-[28px] border-4 border-white bg-white/80 px-4 py-4 text-center"
        >
          <div className="font-display text-xl text-violet-800">{isZh ? "我的单词本" : "My Word Book"}</div>
          <div className="text-xs font-extrabold text-violet-400">{isZh ? "看过的单词都记在这里" : "Words you've learned"}</div>
        </Link>

        <ChildBottomNav />
      </div>
    </div>
  );
}