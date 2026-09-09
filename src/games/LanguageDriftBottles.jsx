import { useEffect, useMemo, useRef, useState } from "react";
import { speakText } from "../language.js";
import { bottleColor, pickOrigin } from "./bottleWords.js";

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function promptOf(word, targetLang) {
  return targetLang === "zh" ? word.zh || word.en : word.en || word.zh;
}

function meaningOf(word, targetLang) {
  return targetLang === "zh" ? word.en || word.zh : word.zh || word.en;
}

function buildChoices(word, pool, targetLang) {
  const correct = meaningOf(word, targetLang);
  const others = shuffle(
    pool
      .filter((item) => meaningOf(item, targetLang) && meaningOf(item, targetLang) !== correct)
      .map((item) => meaningOf(item, targetLang)),
  );
  const unique = [...new Set(others)].slice(0, 3);
  const count = unique.length >= 3 ? 4 : unique.length >= 1 ? unique.length + 1 : 1;
  return shuffle([correct, ...unique].slice(0, count));
}

function makeBottle(words, existing, id) {
  const used = new Set(existing.map((item) => `${item.word.en}|${item.word.zh}`));
  const unused = words.filter((item) => !used.has(`${item.en}|${item.zh}`));
  const word = (unused.length ? unused : words)[Math.floor(Math.random() * (unused.length ? unused.length : words.length))];
  const from = ["left", "right", "bottom"][Math.floor(Math.random() * 3)];
  const restX = 12 + Math.random() * 76;
  const restY = 34 + Math.random() * 34;
  const start =
    from === "left"
      ? { x: -16, y: restY }
      : from === "right"
        ? { x: 116, y: restY }
        : { x: restX, y: 112 };
  return {
    id,
    word,
    x: start.x,
    y: start.y,
    restX,
    restY,
    color: bottleColor(id),
    origin: pickOrigin(word, id),
    bob: 2.4 + Math.random() * 1.6,
    delay: Math.random() * 0.8,
    arriving: true,
  };
}

function spawnConfetti(x, y) {
  return Array.from({ length: 18 }, (_, index) => ({
    id: `c-${Date.now()}-${index}`,
    x,
    y,
    dx: (Math.random() - 0.5) * 48,
    dy: -18 - Math.random() * 36,
    color: ["#fde047", "#fb7185", "#38bdf8", "#a78bfa", "#4ade80"][index % 5],
    rot: Math.random() * 360,
  }));
}

