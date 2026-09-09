import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import LanguageBubbleWorld from "../games/LanguageBubbleWorld.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { mergeWordLists, usePhraseBank } from "../hooks/useWordBank.js";
import {
  GAME_PLAY_COST,
  getPoints,
  recordGameResult,
  startPaidGameSession,
} from "../db.js";
import { childDisplayName } from "../names.js";
import { useLiveData } from "../hooks/useLiveData.js";

const GAME_ID = "englishworld";

export default function ChildLanguageBubbleWorld() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === "zh";
  const bank = usePhraseBank();
  const [round, setRound] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [settlement, setSettlement] = useState(null);
  const [pointsHint, setPointsHint] = useState(false);
  const [theme] = useState(() => bank.themes[Math.floor(Math.random() * bank.themes.length)]);
  const items = useMemo(
    () => mergeWordLists(bank.explorerWords, theme.items, 8),
    [bank.explorerWords, theme],
  );

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const coins = getPoints();
  const childName = childDisplayName(user);
  const pointsHintText = isZh
    ? `${childName}，你的积分不够玩一局了，快去做任务赚积分吧！`
    : `${childName}, not enough points. Go complete some tasks!`;
  const targetName = isZh ? bank.targetLabel : bank.targetLabelEn;

  function startRound() {
    const started = startPaidGameSession(GAME_ID, "游戏：语言泡泡世界");
    if (!started.ok) {
      if (started.code === "points") setPointsHint(true);
      return;
    }
    setSettlement(null);
    setRound((value) => value + 1);
    setPlaying(true);
  }

  function handleEnd(score) {
    const pops = Number(score) || 0;
    recordGameResult(GAME_ID, pops);
    setPlaying(false);
    setSettlement({ score: pops });
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-orange-300 via-amber-200 to-sky-200 px-5 py-8">
      <div className="mx-auto max-w-md pb-10">
        <Link to="/child/park" className="font-extrabold text-orange-900/70">
          ← {isZh ? "返回游戏乐园" : "Back to Game Park"}
        </Link>
        <h1 className="mt-4 font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(194,65,12,0.35)]">
          {isZh ? "语言泡泡世界" : "Language Bubble World"}
        </h1>
        <p className="mt-1 font-bold text-orange-900/80">
          {isZh
            ? `点中间图案意思一样的${targetName}词汇。每局 60 秒，消耗 ${GAME_PLAY_COST} 积分 · 当前 ${coins} 分`
            : `Tap the ${targetName} bubble that matches the picture. 60s, -${GAME_PLAY_COST} pts · now ${coins}`}
        </p>

        {!playing && coins >= GAME_PLAY_COST ? (
          <button
            type="button"
            onClick={startRound}
            className="mt-5 w-full rounded-2xl border-b-8 border-orange-700 bg-orange-400 py-4 font-display text-2xl text-white"
          >
            {isZh ? `开始本局（-${GAME_PLAY_COST} 分）` : `Start (-${GAME_PLAY_COST} pts)`}
          </button>
        ) : null}

        {!playing && coins < GAME_PLAY_COST ? (
          <p className="mt-5 rounded-[28px] border-4 border-white bg-white px-4 py-6 text-center font-extrabold text-amber-700">
            {pointsHintText}
          </p>
        ) : null}

        {playing ? (
          <div className="mt-5">
            <LanguageBubbleWorld
              key={round}
              onEnd={handleEnd}
              targetLang={bank.targetLang}
              items={items}
              themeName={theme.name}
              isZh={isZh}
            />
          </div>
        ) : null}

        {pointsHint ? (
          <button
            type="button"
            className="fixed inset-0 z-30 flex items-center justify-center bg-orange-950/50 px-6"
            onClick={() => setPointsHint(false)}
          >
            <div className="w-full max-w-sm rounded-[32px] border-4 border-white bg-white p-6 text-center">
              <p className="font-display text-2xl text-orange-800">{pointsHintText}</p>
              <p className="mt-4 text-xs font-bold text-orange-300">{isZh ? "点一下关闭" : "Tap to close"}</p>
            </div>
          </button>
        ) : null}

        {settlement ? (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-orange-950/50 px-6">
            <div className="w-full max-w-sm rounded-[32px] border-4 border-white bg-white p-6 text-center">
              <p className="font-display text-3xl text-orange-700">{isZh ? "本局结算" : "Round over"}</p>
              <p className="mt-3 font-display text-2xl text-amber-500">
                {isZh ? `太棒了！本局得分 ${settlement.score} 分！` : `Great! You scored ${settlement.score}!`}
              </p>
              <p className="mt-2 font-extrabold text-violet-600">
                {isZh
                  ? `你复习了 ${settlement.score} 个${targetName}词组！`
                  : `You reviewed ${settlement.score} ${targetName} phrases!`}
              </p>
              <Link
                to="/child/park"
                className="mt-5 block rounded-2xl border-b-8 border-orange-700 bg-orange-400 py-3 font-display text-xl text-white"
              >
                {isZh ? "返回游戏乐园" : "Back to Game Park"}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
