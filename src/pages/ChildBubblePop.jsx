import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import BubblePopBoard from "../games/BubblePopBoard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useWordBank } from "../hooks/useWordBank.js";
import {
  GAME_PLAY_COST,
  getPoints,
  startPaidGameSession,
} from "../db.js";
import { childDisplayName } from "../names.js";
import { useLiveData } from "../hooks/useLiveData.js";

export default function ChildBubblePop() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === "zh";
  const [worldId, setWorldId] = useState("action");
  const [playMode, setPlayMode] = useState("tap");
  const [round, setRound] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [settlement, setSettlement] = useState(null);
  const [pointsHint, setPointsHint] = useState(false);
  const { world, words, worlds, targetLang, targetLabel, targetLabelEn } = useWordBank(worldId);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const coins = getPoints();
  const mode = world.hasBodyMode ? playMode : "tap";
  const childName = childDisplayName(user);
  const pointsHintText = isZh
    ? `${childName}，你的积分不够玩一局了，快去做任务赚积分吧！`
    : `${childName}, not enough points. Go complete some tasks!`;
  const targetName = isZh ? targetLabel : targetLabelEn;

  function startRound() {
    const started = startPaidGameSession("bubbles", `游戏：语言大冒险·${world.name}`);
    if (!started.ok) {
      if (started.code === "points") setPointsHint(true);
      return;
    }
    setSettlement(null);
    setRound((value) => value + 1);
    setPlaying(true);
  }

  function handleEnd(pops) {
    setPlaying(false);
    setSettlement({ pops: Number(pops) || 0, worldName: world.name });
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-cyan-300 via-sky-200 to-amber-200 px-5 py-8">
      <div className="mx-auto max-w-md pb-10">
        <Link to="/child/park" className="font-extrabold text-sky-900/70">
          ← {isZh ? "返回游戏乐园" : "Back to Game Park"}
        </Link>
        <h1 className="mt-4 font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(3,105,161,0.35)]">
          {isZh ? "语言大冒险" : "Language Adventure"}
        </h1>
        <p className="mt-1 font-bold text-sky-900/70">
          {isZh
            ? `选一个世界，点击消除${targetName}词汇！每局 30 秒，消耗 ${GAME_PLAY_COST} 积分 · 当前 ${coins} 分`
            : `Pick a world and tap ${targetName} words. 30s, -${GAME_PLAY_COST} pts · now ${coins}`}
        </p>

        {!playing ? (
          <>
            <div className="mt-5 space-y-3">
              {worlds.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setWorldId(item.id);
                    if (!item.hasBodyMode) setPlayMode("tap");
                  }}
                  className={`w-full rounded-[28px] border-4 p-4 text-left ${
                    worldId === item.id ? "border-cyan-500 bg-white" : "border-white bg-white/80"
                  }`}
                >
                  <p className="font-display text-2xl text-violet-800">
                    {item.emoji} {item.name}
                  </p>
                  <p className="mt-1 text-sm font-bold text-violet-400">{isZh ? item.introZh : item.introEn}</p>
                </button>
              ))}
            </div>

            {world.hasBodyMode ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlayMode("tap")}
                  className={`rounded-2xl py-3 font-display text-lg ${
                    playMode === "tap" ? "bg-violet-500 text-white" : "bg-white/80 text-violet-500"
                  }`}
                >
                  {isZh ? "点图片" : "Tap"}
                </button>
                <button
                  type="button"
                  onClick={() => setPlayMode("act")}
                  className={`rounded-2xl py-3 font-display text-lg ${
                    playMode === "act" ? "bg-orange-400 text-white" : "bg-white/80 text-orange-500"
                  }`}
                >
                  {isZh ? "做动作" : "Act it out"}
                </button>
              </div>
            ) : null}

            <p className="mt-3 text-center text-sm font-extrabold text-sky-800/80">
              {world.hasBodyMode && playMode === "act"
                ? isZh
                  ? "点到泡泡后，跟着词汇做动作，再点「我做好了」得分"
                  : "After popping, act it out and tap I did it"
                : isZh
                  ? `点击消除${targetName}词汇就能得分`
                  : `Tap ${targetName} bubbles to score`}
            </p>

            <button
              type="button"
              onClick={startRound}
              className="mt-4 w-full rounded-2xl border-b-8 border-cyan-700 bg-cyan-400 py-3 font-display text-2xl text-white"
            >
              {isZh ? `进入${world.name}（-${GAME_PLAY_COST} 分）` : `Enter ${world.name} (-${GAME_PLAY_COST} pts)`}
            </button>
          </>
        ) : null}

        {playing ? (
          <div className="mt-5">
            <p className="mb-2 text-center font-display text-xl text-violet-800">
              {world.emoji} {world.name}
              {mode === "act" ? (isZh ? " · 做动作" : " · Act") : ""}
            </p>
            <BubblePopBoard
              key={`${round}-${worldId}-${mode}`}
              words={words}
              mode={mode}
              onEnd={handleEnd}
              targetLang={targetLang}
              isZh={isZh}
            />
          </div>
        ) : null}

        {pointsHint ? (
          <button
            type="button"
            className="fixed inset-0 z-30 flex items-center justify-center bg-sky-950/50 px-6"
            onClick={() => setPointsHint(false)}
          >
            <div className="w-full max-w-sm rounded-[32px] border-4 border-white bg-white p-6 text-center">
              <p className="font-display text-2xl text-sky-800">{pointsHintText}</p>
              <p className="mt-4 text-xs font-bold text-sky-300">{isZh ? "点一下关闭" : "Tap to close"}</p>
            </div>
          </button>
        ) : null}

        {settlement ? (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-sky-950/50 px-6">
            <div className="w-full max-w-sm rounded-[32px] border-4 border-white bg-white p-6 text-center">
              <p className="font-display text-3xl text-sky-800">{isZh ? "本局结算" : "Round over"}</p>
              <p className="mt-2 font-bold text-violet-400">{settlement.worldName}</p>
              <p className="mt-3 font-display text-2xl text-amber-500">
                {isZh ? `太棒了！本局得分 ${settlement.pops} 分！` : `Great! You scored ${settlement.pops}!`}
              </p>
              <button
                type="button"
                onClick={() => setSettlement(null)}
                className="mt-5 w-full rounded-2xl bg-cyan-500 py-3 font-display text-xl text-white"
              >
                {isZh ? "再选一个世界" : "Pick another world"}
              </button>
              <Link to="/child/park" className="mt-3 block font-extrabold text-sky-500">
                {isZh ? "返回游戏乐园" : "Back to Game Park"}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
