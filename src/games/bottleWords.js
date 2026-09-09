export const BOTTLE_ORIGINS = [
  { zh: "美国", en: "the USA" },
  { zh: "英国", en: "the UK" },
  { zh: "加拿大", en: "Canada" },
  { zh: "澳大利亚", en: "Australia" },
  { zh: "新加坡", en: "Singapore" },
  { zh: "中国", en: "China" },
];

export const BOTTLE_BANK = [
  { en: "apple", zh: "苹果", emoji: "🍎", theme: "food" },
  { en: "banana", zh: "香蕉", emoji: "🍌", theme: "food" },
  { en: "orange", zh: "橙子", emoji: "🍊", theme: "food" },
  { en: "grape", zh: "葡萄", emoji: "🍇", theme: "food" },
  { en: "bread", zh: "面包", emoji: "🍞", theme: "food" },
  { en: "milk", zh: "牛奶", emoji: "🥛", theme: "food" },
  { en: "rice", zh: "米饭", emoji: "🍚", theme: "food" },
  { en: "cake", zh: "蛋糕", emoji: "🍰", theme: "food" },
  { en: "cat", zh: "猫", emoji: "🐱", theme: "animal" },
  { en: "dog", zh: "狗", emoji: "🐶", theme: "animal" },
  { en: "bird", zh: "鸟", emoji: "🐦", theme: "animal" },
  { en: "fish", zh: "鱼", emoji: "🐟", theme: "animal" },
  { en: "rabbit", zh: "兔子", emoji: "🐰", theme: "animal" },
  { en: "duck", zh: "鸭子", emoji: "🦆", theme: "animal" },
  { en: "panda", zh: "熊猫", emoji: "🐼", theme: "animal" },
  { en: "horse", zh: "马", emoji: "🐴", theme: "animal" },
  { en: "red", zh: "红色", emoji: "🔴", theme: "color" },
  { en: "blue", zh: "蓝色", emoji: "🔵", theme: "color" },
  { en: "green", zh: "绿色", emoji: "🟢", theme: "color" },
  { en: "yellow", zh: "黄色", emoji: "🟡", theme: "color" },
  { en: "pink", zh: "粉色", emoji: "🩷", theme: "color" },
  { en: "sun", zh: "太阳", emoji: "☀️", theme: "nature" },
  { en: "moon", zh: "月亮", emoji: "🌙", theme: "nature" },
  { en: "star", zh: "星星", emoji: "⭐", theme: "nature" },
  { en: "flower", zh: "花", emoji: "🌸", theme: "nature" },
  { en: "tree", zh: "树", emoji: "🌳", theme: "nature" },
  { en: "sea", zh: "大海", emoji: "🌊", theme: "nature" },
  { en: "hello", zh: "你好", emoji: "👋", theme: "life" },
  { en: "thank you", zh: "谢谢", emoji: "🙏", theme: "life" },
  { en: "friend", zh: "朋友", emoji: "🤝", theme: "life" },
  { en: "book", zh: "书", emoji: "📖", theme: "life" },
  { en: "school", zh: "学校", emoji: "🏫", theme: "life" },
];

const BOTTLE_COLORS = ["#38bdf8", "#f472b6", "#a78bfa", "#fbbf24", "#34d399", "#fb7185", "#22d3ee"];

export function bottleColor(index = 0) {
  return BOTTLE_COLORS[index % BOTTLE_COLORS.length];
}

export function pickOrigin(word, index = 0) {
  if (word?.countryZh) return { zh: word.countryZh, en: word.countryEn || word.countryZh };
  const looksChinese = /[\u4e00-\u9fff]/.test(String(word?.zh || ""));
  if (looksChinese && String(word?.en || "").length <= 12) {
    return BOTTLE_ORIGINS[(index + 2) % BOTTLE_ORIGINS.length];
  }
  return BOTTLE_ORIGINS[index % BOTTLE_ORIGINS.length];
}
