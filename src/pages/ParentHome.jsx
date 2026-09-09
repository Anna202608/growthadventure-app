import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import FeedbackReportLink from "../components/FeedbackReportLink.jsx";
import EmptyTaskGuide from "../components/EmptyTaskGuide.jsx";
import WelcomeGuide from "../components/WelcomeGuide.jsx";
import TaskLedger from "../components/TaskLedger.jsx";
import ChildProgressSheet from "../components/ChildProgressSheet.jsx";
import EditChildNickname from "../components/EditChildNickname.jsx";
import ChildAvatar, { isPhotoAvatar } from "../components/ChildAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { isDemoUser, needsWelcome } from "../onboarding.js";
import { parentDisplayName, childDisplayName } from "../names.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import {
  childLabel,
  confirmTask,
  fulfillRedemption,
  getAllFamilyTasks,
  getAwaitingTasks,
  getFamilyChildren,
  getOnlyChild,
  getPendingRedemptions,
  getPoints,
  getTransactions,
  setCurrentChildId,
} from "../db.js";
import { useLiveData } from "../hooks/useLiveData.js";

function getKidsForParent(user) {
  const familyKids = isDemoUser(user) ? [] : getFamilyChildren();
  const only = getOnlyChild();
  const byId = new Map();
  for (const kid of familyKids) {
    if (kid?.id) byId.set(String(kid.id), kid);
  }
  if (only?.id && only.name !== "还没有绑定孩子") {
    const prev = byId.get(String(only.id));
    byId.set(String(only.id), prev ? { ...prev, ...only, nickname: only.nickname || prev.nickname, avatar: isPhotoAvatar(only.avatar) ? only.avatar : only.avatar || prev.avatar } : only);
  }
  return Array.from(byId.values());
}

