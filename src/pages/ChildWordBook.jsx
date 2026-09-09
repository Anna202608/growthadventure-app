import { Link, Navigate } from "react-router-dom";
import ChildShell from "../components/ChildShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAppLang } from "../hooks/useAppLang.js";
import { useLiveData } from "../hooks/useLiveData.js";
import { getExplorerWords } from "../db.js";

export default function ChildWordBook() {
  useLiveData();
  const { user } = useAuth();
  const [lang] = useAppLang();
  const words = getExplorerWords();

  if (!user || user.role !== "child") {
    return <Navigate to="/" replace />;
  }

  return (
    <ChildShell>
      <Link to="/child/explore" className="font-extrabold text-sky-900/70">
        ← 返回世界探索
      </Link>
      <h1 className="mt-4 font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(3,105,161,0.35)]">我的单词本</h1>
      <p className="mt-1 text-sm font-extrabold text-sky-900/70">Word Book</p>

      <div className="mt-5 space-y-3">
        {words.length === 0 ? (
          <p className="rounded-[28px] border-4 border-white bg-white/80 px-4 py-8 text-center font-extrabold text-violet-400">
            还没有复习过的单词。去拍照并完成今日复习吧！
          </p>
        ) : (
          words.map((item) => (
            <article key={item.id} className="flex items-center gap-3 rounded-[28px] border-4 border-white bg-white/90 p-3">
              {item.photo ? (
                <img src={item.photo} alt="" className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-3xl">
                  {item.emoji || "🔍"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl text-violet-800">{lang === "en" ? item.zh : item.en}</p>
                <p className="truncate text-sm font-bold text-violet-400">{lang === "en" ? item.en : item.zh}</p>
                <p className="text-xs font-extrabold text-sky-500">{item.date}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </ChildShell>
  );
}
