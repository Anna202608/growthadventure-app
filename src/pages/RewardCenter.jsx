import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getOnlyChild, getRewards, addReward, childLabel } from "../db.js";
import { useLiveData } from "../hooks/useLiveData.js";

export default function RewardCenter() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState(10);
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");
  const child = getOnlyChild();
  const rewards = child?.id ? getRewards(child.id) : [];

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage(isZh ? "请输入奖励名称" : "Please enter reward name");
      return;
    }
    addReward({ title: title.trim(), cost, image, childId: child?.id });
    setTitle("");
    setCost(10);
    setImage("");
    setMessage(isZh ? "奖励已添加！" : "Reward added!");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-orange-300 via-amber-200 to-rose-200">
      <div className="relative z-10 mx-auto max-w-md px-5 pb-8 pt-8">
        <Link to="/parent" className="inline-block text-sm font-extrabold text-orange-800/70">
          ← {isZh ? "返回" : "Back"}
        </Link>

        <h1 className="mt-4 font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(194,65,12,0.35)]">
          {isZh ? "🎁 心愿商店" : "🎁 Wish Shop"}
        </h1>
        <p className="mt-1 text-sm font-extrabold text-orange-800/70">
          {isZh ? `为 ${childLabel(child)} 添加奖励` : `Add rewards for ${childLabel(child)}`}
        </p>

        {message && (
          <div className={`mt-3 rounded-2xl px-4 py-3 text-center font-bold ${message.includes("成功") || message.includes("added") ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 rounded-[28px] border-4 border-white bg-white/90 p-4 shadow-[0_8px_0_rgba(249,115,22,0.25)]">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-bold text-orange-700">{isZh ? "奖励名称" : "Reward Name"}</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isZh ? "如：去动物园" : "e.g. Go to zoo"}
                className="w-full rounded-2xl border-4 border-orange-200 bg-white px-4 py-3 text-lg font-bold text-orange-900 outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-orange-700">{isZh ? "所需积分" : "Cost (pts)"}</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full rounded-2xl border-4 border-orange-200 bg-white px-4 py-3 text-lg font-bold text-orange-900 outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-orange-700">{isZh ? "图片链接（可选）" : "Image URL (optional)"}</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border-4 border-orange-200 bg-white px-4 py-3 text-lg font-bold text-orange-900 outline-none focus:border-orange-400"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl border-b-8 border-orange-700 bg-orange-400 py-3 font-display text-xl text-white"
            >
              {isZh ? "添加奖励" : "Add Reward"}
            </button>
          </div>
        </form>

        <div className="mt-4 rounded-[28px] border-4 border-white bg-white/90 p-4 shadow-[0_8px_0_rgba(249,115,22,0.25)]">
          <h2 className="font-display text-xl text-orange-700">{isZh ? "当前奖励列表" : "Current Rewards"}</h2>
          {rewards.length === 0 ? (
            <p className="mt-3 text-center text-sm font-bold text-orange-400">{isZh ? "还没有奖励" : "No rewards yet"}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {rewards.map((reward) => (
                <li key={reward.id} className="flex items-center justify-between rounded-2xl bg-orange-50 px-3 py-2">
                  <div>
                    <p className="font-extrabold text-orange-900">{reward.title}</p>
                    <p className="text-xs font-bold text-orange-400">{reward.cost} {isZh ? "分" : "pts"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}