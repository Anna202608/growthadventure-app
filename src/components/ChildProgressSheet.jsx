import { getChildProgress, getStoryLearningSummary } from "../db.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useLiveData } from "../hooks/useLiveData.js";
import ChildAvatar from "./ChildAvatar.jsx";

function formatDate(value) {
  const raw = String(value || "");
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function statusMeta(status, isZh) {
  if (status === "awaiting_confirm") {
    return { label: isZh ? "待家长确认" : "Awaiting parent", className: "bg-amber-100 text-amber-700" };
  }
  if (status === "in_progress") {
    return { label: isZh ? "进行中" : "In progress", className: "bg-sky-100 text-sky-700" };
  }
  if (status === "overdue") {
    return { label: isZh ? "已逾期" : "Overdue", className: "bg-rose-100 text-rose-600" };
  }
  if (status === "completed") {
    return { label: isZh ? "已完成" : "Done", className: "bg-emerald-100 text-emerald-700" };
  }
  return { label: isZh ? "待开始" : "To do", className: "bg-orange-100 text-orange-700" };
}

export default function ChildProgressSheet({ childId, onClose }) {
  useLiveData();
  const { language } = useLanguage();
  const isZh = language === "zh";
  const progress = getChildProgress(childId);
  const story = getStoryLearningSummary(childId);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-stone-900/45" aria-label={isZh ? "关闭" : "Close"} onClick={onClose} />
      <div className="ledger-sheet relative z-10 flex max-h-[86vh] w-full max-w-md flex-col rounded-t-[32px] border-4 border-b-0 border-white bg-gradient-to-b from-orange-50 to-amber-50 p-5 shadow-[0_-12px_30px_rgba(194,65,12,0.2)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-amber-100 text-3xl shadow-[0_4px_0_rgba(194,65,12,0.2)]">
              <ChildAvatar avatar={progress.child.avatar} className="h-full w-full" textClassName="text-3xl" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-orange-700">
                {progress.child.name}
                {isZh ? "的任务" : "'s tasks"}
              </h2>
              <p className="text-xs font-extrabold text-orange-500">
                {isZh ? "家庭关联 · 点击头像即可查看" : "Linked by family · Tap avatar to view"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xl font-extrabold text-orange-600"
            aria-label={isZh ? "关闭" : "Close"}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard value={progress.points} label={isZh ? "当前积分" : "Points"} tone="text-orange-500" />
          <StatCard value={progress.counts.completed} label={isZh ? "已完成" : "Done"} tone="text-emerald-500" />
          <StatCard value={progress.streak} label={isZh ? "连续打卡" : "Streak"} tone="text-sky-500" />
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-4 pt-4">
          <section>
            <h3 className="font-display text-lg text-sky-700">
              {isZh ? "进行中 / 待完成" : "Open tasks"}
              <span className="ml-2 text-sm font-extrabold text-sky-400">{progress.counts.open}</span>
            </h3>
            <div className="mt-2 space-y-2">
              {progress.openTasks.length === 0 ? (
                <p className="rounded-2xl bg-white px-4 py-4 text-center font-bold text-sky-500">
                  {isZh ? "📋 暂无待完成任务，休息一下吧！" : "📋 No open tasks right now."}
                </p>
              ) : (
                progress.openTasks.map((task) => {
                  const meta = statusMeta(task.status, isZh);
                  return (
                    <article key={task.id} className="rounded-2xl border-2 border-orange-100 bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-extrabold text-violet-800">📝 {task.title}</p>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold ${meta.className}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-extrabold text-amber-500">
                        {isZh ? "完成后 +" : "Reward +"}
                        {task.points}
                        {isZh ? " 分" : " pts"}
                      </p>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section>
            <h3 className="font-display text-lg text-emerald-700">
              {isZh ? "已完成任务" : "Completed"}
              <span className="ml-2 text-sm font-extrabold text-emerald-400">{progress.counts.completed}</span>
            </h3>
            <div className="mt-2 space-y-2">
              {progress.completions.length === 0 ? (
                <p className="rounded-2xl bg-white px-4 py-4 text-center font-bold text-emerald-500">
                  {isZh ? "🎉 暂无已完成任务，继续加油！" : "🎉 No completed tasks yet."}
                </p>
              ) : (
                progress.completions.map((item) => (
                  <article key={item.id} className="rounded-2xl border-2 border-emerald-100 bg-white px-4 py-3">
                    <p className="font-extrabold text-violet-800">📝 {item.title}</p>
                    <p className="mt-1 text-sm font-extrabold text-emerald-600">
                      +{item.points}
                      {isZh ? " 分" : " pts"} · {formatDate(item.date || item.completedAt)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="font-display text-lg text-fuchsia-700">
              {isZh ? "绘本词汇" : "Storybook words"}
              <span className="ml-2 text-sm font-extrabold text-fuchsia-400">{story.words.length}</span>
            </h3>
            {story.badges.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {story.badges.map((badge) => (
                  <span key={`${badge.id}-${badge.awardedAt}`} className="rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-fuchsia-700">
                    {badge.emoji} {isZh ? badge.nameZh : badge.nameEn}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {story.words.length === 0 ? (
                <p className="w-full rounded-2xl bg-white px-4 py-4 text-center font-bold text-fuchsia-400">
                  {isZh ? "还没有绘本单词" : "No storybook words yet"}
                </p>
              ) : (
                story.words.map((word) => (
                  <span key={`${word.zh}-${word.en}`} className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-violet-700">
                    {word.emoji} {word.zh} / {word.en}
                  </span>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, tone }) {
  return (
    <div className="rounded-2xl border-4 border-white bg-white/90 p-3 text-center">
      <p className={`font-display text-2xl ${tone}`}>{value}</p>
      <p className="text-[11px] font-bold text-orange-800/70">{label}</p>
    </div>
  );
}
