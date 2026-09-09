import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function ChooseRole() {
  const navigate = useNavigate();
  const { user, setRole } = useAuth();
  const { language } = useLanguage();
  const isZh = language === 'zh';

  // 如果没有登录，跳转到登录页
  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-amber-300 via-rose-300 to-sky-400">
      <div className="blob pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-yellow-200/80" />
      <div
        className="blob pointer-events-none absolute -right-10 top-32 h-52 w-52 rounded-full bg-fuchsia-400/50"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="blob pointer-events-none absolute bottom-10 left-1/4 h-36 w-36 rounded-full bg-lime-300/70"
        style={{ animationDelay: "0.6s" }}
      />
      <div
        className="blob pointer-events-none absolute bottom-24 right-8 h-28 w-28 rounded-full bg-orange-400/70"
        style={{ animationDelay: "1.8s" }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_0_#f59e0b] float-icon">
            <img src="/icon.png" alt="成长大冒险" className="h-full w-full rounded-full object-cover" />
          </div>
          <h1 className="font-display text-4xl tracking-wide text-white drop-shadow-[0_4px_0_rgba(190,24,93,0.35)] float-text">
            成长大冒险
          </h1>
          <p className="mt-2 text-lg font-extrabold text-white/95">
            {isZh ? "欢迎回来！请选择你的角色" : "Welcome back! Choose your role"}
          </p>
        </div>

        <div className="rounded-[32px] border-4 border-white bg-white/85 p-5 shadow-[0_12px_0_rgba(236,72,153,0.35)] backdrop-blur">
          <p className="mb-3 text-center text-sm font-extrabold text-rose-500">
            {isZh ? "你是谁？" : "Who are you?"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setRole("parent");
                navigate("/parent");
              }}
              className="rounded-3xl border-4 border-orange-600 bg-orange-400 px-2 py-4 text-center text-white transition hover:bg-orange-500"
            >
              <div className="text-4xl">🧑‍🤝‍🧑</div>
              <div className="mt-1 font-display text-xl">{isZh ? "家长" : "Parent"}</div>
              <div className="text-xs font-bold text-white/90">{isZh ? "管理任务和积分" : "Manage tasks & points"}</div>
            </button>
            <button
              onClick={() => {
                setRole("child");
                navigate("/child");
              }}
              className="rounded-3xl border-4 border-sky-600 bg-sky-400 px-2 py-4 text-center text-white transition hover:bg-sky-500"
            >
              <div className="text-4xl">🧒</div>
              <div className="mt-1 font-display text-xl">{isZh ? "孩子" : "Child"}</div>
              <div className="text-xs font-bold text-white/90">{isZh ? "做任务赚积分" : "Earn points"}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}