import { useEffect, useState } from "react";
import { getExplorerWords, getLearningProfile, getVocabProgress, VOCAB_BUNDLED_BANDS, VOCAB_UNLOCK_HITS } from "../db.js";
import { LANGUAGE_WORLDS, PHRASE_THEMES, getWorld } from "../games/languageWorlds.js";
import { BOTTLE_BANK } from "../games/bottleWords.js";
import { bandLabel, loadUnlockedVocab } from "../vocab/vocabEngine.js";
import { useLiveData } from "./useLiveData.js";

function wordKey(word) {
  return `${String(word?.en || "").trim().toLowerCase()}|${String(word?.zh || "").trim()}`;
}

export function normalizeGameWord(word) {
  const en = String(word?.en || "").trim();
  const zh = String(word?.zh || "").trim();
  if (!en && !zh) return null;
  return {
    en: en || zh,
    zh: zh || en,
    emoji: word?.emoji || "🫧",
    kBand: Number(word?.kBand) || 0,
    family: word?.family || en || zh,
  };
}

export function mergeWordLists(primary, fallback, minCount = 6) {
  const seen = new Set();
  const out = [];
  [...(primary || []), ...(fallback || [])].forEach((raw) => {
    const word = normalizeGameWord(raw);
    if (!word) return;
    const key = wordKey(word);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(word);
  });
  if (out.length >= minCount || !fallback?.length) return out;
  fallback.forEach((raw) => {
    const word = normalizeGameWord(raw);
    if (!word) return;
    const key = wordKey(word);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(word);
  });
  return out;
}

export function explorerGameWords() {
  return getExplorerWords()
    .map((item) => normalizeGameWord(item))
    .filter(Boolean);
}

export function useLearningProfile() {
  useLiveData();
  return getLearningProfile();
}

export function useWordBank(worldId = "action") {
  useLiveData();
  const profile = getLearningProfile();
  const world = getWorld(worldId);
  const words = mergeWordLists(explorerGameWords(), world.words);
  return {
    ...profile,
    world,
    words,
    worlds: LANGUAGE_WORLDS,
  };
}

export function usePhraseBank() {
  useLiveData();
  const profile = getLearningProfile();
  return {
    ...profile,
    explorerWords: explorerGameWords(),
    themes: PHRASE_THEMES,
  };
}

export function useBottleBank() {
  useLiveData();
  const profile = getLearningProfile();
  const progress = getVocabProgress();
  const [bandWords, setBandWords] = useState([]);

  useEffect(() => {
    let cancelled = false;
    loadUnlockedVocab(progress.unlockedMaxK).then((list) => {
      if (!cancelled) setBandWords(list);
    });
    return () => {
      cancelled = true;
    };
  }, [progress.unlockedMaxK]);

  const fallback = [
    ...BOTTLE_BANK,
    ...LANGUAGE_WORLDS.flatMap((world) => world.words),
    ...PHRASE_THEMES.flatMap((theme) => theme.items),
  ];
  const graded = bandWords.map((item) => normalizeGameWord(item)).filter(Boolean);
  const words = mergeWordLists(explorerGameWords(), [...graded, ...fallback], 12);
  const hits = Number(progress.correctByBand[progress.unlockedMaxK]) || 0;
  const remain = Math.max(0, VOCAB_UNLOCK_HITS - hits);
  return {
    ...profile,
    words,
    progress,
    bandTitle: bandLabel(progress.unlockedMaxK, true),
    remainToUnlock: progress.unlockedMaxK >= VOCAB_BUNDLED_BANDS ? 0 : remain,
  };
}
