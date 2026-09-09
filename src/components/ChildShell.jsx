import { NavLink } from "react-router-dom";
import TaskLedger from "./TaskLedger.jsx";
import FeedbackReportLink from "./FeedbackReportLink.jsx";
import ChildAvatar from "./ChildAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getOnlyChild } from "../db.js";
import { childDisplayName } from "../names.js";
import { useLiveData } from "../hooks/useLiveData.js";

const TABS = [
  { to: "/child", label: "任务", sub: "", emoji: "🎯", end: true },
  { to: "/child/shop", label: "心愿单", sub: "", emoji: "🎁", end: false },
  { to: "/child/park", label: "乐园", sub: "", emoji: "🎮", end: false },
  { to: "/child/explore", label: "世界探索", sub: "World Explorer", emoji: "🔍", end: false },
  { to: "/child/exchange", label: "语言交换", sub: "Language Exchange", emoji: "🎬", end: false },
];

export default function ChildShell({ children }) {
  useLiveData();
  const { user } = useAuth();
  const child = getOnlyChild();
  const childName = childDisplayName(user);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-sky-300 via-lime-200 to-amber-200">
      <div className="blob pointer-events-none absolute -left-10 -top-6 h-36 w-36 rounded-full bg-yellow-200/80" />
      <div
        className="blob pointer-events-none absolute -right-8 top-28 h-40 w-40 rounded-full bg-fuchsia-300/50"
        style={{ animationDelay: "1s" }}
      />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-48 pt-8">
        {children}
      </div>
      <TaskLedger className="fixed bottom-[7.2rem] right-4 z-30 flex items-center gap-1 rounded-full border-4 border-white bg-white/95 px-3 py-2 shadow-md">
        <ChildAvatar avatar={child?.avatar} fallback="🦁" className="h-7 w-7" textClassName="text-xl" />
        <span className="font-display text-sm text-violet-700">{childName}</span>
      </TaskLedger>
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t-4 border-white bg-white/95">
        <div className="mx-auto grid max-w-md grid-cols-3 px-1 py-1.5">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `rounded-2xl px-0.5 py-1.5 text-center ${
                  isActive ? "bg-sky-100 text-sky-700" : "text-violet-400"
                }`
              }
            >
              <div className="text-xl">{tab.emoji}</div>
              <div className="font-display text-[11px] leading-tight">{tab.label}</div>
              {tab.sub ? <div className="text-[8px] font-bold leading-tight opacity-80">{tab.sub}</div> : null}
            </NavLink>
          ))}
          <FeedbackReportLink className="rounded-2xl px-0.5 py-1.5 text-center text-violet-400">
            <div className="text-xl">📣</div>
            <div className="font-display text-[11px] leading-tight">反馈与举报</div>
          </FeedbackReportLink>
        </div>
      </nav>
    </div>
  );
}
