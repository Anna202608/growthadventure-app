import { useEffect, useRef, useState } from "react";

const ROUND_SEC = 30;
const COLORS = ["#fb7185", "#38bdf8", "#a78bfa", "#fbbf24", "#34d399", "#f97316", "#e879f9"];

function playPopSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    osc.onended = () => ctx.close();
  } catch {
    /* ignore */
  }
}

function pickWord(words) {
  return words[Math.floor(Math.random() * words.length)];
}

export default function BubblePopBoard({ words, mode = "tap", onEnd, targetLang = "en", isZh = true }) {
  const list = words?.length ? words : [{ en: "hi", zh: "嗨", emoji: "🫧" }];
  const [left, setLeft] = useState(ROUND_SEC);
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [bangs, setBangs] = useState([]);
  const [now, setNow] = useState(() => performance.now());
  const [prompt, setPrompt] = useState(null);
  const scoreRef = useRef(0);
  const endedRef = useRef(false);
  const nextId = useRef(1);
  const onEndRef = useRef(onEnd);
  const popping = useRef(new Set());
  const promptRef = useRef(null);

  onEndRef.current = onEnd;
  promptRef.current = prompt;

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
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const spawn = window.setInterval(() => {
      if (endedRef.current || promptRef.current) return;
      setBubbles((items) => {
        if (items.length >= 7) return items;
        const id = nextId.current;
        nextId.current += 1;
        const angle = Math.random() * Math.PI * 2;
        const dist = 8 + Math.random() * 22;
        return [
          ...items,
          {
            id,
            word: pickWord(list),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            x: 50 + Math.cos(angle) * dist,
            y: 50 + Math.sin(angle) * dist,
            born: performance.now(),
            life: 2400 + Math.random() * 1200,
          },
        ];
      });
    }, 480);
    return () => window.clearInterval(spawn);
  }, [list]);

  useEffect(() => {
    let frame = 0;
    const loop = (time) => {
      setNow(time);
      setBubbles((items) => {
        const next = items.filter((bubble) => time - bubble.born < bubble.life);
        if (next.length === items.length) return items;
        const expired = items.filter((bubble) => time - bubble.born >= bubble.life);
        setBangs((bangItems) => [
          ...bangItems.slice(-12),
          ...expired.map((bubble) => ({
            id: `auto-${bubble.id}-${time}`,
            x: bubble.x,
            y: bubble.y,
            label: "啪",
            at: time,
          })),
        ]);
        return next;
      });
      setBangs((bangItems) => {
        const kept = bangItems.filter((bang) => time - bang.at < 500);
        return kept.length === bangItems.length ? bangItems : kept;
      });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  function addScore(bubble, label) {
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setBangs((items) => [
      ...items,
      { id: `hit-${bubble.id}`, x: bubble.x, y: bubble.y, label, at: performance.now() },
    ]);
    playPopSound();
  }

  function popBubble(event, bubble) {
    event.preventDefault();
    event.stopPropagation();
    if (endedRef.current || popping.current.has(bubble.id) || prompt) return;
    popping.current.add(bubble.id);
    setBubbles((items) => items.filter((item) => item.id !== bubble.id));
    if (mode === "act") {
      setPrompt(bubble);
      return;
    }
    addScore(bubble, "砰");
  }

  function finishAction() {
    if (!prompt || endedRef.current) return;
    addScore(prompt, "棒");
    setPrompt(null);
  }

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between font-display text-xl text-sky-800">
        <span>{isZh ? `剩余 ${left} 秒` : `${left}s left`}</span>
        <span>{isZh ? `得分 ${score}` : `Score ${score}`}</span>
      </div>
      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-[32px] bg-gradient-to-b from-sky-100 to-cyan-200 shadow-inner">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-2xl" />
        {bubbles.map((bubble) => {
          const age = Math.min(1, Math.max(0, (now - bubble.born) / bubble.life));
          const size = 64 + age * 56;
          const label = targetLang === "zh" ? bubble.word.zh : bubble.word.en;
          const long = String(label || "").length > 8;
          return (
            <button
              key={bubble.id}
              type="button"
              aria-label={label}
              onPointerDown={(event) => popBubble(event, bubble)}
              className="bubble-float absolute flex flex-col items-center justify-center rounded-full border-4 border-white/70 px-1 text-center shadow-lg"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.9), ${bubble.color})`,
              }}
            >
              <span className="text-lg leading-none">{bubble.word.emoji}</span>
              <span className={`font-display leading-tight text-white drop-shadow ${long ? "text-[10px]" : "text-xs"}`}>
                {label}
              </span>
            </button>
          );
        })}
        {bangs.map((bang) => (
          <span
            key={bang.id}
            className="bubble-bang pointer-events-none absolute font-display text-3xl text-amber-500"
            style={{ left: `${bang.x}%`, top: `${bang.y}%` }}
          >
            {bang.label}
          </span>
        ))}
        {prompt ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-sky-900/55 px-5">
            <p className="text-6xl">{prompt.word.emoji}</p>
            <p className="mt-2 font-display text-3xl text-white">{targetLang === "zh" ? prompt.word.zh : prompt.word.en}</p>
            <p className="mt-1 font-extrabold text-amber-200">{targetLang === "zh" ? prompt.word.en : prompt.word.zh}</p>
            <p className="mt-3 text-center text-sm font-extrabold text-white">
              {isZh ? "先做这个动作，再点按钮得分" : "Do this action, then tap to score"}
            </p>
            <button
              type="button"
              onClick={finishAction}
              className="mt-4 w-full rounded-2xl border-b-8 border-emerald-800 bg-lime-400 py-3 font-display text-2xl text-violet-900"
            >
              {isZh ? "我做好了" : "I did it"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
