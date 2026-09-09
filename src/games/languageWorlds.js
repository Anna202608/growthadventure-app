export const LANGUAGE_WORLDS = [
  {
    id: "action",
    name: "动作世界",
    emoji: "🏃",
    introZh: "认识跑、走、坐这些动作，还能跟着做动作！",
    introEn: "Learn action words, and act them out!",
    hasBodyMode: true,
    words: [
      { en: "run", zh: "跑", emoji: "🏃" },
      { en: "walk", zh: "走", emoji: "🚶" },
      { en: "sit", zh: "坐", emoji: "🪑" },
      { en: "jump", zh: "跳", emoji: "🦘" },
      { en: "clap", zh: "拍手", emoji: "👏" },
      { en: "wave", zh: "挥手", emoji: "👋" },
    ],
  },
  {
    id: "polite",
    name: "礼貌世界",
    emoji: "🙏",
    introZh: "学习你好、谢谢这些礼貌用语。",
    introEn: "Learn hello, thank you and other polite words.",
    hasBodyMode: false,
    words: [
      { en: "hello", zh: "你好", emoji: "👋" },
      { en: "good morning", zh: "早上好", emoji: "🌅" },
      { en: "thank you", zh: "谢谢", emoji: "🙏" },
      { en: "please", zh: "请", emoji: "🙏" },
      { en: "sorry", zh: "对不起", emoji: "🙇" },
      { en: "goodbye", zh: "再见", emoji: "👋" },
    ],
  },
  {
    id: "animal",
    name: "动物世界",
    emoji: "🐾",
    introZh: "认识猫、狗、鸟这些小动物。",
    introEn: "Meet cats, dogs, birds and more animals.",
    hasBodyMode: false,
    words: [
      { en: "cat", zh: "猫", emoji: "🐱" },
      { en: "dog", zh: "狗", emoji: "🐶" },
      { en: "bird", zh: "鸟", emoji: "🐦" },
      { en: "fish", zh: "鱼", emoji: "🐟" },
      { en: "rabbit", zh: "兔子", emoji: "🐰" },
      { en: "duck", zh: "鸭子", emoji: "🦆" },
    ],
  },
];

export const PHRASE_THEMES = [
  {
    id: "action",
    name: "动作世界",
    items: [
      { emoji: "🛏️", en: "go to bed", zh: "去睡觉" },
      { emoji: "🍳", en: "eat breakfast", zh: "吃早餐" },
      { emoji: "🪥", en: "brush teeth", zh: "刷牙" },
      { emoji: "🧼", en: "wash face", zh: "洗脸" },
      { emoji: "🚰", en: "drink water", zh: "喝水" },
      { emoji: "🚶", en: "have a walk", zh: "去散步" },
      { emoji: "🏠", en: "walk home", zh: "走回家" },
      { emoji: "🍌", en: "eat banana", zh: "吃香蕉" },
      { emoji: "🌅", en: "get up", zh: "起床" },
      { emoji: "👟", en: "put on shoes", zh: "穿鞋子" },
    ],
  },
  {
    id: "noun",
    name: "名词世界",
    items: [
      { emoji: "🍎", en: "red apple", zh: "红苹果" },
      { emoji: "🍌", en: "yellow banana", zh: "黄香蕉" },
      { emoji: "🪻", en: "blue flower", zh: "蓝花" },
      { emoji: "🌳", en: "green tree", zh: "绿树" },
      { emoji: "🐈‍⬛", en: "black cat", zh: "黑猫" },
      { emoji: "☁️", en: "white cloud", zh: "白云" },
      { emoji: "🌸", en: "pink flower", zh: "粉花" },
      { emoji: "🍊", en: "orange", zh: "橙子" },
      { emoji: "🐻", en: "brown bear", zh: "棕熊" },
      { emoji: "🍇", en: "purple grape", zh: "紫葡萄" },
    ],
  },
  {
    id: "prep",
    name: "介词世界",
    items: [
      { emoji: "🌳", en: "on the tree", zh: "在树上" },
      { emoji: "🏠", en: "at home", zh: "在家里" },
      { emoji: "🏫", en: "in the class", zh: "在教室" },
      { emoji: "🪑", en: "under the chair", zh: "在椅子下" },
      { emoji: "🚪", en: "next to the door", zh: "在门旁边" },
      { emoji: "⏰", en: "time for bed", zh: "该睡觉了" },
      { emoji: "🖥️", en: "on the desk", zh: "在桌上" },
      { emoji: "🌲", en: "behind the tree", zh: "在树后面" },
      { emoji: "🏡", en: "in front of the house", zh: "在房子前" },
      { emoji: "🪑", en: "between the chairs", zh: "在椅子中间" },
    ],
  },
];

export const ENGLISH_WORLDS = LANGUAGE_WORLDS;

export function getWorld(id) {
  return LANGUAGE_WORLDS.find((world) => world.id === id) || LANGUAGE_WORLDS[0];
}
