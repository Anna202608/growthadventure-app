import { useEffect, useRef, useState } from "react";
import { mergeWordLists, explorerGameWords } from "../hooks/useWordBank.js";
import { PHRASE_THEMES } from "./languageWorlds.js";

const ROUND_SEC = 60;
const PRAISE = {
  en: ["Great!", "Excellent!", "Good job!", "Perfect!", "Amazing!"],
  zh: ["太棒了！", "真厉害！", "做得好！", "完全正确！", "真聪明！"],
};
const COLORS = [
  "rgba(248,113,113,0.78)",
  "rgba(251,146,60,0.78)",
  "rgba(250,204,21,0.82)",
  "rgba(74,222,128,0.78)",
  "rgba(56,189,248,0.78)",
  "rgba(167,139,250,0.78)",
  "rgba(244,114,182,0.78)",
];

const SLOTS = [
  { x: 16, y: 16, fromX: "-42vw", fromY: "-28vh" },
  { x: 50, y: 11, fromX: "0vw", fromY: "-34vh" },
  { x: 84, y: 16, fromX: "42vw", fromY: "-28vh" },
  { x: 10, y: 42, fromX: "-46vw", fromY: "0vh" },
  { x: 90, y: 42, fromX: "46vw", fromY: "0vh" },
  { x: 14, y: 78, fromX: "-42vw", fromY: "30vh" },
  { x: 50, y: 86, fromX: "0vw", fromY: "34vh" },
  { x: 86, y: 78, fromX: "42vw", fromY: "30vh" },
  { x: 28, y: 30, fromX: "-28vw", fromY: "-22vh" },
  { x: 72, y: 30, fromX: "28vw", fromY: "-22vh" },
];

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function speakPraise(text, lang) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "zh" ? "zh-CN" : "en-US";
    utter.rate = 1.05;
    utter.pitch = 1.15;
    window.speechSynthesis.speak(utter);
  } catch {
    /* ignore */
  }
}

function labelOf(item, targetLang) {
  return targetLang === "zh" ? item.zh || item.en : item.en || item.zh;
}

function buildRound(items, targetLang) {
  const pool = items.length ? items : [{ en: "hello", zh: "你好", emoji: "👋" }];
  const target = pool[Math.floor(Math.random() * pool.length)];
  const targetLabel = labelOf(target, targetLang);
  const others = shuffle(pool.filter((item) => labelOf(item, targetLang) !== targetLabel));
  const count = Math.min(pool.length, 8 + Math.floor(Math.random() * 3));
  const mix = shuffle([target, ...others.slice(0, Math.max(0, count - 1))]);
  return {
    target,
    bubbles: mix.map((item, index) => ({
      id: `${labelOf(item, targetLang)}-${index}-${Date.now()}`,
      phrase: labelOf(item, targetLang),
      correct: labelOf(item, targetLang) === targetLabel,
      color: COLORS[index % COLORS.length],
      slot: SLOTS[index % SLOTS.length],
      state: "in",
    })),
  };
}

