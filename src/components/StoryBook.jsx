import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useLiveData } from "../hooks/useLiveData.js";
import { BOOK_PAGE_POINTS, completeBookPage, getBookProgress } from "../db.js";
import { speakText } from "../language.js";

const SWIPE = 56;

export default function StoryBook({ book }) {
  useLiveData();
  const { language } = useLanguage();
  const isZh = language === "zh";
  const pages = book.pages || [];
  const progress = getBookProgress(book.id);
  const [index, setIndex] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState("");
  const [badgePop, setBadgePop] = useState(false);
  const [drag, setDrag] = useState(0);
  const startX = useRef(0);
  const tracking = useRef(false);

  const page = pages[index];
  const done = page ? progress.completedPageIds.includes(page.id) : false;

  useEffect(() => {
    setQuizOpen(false);
    setDrag(0);
  }, [index, page?.id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function go(next) {
    const clamped = Math.max(0, Math.min(pages.length - 1, next));
    if (clamped === index) return;
    const current = pages[index];
    if (clamped > index && current && !progress.completedPageIds.includes(current.id)) {
      setQuizOpen(true);
      return;
    }
    setIndex(clamped);
  }

  function onPointerDown(event) {
    if (event.target.closest("button, a")) return;
    tracking.current = true;
    startX.current = event.clientX;
    setDrag(0);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!tracking.current) return;
    setDrag(event.clientX - startX.current);
  }

  function onPointerUp() {
    if (!tracking.current) return;
    tracking.current = false;
    const delta = drag;
    setDrag(0);
    if (delta <= -SWIPE) go(index + 1);
    else if (delta >= SWIPE) go(index - 1);
  }

  function speak(text, lang) {
    speakText(text, lang);
  }

  async function pickChoice(choice) {
    if (!page) return;
    if (choice.id !== page.quiz.answer) {
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
      setToast(isZh ? "再想想哦" : "Try again");
      return;
    }
    const result = completeBookPage({
      bookId: book.id,
      pageId: page.id,
      words: page.words,
      totalPages: pages.length,
      badge: book.badge,
      reason: isZh
        ? `绘本《${book.title.zh}》第 ${index + 1} 页`
        : `Storybook ${book.title.en} p.${index + 1}`,
    });
    setQuizOpen(false);
    if (result.awarded) {
      setToast(isZh ? `⭐ +${result.awarded} 分！` : `⭐ +${result.awarded} pts!`);
    } else {
      setToast(isZh ? "答对啦！" : "Correct!");
    }
    if (result.badgeAwardedNow) {
      setBadgePop(true);
    } else if (index < pages.length - 1) {
      window.setTimeout(() => setIndex((value) => value + 1), 500);
    }
  }

  if (!page) return null;

  return (
    <div className="relative">
      <div
        className={`storybook-stage select-none rounded-[32px] border-4 border-white bg-gradient-to-b ${page.bg} p-4 shadow-[0_10px_0_rgba(190,24,93,0.2)]`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ transform: `translateX(${drag * 0.35}px)` }}
      >
        <p className="text-center text-xs font-extrabold text-violet-500">
          {isZh ? `第 ${index + 1} / ${pages.length} 页 · 左右滑动翻页` : `Page ${index + 1} / ${pages.length} · swipe`}
        </p>
        <BookScene scene={page.scene} emoji={page.emoji} />
        <button
          type="button"
          className="mt-3 w-full rounded-2xl bg-white/80 px-3 py-3 text-left"
          onClick={() => speak(page.textZh, "zh-CN")}
        >
          <p className="text-sm font-extrabold text-violet-800">{page.textZh}</p>
          <p className="mt-1 text-[11px] font-bold text-fuchsia-400">{isZh ? "点这里听中文" : "Tap for Chinese"}</p>
        </button>
        <button
          type="button"
          className="mt-2 w-full rounded-2xl bg-white/70 px-3 py-3 text-left"
          onClick={() => speak(page.textEn, "en-US")}
        >
          <p className="text-sm font-bold italic text-violet-600">{page.textEn}</p>
          <p className="mt-1 text-[11px] font-bold text-sky-400">{isZh ? "点这里听英语" : "Tap for English"}</p>
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {page.words.map((word) => (
            <article key={`${word.en}-${word.zh}`} className="rounded-2xl border-4 border-white bg-white/90 p-3 text-center">
              <p className="text-3xl">{word.emoji}</p>
              <p className="font-display text-xl text-violet-800">{word.zh}</p>
              <p className="text-sm font-extrabold text-sky-600">{word.en}</p>
              <button
                type="button"
                className="mt-2 w-full rounded-xl bg-fuchsia-400 py-2 text-sm font-extrabold text-white"
                onClick={() => speak(isZh ? word.en : word.zh, isZh ? "en-US" : "zh-CN")}
              >
                {isZh ? "跟读 / 听发音" : "Listen & repeat"}
              </button>
            </article>
          ))}
        </div>

        {done ? (
          <p className="mt-3 text-center text-sm font-extrabold text-emerald-600">
            {isZh ? `本页已完成 · 已拿 +${BOOK_PAGE_POINTS} 分` : `Page done · +${BOOK_PAGE_POINTS} pts`}
          </p>
        ) : (
          <button
            type="button"
            className="mt-3 w-full rounded-2xl bg-orange-400 py-3 font-display text-xl text-white"
            onClick={() => setQuizOpen(true)}
          >
            {isZh ? "学完了，去选一选" : "Quiz time"}
          </button>
        )}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={index === 0}
            className="flex-1 rounded-2xl bg-white/80 py-2 font-extrabold text-violet-600 disabled:opacity-40"
            onClick={() => go(index - 1)}
          >
            {isZh ? "上一页" : "Prev"}
          </button>
          <button
            type="button"
            className="flex-1 rounded-2xl bg-white/80 py-2 font-extrabold text-violet-600"
            onClick={() => go(index + 1)}
          >
            {index === pages.length - 1 ? (isZh ? "结尾" : "End") : isZh ? "下一页" : "Next"}
          </button>
        </div>
      </div>

      {quizOpen ? (
        <div className="absolute inset-0 z-20 flex items-end rounded-[32px] bg-violet-950/40 p-3">
          <div className={`w-full rounded-[28px] bg-white p-4 ${shake ? "storybook-shake" : ""}`}>
            <p className="font-display text-xl text-violet-800">{isZh ? page.quiz.promptZh : page.quiz.promptEn}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {page.quiz.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className="rounded-2xl bg-fuchsia-50 py-4 text-center"
                  onClick={() => pickChoice(choice)}
                >
                  <span className="block text-3xl">{choice.emoji}</span>
                  <span className="mt-1 block text-xs font-extrabold text-violet-700">{isZh ? choice.zh : choice.en}</span>
                </button>
              ))}
            </div>
            <button type="button" className="mt-3 w-full font-extrabold text-violet-400" onClick={() => setQuizOpen(false)}>
              {isZh ? "先再看一看" : "Keep reading"}
            </button>
          </div>
        </div>
      ) : null}

      {toast ? (
        <p className="pointer-events-none absolute left-1/2 top-6 z-30 -translate-x-1/2 rounded-full bg-white px-4 py-2 font-extrabold text-fuchsia-600 shadow-lg">
          {toast}
        </p>
      ) : null}

      {badgePop ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[32px] bg-fuchsia-950/50 p-4">
          <div className="w-full rounded-[28px] bg-white p-5 text-center">
            <p className="text-6xl">{book.badge.emoji}</p>
            <p className="mt-2 font-display text-2xl text-violet-800">{isZh ? book.badge.name.zh : book.badge.name.en}</p>
            <p className="mt-1 text-sm font-extrabold text-fuchsia-500">
              {isZh ? "整本读完啦！徽章已收入个人中心" : "You finished the book! Badge saved."}
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-fuchsia-400 py-3 font-display text-xl text-white"
              onClick={() => setBadgePop(false)}
            >
              {isZh ? "太棒了" : "Yay"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BookScene({ scene, emoji }) {
  return (
    <div className={`storybook-scene storybook-scene-${scene}`}>
      <span className="storybook-scene-emoji">{emoji}</span>
      <span className="storybook-deco storybook-deco-a" />
      <span className="storybook-deco storybook-deco-b" />
      <span className="storybook-deco storybook-deco-c" />
    </div>
  );
}