export default function ParentHome() {
  useLiveData();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [showWelcome, setShowWelcome] = useState(() => needsWelcome(user));
  const [progressChildId, setProgressChildId] = useState(null);
  const [editingChild, setEditingChild] = useState(null);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const child = getOnlyChild();
  const parentName = parentDisplayName(user);
  const childName = childDisplayName();
  const kids = getKidsForParent(user);
  const editingChildLive = editingChild
    ? kids.find((kid) => String(kid.id) === String(editingChild.id)) || editingChild
    : null;
  const points = child?.id ? getPoints(child.id) : 0;
  const feed = child?.id ? getTransactions(child.id).slice(0, 5) : [];
  const awaiting = getAwaitingTasks();
  const pendingRedeem = getPendingRedemptions();
  const noTasks = getAllFamilyTasks().length === 0;
  const demo = isDemoUser(user);
  const childNameById = Object.fromEntries(kids.filter(Boolean).map((kid) => [kid.id, childLabel(kid)]));

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-orange-300 via-amber-200 to-rose-200">
      <div className="blob pointer-events-none absolute -right-12 -top-8 h-40 w-40 rounded-full bg-yellow-200/80" />
      <div
        className="blob pointer-events-none absolute -left-10 top-40 h-32 w-32 rounded-full bg-pink-300/70"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-8">
        {showWelcome ? (
          <WelcomeGuide role="parent" userId={user.userId} onDone={() => setShowWelcome(false)} />
        ) : null}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-orange-800/70">成长大冒险</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/choose-role")}
                className="text-sm font-extrabold text-white/80 underline decoration-2 underline-offset-4"
              >
                ← {isZh ? "返回" : "Back"}
              </button>
              <h1 className="font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(194,65,12,0.35)]">
                Hello，{parentName}！
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => child?.id && setProgressChildId(child.id)}
              className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-amber-100 text-3xl shadow-[0_6px_0_rgba(194,65,12,0.25)]"
              aria-label={isZh ? "查看孩子任务完成情况" : "View child task progress"}
            >
              <ChildAvatar avatar={child?.avatar} className="h-full w-full" textClassName="text-3xl" />
            </button>
            <p className="mt-1 text-[10px] font-extrabold text-white/90">{isZh ? "点头像看任务" : "Tap for tasks"}</p>
            <FeedbackReportLink className="mt-1 block text-center text-xs font-extrabold text-white/90 underline decoration-2 underline-offset-4" />
          </div>
        </header>

        <section className="mt-6 rounded-[32px] border-4 border-white bg-white/90 px-5 py-6 text-center shadow-[0_10px_0_rgba(249,115,22,0.35)]">
          <p className="text-sm font-extrabold text-orange-500">
            {isZh ? "当前总积分" : "Total Points"}
          </p>
          <p className="font-display text-7xl leading-none text-orange-500">{points}</p>
          <p className="mt-2 text-sm font-bold text-orange-800/70">
            <TaskLedger childId={child?.id} className="font-bold text-orange-800/70">{childName}</TaskLedger> {isZh ? "的冒险金币" : "'s Adventure Coins"}
          </p>
        </section>

        {kids.filter(Boolean).length > 0 ? (
          <div className="mt-4 space-y-2">
            {kids.filter(Boolean).map((kid) => (
              <div
                key={kid.id}
                className={`flex items-center gap-2 rounded-2xl px-2 py-2 ${
                  child?.id === kid.id ? "bg-orange-400 text-white" : "bg-white/80 text-orange-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setCurrentChildId(kid.id);
                    setProgressChildId(kid.id);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1 text-left text-sm font-extrabold"
                >
                  <ChildAvatar avatar={kid.avatar} className="h-8 w-8" textClassName="text-lg" />
                  <span className="truncate">{childLabel(kid)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingChild(kid)}
                  className={`shrink-0 rounded-full px-3 py-2 text-sm font-extrabold ${
                    child?.id === kid.id ? "bg-white/25 text-white" : "bg-orange-100 text-orange-700"
                  }`}
                  aria-label={isZh ? "编辑昵称" : "Edit nickname"}
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {awaiting.length > 0 ? (
          <section className="mt-5">
            <h2 className="font-display text-xl text-orange-800">{isZh ? "待确认完成" : "Awaiting Confirmation"}</h2>
            {awaiting.map((task) => (
              <article key={task.id} className="mt-3 rounded-[28px] border-4 border-white bg-white p-4">
                <p className="font-display text-xl text-violet-800">{task.title}</p>
                <p className="text-sm font-extrabold text-amber-500">
                  {childNameById[task.childId] ? `${childNameById[task.childId]} · ` : ""}
                  {isZh ? "确认后 +" : "Confirm +"}
                  {task.points} {isZh ? "分" : "pts"}
                </p>
                {task.photo ? (
                  <img src={task.photo} alt={isZh ? "打卡照片" : "Photo"} className="mt-3 h-44 w-full rounded-2xl object-cover" />
                ) : (
                  <p className="mt-2 text-sm font-bold text-rose-500">{isZh ? "没有照片" : "No photo"}</p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => confirmTask(task.id, true)}
                    className="rounded-2xl border-b-8 border-emerald-700 bg-emerald-400 py-3 font-display text-lg text-white"
                  >
                    {isZh ? "确认完成" : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmTask(task.id, false)}
                    className="rounded-2xl bg-rose-100 py-3 font-extrabold text-rose-600"
                  >
                    {isZh ? "退回" : "Reject"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {pendingRedeem.length > 0 ? (
          <section className="mt-5">
            <h2 className="font-display text-xl text-orange-800">{isZh ? "待兑现" : "Pending Rewards"}</h2>
            {pendingRedeem.map((item) => (
              <article key={item.id} className="mt-3 rounded-[28px] border-4 border-white bg-white p-4">
                <p className="font-display text-xl text-violet-800">{item.title}</p>
                <p className="text-sm font-bold text-violet-400">
                  {childNameById[item.childId] ? `${childNameById[item.childId]} · ` : ""}
                  {isZh ? "已扣 " : "Deducted "}
                  {item.cost} {isZh ? "分" : "pts"} · {item.date}
                </p>
                <button
                  type="button"
                  onClick={() => fulfillRedemption(item.id)}
                  className="mt-3 w-full rounded-2xl border-b-8 border-fuchsia-700 bg-fuchsia-400 py-3 font-display text-lg text-white"
                >
                  {isZh ? "已兑现" : "Fulfilled"}
                </button>
              </article>
            ))}
          </section>
        ) : null}

        {!demo && noTasks ? (
          <div className="mt-5">
            <EmptyTaskGuide role="parent" />
          </div>
        ) : null}

        <section className="mt-5 grid grid-cols-2 gap-3">
          <Link
            to="/parent/tasks/new"
            className="rounded-[28px] border-4 border-b-8 border-emerald-600 bg-emerald-400 p-4 text-white"
          >
            <div className="text-3xl">📝</div>
            <div className="mt-2 font-display text-xl leading-tight">{isZh ? "创建任务" : "Create Task"}</div>
            <div className="mt-1 text-xs font-bold text-emerald-50">{isZh ? "名称 + 积分" : "Name + Points"}</div>
          </Link>
          <Link
            to="/parent/rewards"
            className="rounded-[28px] border-4 border-b-8 border-fuchsia-600 bg-fuchsia-400 p-4 text-white"
          >
            <div className="text-3xl">🎁</div>
            <div className="mt-2 font-display text-xl leading-tight">{isZh ? "心愿商店" : "Wish Shop"}</div>
            <div className="mt-1 text-xs font-bold text-fuchsia-50">{isZh ? "实物奖励" : "Real Rewards"}</div>
          </Link>
          <Link
            to="/parent/stats"
            className="rounded-[28px] border-4 border-b-8 border-sky-600 bg-sky-400 p-4 text-white"
          >
            <div className="font-display text-xl">{isZh ? "成长数据" : "Growth Data"}</div>
            <div className="mt-1 text-xs font-bold text-sky-50">{isZh ? "看看这周完成了多少" : "Weekly Progress"}</div>
          </Link>
          <Link
            to="/parent/family"
            className="rounded-[28px] border-4 border-b-8 border-violet-600 bg-violet-400 p-4 text-white"
          >
            <div className="font-display text-xl">📊 {isZh ? "健康管理" : "Health Management"}</div>
            <div className="mt-1 text-xs font-bold text-violet-50">{isZh ? "记录身高体重" : "Height & Weight"}</div>
          </Link>
          <Link
            to="/parent/exchange"
            className="col-span-2 rounded-[28px] border-4 border-b-8 border-teal-600 bg-teal-400 p-4 text-white"
          >
            <div className="font-display text-xl">{isZh ? "语言交换工作室" : "Exchange Studio"}</div>
            <div className="mt-1 text-xs font-bold text-teal-50">
              {isZh ? "上传 · 家长审核 · 家庭配对" : "Upload · Parent review · Pairing"}
            </div>
          </Link>
        </section>

        <section className="mt-5 flex-1 rounded-[28px] border-4 border-white bg-white/80 p-4">
          <h2 className="font-display text-xl text-violet-700">{isZh ? "最近动态" : "Recent Activity"}</h2>
          <ul className="mt-3 space-y-2">
            {feed.length === 0 ? (
              <li className="font-bold text-violet-400">{isZh ? "还没有积分记录" : "No points records yet"}</li>
            ) : (
              feed.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-2xl bg-violet-50 px-3 py-3">
                  <div>
                    <p className="font-extrabold text-violet-900">{item.reason.replace("完成：", "").replace("兑换：", "")}</p>
                    <p className="text-xs font-bold text-violet-400">{item.date}</p>
                  </div>
                  <span className={`font-display text-lg ${item.type === "earn" ? "text-emerald-500" : "text-rose-500"}`}>
                    {item.type === "earn" ? "+" : "-"}
                    {item.amount}{isZh ? "分" : "pts"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        {editingChildLive ? <EditChildNickname child={editingChildLive} onClose={() => setEditingChild(null)} /> : null}
        {progressChildId ? (
          <ChildProgressSheet childId={progressChildId} onClose={() => setProgressChildId(null)} />
        ) : null}

        <div className="mt-5 pb-2">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full rounded-2xl border-4 border-white bg-white/80 py-3 text-center text-sm font-extrabold text-orange-800 shadow-[0_4px_0_rgba(194,65,12,0.18)]"
          >
            {isZh ? "退出登录" : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}