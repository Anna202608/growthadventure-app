// 橙色版本 2026-09-06
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getOnlyChild, getPoints, childLabel, getExplorerReviewState, getChildBadges } from "../db.js";
import { useLiveData } from "../hooks/useLiveData.js";
import FeedbackReportLink from "../components/FeedbackReportLink.jsx";
import TaskList from "../components/TaskList.jsx";
import ChildBottomNav from "../components/ChildBottomNav.jsx";
import ChildAvatar from "../components/ChildAvatar.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function ChildHome() {
  useLiveData();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const isZh = language === 'zh';

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const child = getOnlyChild();
  const childId = child?.id;
  const points = childId ? getPoints(childId) : 0;
  const review = getExplorerReviewState();
  const badges = childId ? getChildBadges(childId) : [];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-orange-300 via-amber-200 to-yellow-200">
      <div className="blob pointer-events-none absolute -right-12 -top-8 h-40 w-40 rounded-full bg-orange-200/60" />
      <div
        className="blob pointer-events-none absolute -left-10 top-40 h-32 w-32 rounded-full bg-amber-300/60"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-20 pt-4">
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
              <h1 className="font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(180,100,20,0.35)]">
                {childLabel(child)} 👋
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-amber-100 text-3xl shadow-[0_6px_0_rgba(180,100,20,0.25)]">
              <ChildAvatar avatar={child?.avatar} className="h-full w-full" textClassName="text-3xl" />
            </div>
            <FeedbackReportLink className="mt-1 block text-center text-xs font-extrabold text-white/90 underline decoration-2 underline-offset-4">
              举报
            </FeedbackReportLink>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="mt-1 text-sm font-bold text-white underline decoration-2 underline-offset-4"
            >
              {isZh ? "退出登录" : "Logout"}
            </button>
          </div>
        </header>

        <section className="mt-4 rounded-[32px] border-4 border-white bg-white/90 px-5 py-5 text-center shadow-[0_10px_0_rgba(200,120,30,0.35)]">
          <p className="text-sm font-extrabold text-orange-500">{isZh ? "我的积分" : "My Points"}</p>
          <p className="font-display text-6xl leading-none text-orange-500">{points}</p>
          <p className="mt-1 text-sm font-bold text-orange-800/70">{isZh ? "继续加油，小勇士！" : "Keep going, little warrior!"}</p>
          <p className="text-xs font-bold text-orange-400">
            {isZh ? "做完任务拍照，等家长确认就能加分" : "Complete tasks, upload photos, get points!"}
          </p>
        </section>

        <section className="mt-4 rounded-[28px] border-4 border-white bg-white/90 px-4 py-4">
          <p className="font-display text-xl text-violet-800">{isZh ? "我的徽章" : "My Badges"}</p>
          {badges.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <div key={`${badge.id}-${badge.awardedAt}`} className="rounded-2xl bg-fuchsia-50 px-3 py-2 text-center">
                  <p className="text-2xl">{badge.emoji}</p>
                  <p className="text-xs font-extrabold text-fuchsia-700">{isZh ? badge.nameZh : badge.nameEn}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm font-extrabold text-fuchsia-400">
              {isZh ? "读完整本《语言精灵的魔法词典》可获得「小小阅读家」" : "Finish the storybook to earn Little Reader"}
            </p>
          )}
        </section>

        {review.pendingCount > 0 ? (
          <Link
            to="/child/explore/review"
            className="mt-4 block rounded-[28px] border-4 border-white bg-white/90 px-4 py-4"
          >
            <p className="font-display text-xl text-violet-800">{isZh ? "今日单词复习" : "Today's Review"}</p>
            <p className="text-sm font-extrabold text-violet-500">
              {isZh
                ? `还有 ${review.pendingCount} 个新单词，复习完才能拿积分`
                : `${review.pendingCount} new words waiting for points`}
            </p>
          </Link>
        ) : null}

        <section className="mt-4 flex-1 rounded-[28px] border-4 border-white bg-white/80 p-4">
          <h2 className="font-display text-xl text-orange-700">{isZh ? "我的任务" : "My Tasks"}</h2>
          <TaskList childId={childId} />
        </section>

        <ChildBottomNav />
      </div>
    </div>
  );
}