import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getOnlyChild, getTaskCompletions, getTransactions, getStreak, childLabel, getBookProgress, getStoryLearningSummary } from "../db.js";
import catalog from "../data/books.json";
import { useLiveData } from "../hooks/useLiveData.js";

export default function ParentStats() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [view, setView] = useState("week");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const child = getOnlyChild();
  const childId = child?.id;
  const completions = childId ? getTaskCompletions(childId) : [];
  const transactions = childId ? getTransactions(childId) : [];
  const streak = childId ? getStreak(childId) : 0;
  const story = childId ? getStoryLearningSummary(childId) : { books: {}, badges: [], words: [] };
  const bookList = Array.isArray(catalog.books) ? catalog.books : [];

  const today = new Date();
  const days = view === "week" ? 7 : 30;
  const labels = [];
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    labels.push(dateStr.slice(5));
    const count = completions.filter((c) => c.date === dateStr).length;
    data.push(count);
  }

  const totalTasks = completions.length;
  const totalEarned = transactions
    .filter((t) => t.type === "earn")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = transactions
    .filter((t) => t.type === "spend")
    .reduce((sum, t) => sum + t.amount, 0);

  const maxVal = Math.max(...data, 1);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-orange-300 via-amber-200 to-rose-200">
      <div className="relative z-10 mx-auto max-w-md px-5 pb-8 pt-8">
        <Link to="/parent" className="inline-block text-sm font-extrabold text-orange-800/70">
          ← {isZh ? "返回" : "Back"}
        </Link>

        <h1 className="mt-4 font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(194,65,12,0.35)]">
          {isZh ? "📊 成长数据" : "📊 Growth Data"}
        </h1>
        <p className="mt-1 text-sm font-extrabold text-orange-800/70">
          {childLabel(child)} {isZh ? "的成长记录" : "'s Growth Record"}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border-4 border-white bg-white/90 p-3 text-center">
            <p className="text-2xl font-display text-orange-500">{totalTasks}</p>
            <p className="text-xs font-bold text-orange-800/70">{isZh ? "完成任务" : "Tasks Done"}</p>
          </div>
          <div className="rounded-2xl border-4 border-white bg-white/90 p-3 text-center">
            <p className="text-2xl font-display text-emerald-500">{totalEarned}</p>
            <p className="text-xs font-bold text-orange-800/70">{isZh ? "获得积分" : "Earned"}</p>
          </div>
          <div className="rounded-2xl border-4 border-white bg-white/90 p-3 text-center">
            <p className="text-2xl font-display text-sky-500">{streak}</p>
            <p className="text-xs font-bold text-orange-800/70">{isZh ? "连续打卡" : "Streak"}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setView("week")}
            className={`flex-1 rounded-2xl py-2 font-bold ${view === "week" ? "border-b-4 border-orange-700 bg-orange-400 text-white" : "bg-white/80 text-orange-700"}`}
          >
            {isZh ? "本周" : "Week"}
          </button>
          <button
            onClick={() => setView("month")}
            className={`flex-1 rounded-2xl py-2 font-bold ${view === "month" ? "border-b-4 border-orange-700 bg-orange-400 text-white" : "bg-white/80 text-orange-700"}`}
          >
            {isZh ? "本月" : "Month"}
          </button>
        </div>

        <div className="mt-4 rounded-[28px] border-4 border-white bg-white/90 p-4 shadow-[0_8px_0_rgba(249,115,22,0.25)]">
          <h2 className="font-display text-xl text-orange-700">{isZh ? "任务完成趋势" : "Task Completion Trend"}</h2>
          <div className="mt-3 flex h-32 items-end gap-1">
            {data.map((count, idx) => (
              <div key={idx} className="flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t-lg bg-orange-400 transition-all"
                  style={{ height: `${(count / maxVal) * 80 + 4}px` }}
                />
                <span className="mt-1 text-[10px] font-bold text-orange-700">{labels[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[28px] border-4 border-white bg-white/90 p-4 shadow-[0_8px_0_rgba(249,115,22,0.25)]">
          <h2 className="font-display text-xl text-orange-700">{isZh ? "绘本阅读" : "Storybooks"}</h2>
          {bookList.length === 0 ? (
            <p className="mt-3 text-center text-sm font-bold text-orange-400">{isZh ? "还没有绘本" : "No books"}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {bookList.map((book) => {
                const record = childId ? getBookProgress(book.id, childId) : { completedPageIds: [], finished: false };
                return (
                  <li key={book.id} className="rounded-2xl bg-fuchsia-50 px-3 py-3">
                    <p className="font-extrabold text-violet-800">
                      {book.coverEmoji} {isZh ? book.series.zh : book.series.en}
                    </p>
                    <p className="text-sm font-bold text-fuchsia-600">
                      {isZh ? book.title.zh : book.title.en} · {record.completedPageIds.length}/{book.pages.length}
                      {record.finished ? (isZh ? " · 已读完" : " · finished") : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
          <h3 className="mt-4 font-display text-lg text-orange-700">{isZh ? "已学词汇" : "Words learned"}</h3>
          {story.words.length === 0 ? (
            <p className="mt-2 text-sm font-bold text-orange-400">{isZh ? "还没有绘本单词" : "No storybook words yet"}</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {story.words.map((word) => (
                <span key={`${word.zh}-${word.en}`} className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-violet-700">
                  {word.emoji} {word.zh} / {word.en}
                </span>
              ))}
            </div>
          )}
          {story.badges.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {story.badges.map((badge) => (
                <span key={`${badge.id}-${badge.awardedAt}`} className="rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-fuchsia-700">
                  {badge.emoji} {isZh ? badge.nameZh : badge.nameEn}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-[28px] border-4 border-white bg-white/90 p-4 shadow-[0_8px_0_rgba(249,115,22,0.25)]">
          <h2 className="font-display text-xl text-orange-700">{isZh ? "最近完成" : "Recent Completions"}</h2>
          {completions.length === 0 ? (
            <p className="mt-3 text-center text-sm font-bold text-orange-400">{isZh ? "还没有完成的任务" : "No completed tasks yet"}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {completions.slice(0, 10).map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-2xl bg-orange-50 px-3 py-2">
                  <div>
                    <p className="font-extrabold text-orange-900">{item.title}</p>
                    <p className="text-xs font-bold text-orange-400">{item.date}</p>
                  </div>
                  <span className="font-display text-emerald-500">+{item.points}{isZh ? "分" : "pts"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}