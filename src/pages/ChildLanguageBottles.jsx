import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import LanguageToggle from "../components/LanguageToggle.jsx";
import ChildBottomNav from "../components/ChildBottomNav.jsx";
import LanguageDriftBottles from "../games/LanguageDriftBottles.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useBottleBank } from "../hooks/useWordBank.js";
import { useLiveData } from "../hooks/useLiveData.js";
import { BOTTLE_POINTS, VOCAB_BUNDLED_BANDS, awardBottleFind, getPoints } from "../db.js";
import { bandLabel } from "../vocab/vocabEngine.js";

function startWaves() {
  try {
    const ctx = new AudioContext();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 2.4;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    const gain = ctx.createGain();
    gain.gain.value = 0.035;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    return () => {
      try {
        noise.stop();
        ctx.close();
      } catch {
        /* ignore */
      }
    };
  } catch {
    return () => {};
  }
}

export default function ChildLanguageBottles() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === "zh";
  const { words, targetLang, targetLabel, targetLabelEn, progress, remainToUnlock } = useBottleBank();
  const [playing, setPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const stopWaves = useRef(null);
  const coins = getPoints();
  const targetName = isZh ? targetLabel : targetLabelEn;

  useEffect(() => {
    if (!playing || !soundOn) {
      stopWaves.current?.();
      stopWaves.current = null;
      return undefined;
    }
    stopWaves.current = startWaves();
    return () => {
      stopWaves.current?.();
      stopWaves.current = null;
    };
  }, [playing, soundOn]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-sky-300 via-cyan-200 to-blue-400">
      <div className="relative z-10 mx-auto max-w-md px-4 pb-20 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to="/child/park" className="text-sm font-extrabold text-sky-900/70">
              ← {isZh ? "返回游戏乐园" : "Back to Game Park"}
            </Link>
            <h1 className="mt-2 font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(3,105,161,0.35)]">
              {isZh ? "语言漂流瓶" : "Language Bottles"}
            </h1>
          </div>
          <LanguageToggle />
        </div>
        <p className="mt-2 text-sm font-bold text-sky-900/80">
          {isZh
            ? `世界各地的孩子把${targetName}词汇装进瓶子投进大海。捞起来，翻译正确就能 +${BOTTLE_POINTS} 分。当前 ${coins} 分`
            : `Kids around the world send ${targetName} words in bottles. Translate one to earn +${BOTTLE_POINTS}. Now ${coins} pts`}
        </p>
        <p className="mt-1 rounded-2xl bg-white/70 px-3 py-2 text-xs font-extrabold text-sky-800">
          {isZh
            ? `词库：${bandLabel(progress.unlockedMaxK, true)}（1k–${progress.unlockedMaxK}k）`
            : `Word band: ${bandLabel(progress.unlockedMaxK, false)} (1k–${progress.unlockedMaxK}k)`}
          {remainToUnlock > 0
            ? isZh
              ? ` · 再答对 ${remainToUnlock} 题解锁 ${progress.unlockedMaxK + 1}k`
              : ` · ${remainToUnlock} more correct to unlock ${progress.unlockedMaxK + 1}k`
            : progress.unlockedMaxK >= VOCAB_BUNDLED_BANDS
              ? isZh
                ? " · 已到当前内置最高级"
                : " · Top bundled level"
              : ""}
        </p>

        {!playing ? (
          <section className="mt-5 rounded-[32px] border-4 border-white bg-white/90 p-5 text-center">
            <p className="text-6xl">🍾</p>
            <p className="mt-3 font-extrabold text-sky-700">
              {isZh
                ? "把写着自己母语的漂流瓶投进大海，你来捞起并翻译，让语言在地球村传递！"
                : "Bottles carry words across the sea. Fish one out and translate it!"}
            </p>
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="mt-5 w-full rounded-2xl border-b-8 border-cyan-700 bg-cyan-400 py-4 font-display text-2xl text-white"
            >
              {isZh ? "开始打捞" : "Start fishing"}
            </button>
          </section>
        ) : (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-extrabold text-sky-900/80">
                {isZh ? `当前 ${coins} 分` : `Now ${coins} pts`}
              </p>
              <button
                type="button"
                onClick={() => setSoundOn((value) => !value)}
                className="rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold text-sky-700"
              >
                {soundOn ? (isZh ? "海浪声开" : "Waves on") : isZh ? "海浪声关" : "Waves off"}
              </button>
            </div>
            <LanguageDriftBottles
              words={words}
              targetLang={targetLang}
              isZh={isZh}
              onCorrect={(word) => awardBottleFind(word).awarded}
            />
          </div>
        )}

        <ChildBottomNav />
      </div>
    </div>
  );
}