export default function LanguageBubbleWorld({ onEnd, targetLang = "en", items, themeName, isZh = true }) {
  const themeRef = useRef(PHRASE_THEMES[Math.floor(Math.random() * PHRASE_THEMES.length)]);
  const pool = items?.length ? items : mergeWordLists(explorerGameWords(), themeRef.current.items, 8);
  const [theme] = useState(themeRef.current);
  const [left, setLeft] = useState(ROUND_SEC);
  const [score, setScore] = useState(0);
  const [centerFlash, setCenterFlash] = useState(false);
  const [praise, setPraise] = useState("");
  const [round, setRound] = useState(() => buildRound(pool, targetLang));
  const scoreRef = useRef(0);
  const endedRef = useRef(false);
  const locking = useRef(false);
  const onEndRef = useRef(onEnd);
  const poolRef = useRef(pool);
  const targetRef = useRef(targetLang);

  onEndRef.current = onEnd;
  poolRef.current = pool;
  targetRef.current = targetLang;

  useEffect(() => {
    const tick = window.setInterval(() => {
      setLeft((sec) => {
        if (sec <= 1) {
          window.clearInterval(tick);
          if (!endedRef.current) {
            endedRef.current = true;
            onEndRef.current?.(scoreRef.current);
          }
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
    return () => {
      window.clearInterval(tick);
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    const life = window.setTimeout(() => {
      setRound((current) => {
        if (locking.current || endedRef.current) return current;
        const still = current.bubbles.filter((bubble) => bubble.state === "in");
        if (still.length === 0) return current;
        return {
          ...current,
          bubbles: current.bubbles.map((bubble) =>
            bubble.state === "in" ? { ...bubble, state: "miss" } : bubble,
          ),
        };
      });
    }, 9000);
    return () => window.clearTimeout(life);
  }, [round.target]);

  useEffect(() => {
    const alive = round.bubbles.some((bubble) => bubble.state === "in" || bubble.state === "hit");
    if (alive || locking.current || endedRef.current) return undefined;
    const next = window.setTimeout(() => startNextRound(), 420);
    return () => window.clearTimeout(next);
  }, [round]);

  function startNextRound() {
    if (endedRef.current) return;
    locking.current = false;
    setPraise("");
    setCenterFlash(true);
    window.setTimeout(() => setCenterFlash(false), 420);
    setRound(buildRound(poolRef.current, targetRef.current));
  }

  function handleHit(bubble) {
    if (endedRef.current || locking.current || bubble.state !== "in") return;
    if (bubble.correct) {
      locking.current = true;
      const words = PRAISE[targetLang] || PRAISE.en;
      const word = words[Math.floor(Math.random() * words.length)];
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setPraise(word);
      speakPraise(word, targetLang);
      setRound((current) => ({
        ...current,
        bubbles: current.bubbles.map((item) =>
          item.id === bubble.id ? { ...item, state: "hit" } : item.state === "in" ? { ...item, state: "fade" } : item,
        ),
      }));
      window.setTimeout(() => startNextRound(), 900);
      return;
    }
    setRound((current) => ({
      ...current,
      bubbles: current.bubbles.map((item) => (item.id === bubble.id ? { ...item, state: "miss" } : item)),
    }));
  }

  const title = themeName || theme.name;

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between font-display text-lg text-orange-900">
        <span className="rounded-full bg-white/80 px-3 py-1">{title}</span>
        <div className="flex gap-2">
          <span className="rounded-full bg-white/80 px-3 py-1">{isZh ? `得分 ${score}` : `Score ${score}`}</span>
          <span className="rounded-full bg-white/80 px-3 py-1">{isZh ? `剩余 ${left} 秒` : `${left}s left`}</span>
        </div>
      </div>
      <div className="ebw-stage relative mx-auto aspect-square w-full overflow-hidden rounded-[32px] border-4 border-white">
        <div className={`ebw-center ${centerFlash ? "ebw-center-flash" : ""}`} aria-hidden="true">
          <span>{round.target.emoji}</span>
        </div>
        {praise ? <p className="ebw-praise">{praise}</p> : null}
        {round.bubbles.map((bubble) => (
          <button
            key={bubble.id}
            type="button"
            disabled={bubble.state !== "in"}
            onPointerDown={() => handleHit(bubble)}
            className={`ebw-bubble ebw-bubble--${bubble.state}`}
            style={{
              left: `${bubble.slot.x}%`,
              top: `${bubble.slot.y}%`,
              background:
                bubble.state === "miss"
                  ? "rgba(148,163,184,0.75)"
                  : bubble.state === "hit"
                    ? "#4ade80"
                    : bubble.color,
              "--from-x": bubble.slot.fromX,
              "--from-y": bubble.slot.fromY,
            }}
          >
            {bubble.phrase}
          </button>
        ))}
      </div>
    </div>
  );
}