export default function LanguageDriftBottles({
  words,
  targetLang = "en",
  isZh = true,
  onCorrect,
}) {
  const pool = words?.length ? words : [{ en: "hello", zh: "你好", emoji: "👋" }];
  const nextId = useRef(1);
  const [bottles, setBottles] = useState([]);
  const [opened, setOpened] = useState(null);
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState("");
  const [toast, setToast] = useState("");
  const [confetti, setConfetti] = useState([]);
  const [picked, setPicked] = useState("");

  useEffect(() => {
    const first = [];
    for (let i = 0; i < 4; i += 1) {
      first.push(makeBottle(pool, first, nextId.current));
      nextId.current += 1;
    }
    setBottles(first);
    const land = window.setTimeout(() => {
      setBottles((items) => items.map((item) => ({ ...item, arriving: false, x: item.restX, y: item.restY })));
    }, 40);
    return () => window.clearTimeout(land);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choices = useMemo(() => {
    if (!opened) return [];
    return buildChoices(opened.word, pool, targetLang);
  }, [opened, pool, targetLang]);

  function refill(withoutId) {
    setBottles((items) => {
      const kept = items.filter((item) => item.id !== withoutId);
      const extra = makeBottle(pool, kept, nextId.current);
      nextId.current += 1;
      window.setTimeout(() => {
        setBottles((current) =>
          current.map((item) => (item.id === extra.id ? { ...item, arriving: false, x: item.restX, y: item.restY } : item)),
        );
      }, 40);
      return [...kept, extra];
    });
  }

  function openBottle(bottle) {
    if (opened) return;
    setOpened(bottle);
    setHint("");
    setPicked("");
    speakText(promptOf(bottle.word, targetLang), targetLang === "zh" ? "zh" : "en");
  }

  function choose(option) {
    if (!opened || picked) return;
    const correct = meaningOf(opened.word, targetLang);
    setPicked(option);
    if (option !== correct) {
      setShake(true);
      setHint(isZh ? "再想想哦" : "Try again!");
      window.setTimeout(() => {
        setShake(false);
        setPicked("");
      }, 700);
      return;
    }
    const awarded = onCorrect?.(opened.word) || 5;
    const origin = opened.origin;
    setToast(
      isZh
        ? `⭐ +${awarded}分！你收到了来自「${origin.zh}」的漂流瓶！`
        : `⭐ +${awarded} pts! A bottle from ${origin.en}!`,
    );
    setConfetti(spawnConfetti(opened.x, opened.y));
    window.setTimeout(() => setConfetti([]), 900);
    window.setTimeout(() => setToast(""), 2200);
    const closedId = opened.id;
    setOpened(null);
    setHint("");
    setPicked("");
    refill(closedId);
  }

  return (
    <div className="ldb-sea relative overflow-hidden rounded-[32px] border-4 border-white">
      <div className="ldb-sky" />
      <div className="ldb-sun" />
      <span className="ldb-gull ldb-gull-a" aria-hidden="true">
        🕊️
      </span>
      <span className="ldb-gull ldb-gull-b" aria-hidden="true">
        🕊️
      </span>
      <div className="ldb-wave ldb-wave-1" />
      <div className="ldb-wave ldb-wave-2" />
      <div className="ldb-wave ldb-wave-3" />

      {toast ? <div className="ldb-toast">{toast}</div> : null}

      {bottles.map((bottle) => (
        <button
          key={bottle.id}
          type="button"
          disabled={Boolean(opened) && opened.id !== bottle.id}
          onClick={() => openBottle(bottle)}
          className={`ldb-bottle ${opened?.id === bottle.id ? "ldb-bottle-open" : ""} ${
            shake && opened?.id === bottle.id ? "ldb-bottle-shake" : ""
          }`}
          style={{
            left: `${bottle.x}%`,
            top: `${bottle.y}%`,
            background: `linear-gradient(180deg, rgba(255,255,255,0.85), ${bottle.color})`,
            animationDuration: `${bottle.bob}s`,
            animationDelay: `${bottle.delay}s`,
            transition: bottle.arriving ? "none" : "left 1.4s ease-out, top 1.4s ease-out",
          }}
          aria-label={isZh ? "打开漂流瓶" : "Open bottle"}
        >
          <span className="ldb-cork" />
          <span className="text-2xl leading-none">{bottle.word.emoji || "🍾"}</span>
        </button>
      ))}

      {confetti.map((bit) => (
        <span
          key={bit.id}
          className="ldb-confetti"
          style={{
            left: `${bit.x}%`,
            top: `${bit.y}%`,
            background: bit.color,
            "--dx": `${bit.dx}px`,
            "--dy": `${bit.dy}px`,
            "--rot": `${bit.rot}deg`,
          }}
        />
      ))}

      {opened ? (
        <div className="ldb-sheet">
          <p className="text-4xl">{opened.word.emoji}</p>
          <p className="mt-1 font-display text-3xl text-sky-900">{promptOf(opened.word, targetLang)}</p>
          <p className="mt-1 text-xs font-extrabold text-sky-500">
            {isZh ? "选择正确的意思" : "Pick the right meaning"}
          </p>
          {hint ? <p className="mt-2 text-sm font-extrabold text-amber-600">{hint}</p> : null}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {choices.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                className={`rounded-2xl border-4 px-3 py-3 font-display text-xl ${
                  picked === option && option !== meaningOf(opened.word, targetLang)
                    ? "border-rose-300 bg-rose-100 text-rose-600"
                    : "border-sky-100 bg-white text-sky-800"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <button type="button" className="mt-3 text-xs font-extrabold text-sky-400" onClick={() => setOpened(null)}>
            {isZh ? "先捞别的瓶子" : "Open another bottle"}
          </button>
        </div>
      ) : (
        <p className="ldb-hint">{isZh ? "点击海面上的漂流瓶，把它打开吧" : "Tap a floating bottle to open it"}</p>
      )}
    </div>
  );
}
