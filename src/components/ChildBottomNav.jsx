import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function ChildBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const tabs = [
    { label: isZh ? "任务" : "Tasks", icon: "📋", path: "/child" },
    { label: isZh ? "心愿单" : "Wishlist", icon: "🎁", path: "/child/shop" },
    { label: isZh ? "乐园" : "Park", icon: "🎮", path: "/child/park" },
    { label: isZh ? "世界探索" : "Explore", icon: "🔍", path: "/child/explore" },
    { label: isZh ? "语言交换" : "Exchange", icon: "🌍", path: "/child/exchange" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-md bg-white/95 backdrop-blur">
      <div className="grid grid-cols-5 gap-1 px-2 py-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center rounded-xl py-1 transition hover:bg-sky-100 ${
                isActive ? "text-sky-600" : "text-sky-700"
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}