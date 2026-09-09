import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { BOTTLE_POINTS, getPoints } from "../db.js";
import { useLearningProfile } from "../hooks/useWordBank.js";
import { useLiveData } from "../hooks/useLiveData.js";
import ChildBottomNav from "../components/ChildBottomNav.jsx";

export default function ChildGamePark() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === "zh";
  const { targetLabel, targetLabelEn } = useLearningProfile();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const coins = getPoints();
  const targetName = isZh ? targetLabel : targetLabelEn;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-200">
      <div className="relative z-10 mx-auto max-w-md px-4 pb-20 pt-4">
        <p className="text-sm font-extrabold text-sky-800/70">成长大冒险</p>
        <h1 className="font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(3,105,161,0.35)]">
          {isZh ? "游戏乐园" : "Game Park"}
        </h1>
        <p className="mt-1 font-bold text-sky-900/70">
          {isZh ? `当前 ${coins} 分 · 捞对漂流瓶 +${BOTTLE_POINTS} 分` : `${coins} pts · +${BOTTLE_POINTS} per bottle`}
        </p>

        <article className="mt-5 rounded-[28px] border-4 border-white bg-white/90 p-4">
          <p className="text-3xl">📖</p>
          <h2 className="mt-1 font-display text-2xl text-violet-800">
            {isZh ? "互动绘本" : "Storybook"}
          </h2>
          <p className="text-sm font-bold text-violet-400">
            {isZh
              ? "《语言精灵的魔法词典》· 我的家。翻页听读，选对单词 +5 分，读完整本拿「小小阅读家」"
              : "The Language Sprite's Magic Dictionary. Read, tap to hear, quiz for +5, finish for a Little Reader badge"}
          </p>
          <Link
            to="/child/play/storybook/my-home"
            className="mt-3 block rounded-2xl bg-fuchsia-400 py-3 text-center font-display text-xl text-white"
          >
            {isZh ? "打开绘本" : "Open the book"}
          </Link>
        </article>

        <article className="mt-4 rounded-[28px] border-4 border-white bg-white/90 p-4">
          <p className="text-3xl">🍾</p>
          <h2 className="mt-1 font-display text-2xl text-violet-800">{isZh ? "语言漂流瓶" : "Language Bottles"}</h2>
          <p className="text-sm font-bold text-violet-400">
            {isZh
              ? `捞起海面上的瓶子，翻译瓶中的${targetName}词汇，让地球村的语言传下去`
              : `Fish bottles from the sea and translate the ${targetName} words inside`}
          </p>
          <Link
            to="/child/play/bottles"
            className="mt-3 block rounded-2xl bg-cyan-500 py-3 text-center font-display text-xl text-white"
          >
            {isZh ? "去海边打捞" : "Go to the shore"}
          </Link>
        </article>

        <ChildBottomNav />
      </div>
    </div>
  );
}
