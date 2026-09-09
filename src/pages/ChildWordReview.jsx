import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import LanguageToggle from "../components/LanguageToggle.jsx";
import ChildBottomNav from "../components/ChildBottomNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useLiveData } from "../hooks/useLiveData.js";
import { speakText } from "../language.js";
import {
  EXPLORE_POINTS,
  completeExplorerReview,
  getExplorerReviewState,
} from "../db.js";

const DISTRACTORS = ["杯子", "书本", "椅子", "苹果", "猫咪", "花朵", "汽车", "鞋子", "帽子", "雨伞", "铅笔", "气球"];

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildChoices(item, pool) {
  const others = pool
    .filter((word) => word.id !== item.id && word.zh && word.zh !== item.zh)
    .map((word) => word.zh);
  const extra = DISTRACTORS.filter((zh) => zh !== item.zh);
  const distractors = shuffle([...new Set([...others, ...extra])]).slice(0, 2);
  return shuffle([item.zh, ...distractors]);
}

export default function ChildWordReview() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === "zh";
  const state = getExplorerReviewState();
  const [activeId, setActiveId] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [picked, setPicked] = useState("");
  const [wrong, setWrong] = useState("");
  const [toast, setToast] = useState("");

  const active = state.pending.find((item) => item.id === activeId) || null;
  const choicePool = [...state.pending, ...state.reviewed];
  const choices = useMemo(
    () => (active ? buildChoices(active, choicePool) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active?.id],
  );

  if (!user) {
    return <Navigate to="/" replace />;
  }

  function openCard(item) {
    setActiveId(item.id);
    setFlipped(false);
    setPicked("");
    setWrong("");
    speakText(item.en, "en");
  }

  function submitChoice(zh) {
    if (!active || picked) return;
    setPicked(zh);
    if (zh !== active.zh) {
      setWrong(zh);
      setTimeout(() => {
        setPicked("");
        setWrong("");
      }, 700);
      return;
    }
    const result = completeExplorerReview(active.id);
    if (result.ok) {
      setToast(`+${result.awarded} ${isZh ? "积分" : "pts"}`);
      setTimeout(() => setToast(""), 1600);
    }
    setActiveId(null);
    setFlipped(false);
    setPicked("");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-violet-300 via-sky-200 to-cyan-200">
      <div className="relative z-10 mx-auto max-w-md px-4 pb-20 pt-4">
        {toast ? (
          <div className="pointer-events-none fixed left-1/2 top-24 z-40 -translate-x-1/2 rounded-full bg-emerald-500 px-5 py-2 font-display text-2xl text-white shadow-lg">
            {toast}
          </div>
        ) : null}

        <header className="flex items-start justify-between gap-3">
          <div>
            <Link to="/child/explore" className="text-sm font-extrabold text-violet-900/70">
              ← {isZh ? "返回世界探索" : "Back"}
            </Link>
            <h1 className="mt-2 font-display text-3xl leading-none text-white drop-shadow-[0_3px_0_rgba(91,33,182,0.35)]">
              {isZh ? "今日单词复习" : "Today's Review"}
            </h1>
          </div>
          <LanguageToggle />
        </header>

        <p className="mt-3 rounded-[24px] border-4 border-white bg-white/85 px-4 py-3 text-sm font-extrabold text-violet-700">
          {isZh
            ? `今日待复习 ${state.pendingCount} 个单词，已复习 ${state.reviewedCount} 个，已获得 ${state.earnedPoints} 积分`
            : `Pending ${state.pendingCount}, reviewed ${state.reviewedCount}, earned ${state.earnedPoints} pts`}
        </p>

        {!state.hasAnyToday ? (
          <section className="mt-5 rounded-[32px] border-4 border-white bg-white/90 px-5 py-10 text-center">
            <p className="text-5xl">📷</p>
            <p className="mt-3 font-extrabold text-violet-600">
              {isZh ? "今天还没有新单词，去拍张照吧！" : "No new words yet. Go take a photo!"}
            </p>
            <Link
              to="/child/explore"
              className="mt-5 inline-block rounded-2xl bg-violet-500 px-5 py-3 font-display text-xl text-white"
            >
              {isZh ? "去世界探索" : "World Explorer"}
            </Link>
          </section>
        ) : null}

        {active ? (
          <section className="mt-5 rounded-[32px] border-4 border-white bg-white/95 p-5 text-center">
            <button
              type="button"
              onClick={() => setFlipped((value) => !value)}
              className="w-full rounded-[28px] bg-violet-50 px-4 py-6"
            >
              <p className="text-5xl">{active.emoji || "🔍"}</p>
              {active.photo ? (
                <img
                  src={active.photo}
                  alt=""
                  className="mx-auto mt-3 h-28 w-28 rounded-3xl object-cover"
                />
              ) : null}
              <p className="mt-3 font-display text-4xl text-violet-800">{flipped ? active.zh : active.en}</p>
              <p className="mt-2 text-sm font-bold text-violet-400">
                {flipped
                  ? active.zhSentence || (isZh ? "再点一次看英文" : "Tap to see English")
                  : isZh
                    ? "点卡片看中文，再选出正确意思"
                    : "Tap to flip, then pick the meaning"}
              </p>
            </button>
            <p className="mt-4 text-sm font-extrabold text-violet-500">
              {isZh ? "看英文，选出正确的中文" : "Pick the Chinese meaning"}
            </p>
            <div className="mt-3 grid gap-2">
              {choices.map((zh) => (
                <button
                  key={zh}
                  type="button"
                  onClick={() => submitChoice(zh)}
                  className={`rounded-2xl border-4 px-4 py-3 font-display text-2xl ${
                    wrong === zh
                      ? "border-rose-300 bg-rose-100 text-rose-600"
                      : picked === zh && zh === active.zh
                        ? "border-emerald-400 bg-emerald-100 text-emerald-700"
                        : "border-violet-100 bg-white text-violet-800"
                  }`}
                >
                  {zh}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveId(null);
                setFlipped(false);
              }}
              className="mt-4 font-extrabold text-violet-400"
            >
              {isZh ? "先复习别的词" : "Review another word"}
            </button>
          </section>
        ) : null}

        {state.pendingCount > 0 && !active ? (
          <section className="mt-5">
            <h2 className="font-display text-xl text-violet-800">{isZh ? "待复习" : "To review"}</h2>
            <div className="mt-2 space-y-3">
              {state.pending.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openCard(item)}
                  className="flex w-full items-center gap-3 rounded-[28px] border-4 border-white bg-white/90 p-3 text-left"
                >
                  {item.photo ? (
                    <img src={item.photo} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                      {item.emoji || "🔍"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-2xl text-violet-800">{item.en}</p>
                    <p className="text-xs font-extrabold text-violet-400">
                      {isZh ? `点开复习，完成后 +${EXPLORE_POINTS} 分` : `Review to earn +${EXPLORE_POINTS} pts`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {state.reviewedCount > 0 && !active ? (
          <section className="mt-5">
            <h2 className="font-display text-xl text-emerald-700">{isZh ? "已复习" : "Reviewed"}</h2>
            <div className="mt-2 space-y-3">
              {state.reviewed.map((item) => (
                <article
                  key={item.id}
                  className="flex items-center gap-3 rounded-[28px] border-4 border-white bg-white/80 p-3"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                    ✅
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-2xl text-emerald-800">
                      {item.en} · {item.zh}
                    </p>
                    <p className="text-xs font-extrabold text-emerald-500">
                      {isZh ? `已获得 +${item.awarded || EXPLORE_POINTS} 分` : `Earned +${item.awarded || EXPLORE_POINTS} pts`}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <ChildBottomNav />
      </div>
    </div>
  );
}
