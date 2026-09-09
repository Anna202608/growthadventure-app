import { useState } from "react";
import { Navigate } from "react-router-dom";
import ChildBottomNav from "../components/ChildBottomNav.jsx";
import ExchangeComments, { ReportSheet } from "../components/ExchangeComments.jsx";
import KidVideoPlayer from "../components/KidVideoPlayer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useLiveData } from "../hooks/useLiveData.js";
import { addReport, getActivePair, getChildFeeds } from "../utils/exchangeStorage.js";

export default function ChildLanguageExchange() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === "zh";
  const [active, setActive] = useState(null);
  const [reportId, setReportId] = useState("");
  const pair = getActivePair();
  const { partner, featured } = getChildFeeds();

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-200">
      <div className="relative z-10 mx-auto max-w-md px-4 pb-20 pt-4">
        <h1 className="font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(3,105,161,0.35)]">
          {isZh ? "语言交换" : "Language Exchange"}
        </h1>
        <p className="mt-1 text-sm font-bold text-sky-900/80">
          {pair
            ? isZh
              ? "只显示已发布的伙伴内容和公开推荐"
              : "Partner posts and public featured clips"
            : isZh
              ? "请家长先去工作室点击「匹配帕克家庭」"
              : "Ask a parent to pair the Park family first"}
        </p>

        <FeedBlock title={isZh ? "伙伴发布" : "From partner"} items={partner} empty={isZh ? "还没有伙伴内容" : "No partner clips"} isZh={isZh} onOpen={setActive} />
        <FeedBlock title={isZh ? "公开推荐" : "Public featured"} items={featured} empty={isZh ? "还没有公开内容" : "No public clips"} isZh={isZh} onOpen={setActive} />

        {active ? (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-sky-950/50 px-4 pb-6 pt-10 sm:items-center">
            <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[32px] border-4 border-white bg-white p-4">
              <div className="flex justify-between gap-3">
                <p className="font-display text-2xl text-violet-800">{active.title}</p>
                <button type="button" onClick={() => setActive(null)} className="font-extrabold text-orange-500">
                  {isZh ? "关闭" : "Close"}
                </button>
              </div>
              <p className="mt-1 text-sm font-bold text-violet-500">{active.description}</p>
              {active.fileType === "video" ? (
                <div className="mt-3 aspect-video">
                  <KidVideoPlayer src={active.fileData} className="h-full w-full" />
                </div>
              ) : (
                <audio className="mt-3 w-full" controls src={active.fileData} />
              )}
              <button type="button" className="mt-3 text-sm font-extrabold text-orange-600" onClick={() => setReportId(active.id)}>
                {isZh ? "举报" : "Report"}
              </button>
              <ExchangeComments contentId={active.id} />
            </div>
          </div>
        ) : null}

        {reportId ? (
          <ReportSheet
            isZh={isZh}
            onClose={() => setReportId("")}
            onPick={(reason) => {
              addReport({ contentId: reportId, reason });
              setReportId("");
            }}
          />
        ) : null}

        <ChildBottomNav />
      </div>
    </div>
  );
}

function FeedBlock({ title, items, empty, isZh, onOpen }) {
  return (
    <section className="mt-5">
      <h2 className="font-display text-xl text-violet-800">{title}</h2>
      <div className="mt-2 space-y-2">
        {items.length === 0 ? (
          <p className="rounded-[28px] border-4 border-white bg-white/80 px-4 py-6 text-center font-extrabold text-violet-400">{empty}</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="rounded-[28px] border-4 border-white bg-white/90 p-4">
              <p className="font-display text-2xl text-violet-800">{item.title}</p>
              <button
                type="button"
                onClick={() => onOpen(item)}
                className="mt-3 w-full rounded-2xl bg-sky-400 py-3 font-display text-xl text-white"
              >
                {isZh ? "听一听" : "Play"}
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
