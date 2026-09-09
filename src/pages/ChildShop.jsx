import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getActiveChildId, getPendingRedemptions, getPoints, getRedemptions, getRewards, redeemReward } from "../db.js";
import { useLiveData } from "../hooks/useLiveData.js";
import ChildBottomNav from "../components/ChildBottomNav.jsx";

export default function ChildShop() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [message, setMessage] = useState("");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const childId = getActiveChildId();
  const points = getPoints(childId);
  const rewards = getRewards(childId);
  const waiting = getPendingRedemptions(childId);
  const done = getRedemptions(childId).filter((item) => item.status === "fulfilled");

  function handleRedeem(rewardId) {
    const result = redeemReward(rewardId);
    setMessage(result.ok ? (isZh ? "兑换成功！积分已扣，等家长兑现奖励吧" : "Redeemed! Points deducted, waiting for parent") : result.message);
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-200">
      <div className="relative z-10 mx-auto max-w-md px-4 pb-20 pt-4">
        <h1 className="font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(3,105,161,0.35)]">
          {isZh ? "心愿单" : "Wishlist"}
        </h1>
        <p className="mt-1 font-extrabold text-sky-900/70">
          {isZh ? "我的积分" : "My Points"} {points}
        </p>

        {message ? (
          <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-center font-extrabold text-fuchsia-600">{message}</p>
        ) : null}

        {waiting.length > 0 ? (
          <section className="mt-4 space-y-2">
            {waiting.map((item) => (
              <article key={item.id} className="rounded-2xl border-4 border-amber-200 bg-amber-50 px-4 py-3">
                <p className="font-extrabold text-amber-700">
                  {isZh ? "待兑现" : "Pending"}: {item.title}
                </p>
                <p className="text-xs font-bold text-amber-500">
                  {isZh ? "已扣" : "Deducted"} {item.cost} {isZh ? "分" : "pts"}
                </p>
              </article>
            ))}
          </section>
        ) : null}

        <div className="mt-5 space-y-3">
          {rewards.length === 0 ? (
            <p className="rounded-3xl border-4 border-white bg-white/80 px-4 py-6 text-center font-bold text-violet-400">
              {isZh ? "家长还没有添加奖励，先去做任务攒积分吧" : "No rewards yet, go do some tasks!"}
            </p>
          ) : (
            rewards.map((reward) => {
              const canBuy = points >= reward.cost;
              const remain = Math.max(0, reward.cost - points);
              return (
                <article key={reward.id} className="rounded-[28px] border-4 border-white bg-white/90 p-4">
                  {reward.image ? (
                    <img src={reward.image} alt="" className="mb-3 h-32 w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="mb-3 flex h-24 items-center justify-center rounded-2xl bg-fuchsia-50 text-5xl">🎁</div>
                  )}
                  <p className="font-display text-2xl text-violet-800">{reward.title}</p>
                  <p className="font-extrabold text-amber-500">
                    {isZh ? "需要" : "Cost"} {reward.cost} {isZh ? "分" : "pts"}
                  </p>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-violet-100">
                    <div
                      className="h-full rounded-full bg-fuchsia-400"
                      style={{ width: `${Math.min(100, (points / Math.max(1, reward.cost)) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs font-bold text-violet-400">
                    {canBuy ? (isZh ? "积分够啦，可以兑换！" : "Enough points!") : (isZh ? `还差 ${remain} 分` : `${remain} more needed`)}
                  </p>
                  <button
                    type="button"
                    disabled={!canBuy}
                    onClick={() => handleRedeem(reward.id)}
                    className={`mt-3 w-full rounded-2xl py-3 font-display text-xl ${
                      canBuy ? "border-b-8 border-fuchsia-700 bg-fuchsia-400 text-white" : "bg-violet-100 text-violet-300"
                    }`}
                  >
                    {isZh ? "兑换" : "Redeem"}
                  </button>
                </article>
              );
            })
          )}
        </div>

        {done.length > 0 ? (
          <section className="mt-5">
            <h2 className="font-display text-lg text-emerald-700">{isZh ? "已经拿到的奖励" : "Rewards Received"}</h2>
            {done.map((item) => (
              <p key={item.id} className="mt-2 rounded-2xl bg-emerald-50 px-4 py-2 font-extrabold text-emerald-700">
                ✓ {item.title}
              </p>
            ))}
          </section>
        ) : null}

        <ChildBottomNav />
      </div>
    </div>
  );
}