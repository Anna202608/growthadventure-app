const OBJECT_CATEGORIES = [
  {
    en: "hat",
    zh: "帽子",
    article: "a",
    emoji: "🧢",
    matches: [
      "hat",
      "cap",
      "beret",
      "beanie",
      "fedora",
      "sun hat",
      "jazz hat",
      "baseball cap",
      "hard lining fabric",
      "帽子",
      "遮阳帽",
      "太阳帽",
      "爵士帽",
      "棒球帽",
      "草帽",
      "礼帽",
      "鸭舌帽",
      "毛线帽",
      "渔夫帽",
    ],
  },
  {
    en: "cat",
    zh: "猫",
    article: "a",
    emoji: "🐱",
    matches: [
      "cat",
      "tabby",
      "persian cat",
      "siamese",
      "kitten",
      "kitty",
      "猫",
      "猫咪",
      "狸花猫",
      "波斯猫",
      "橘猫",
      "加菲猫",
      "小猫",
    ],
  },
  {
    en: "flower",
    zh: "花",
    article: "a",
    emoji: "🌸",
    matches: [
      "flower",
      "rose",
      "red rose",
      "sunflower",
      "tulip",
      "lily",
      "daisy",
      "blossom",
      "花",
      "花朵",
      "鲜花",
      "玫瑰",
      "红玫瑰",
      "向日葵",
      "百合",
      "菊花",
      "牡丹",
      "郁金香",
    ],
  },
];

function normalizeKeyword(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function mapObjectCategory(keyword) {
  const raw = String(keyword || "").trim();
  const normalized = normalizeKeyword(raw);
  if (!normalized) return null;

  for (const category of OBJECT_CATEGORIES) {
    for (const alias of category.matches) {
      const needle = normalizeKeyword(alias);
      if (!needle) continue;
      const minLen = /[a-z]/.test(needle) ? 3 : 1;
      if (normalized.length < minLen && normalized !== needle) continue;
      if (normalized === needle || normalized.includes(needle)) {
        return category;
      }
    }
  }
  return null;
}

function englishArticle(word, article) {
  if (article) return article;
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

export async function recognizeWorldPhoto(image) {
  const API_KEY = import.meta.env.VITE_BAIDU_API_KEY;
  const SECRET_KEY = import.meta.env.VITE_BAIDU_SECRET_KEY;
  const TRANS_APP_ID = import.meta.env.VITE_BAIDU_TRANS_APP_ID;
  const TRANS_SECRET = import.meta.env.VITE_BAIDU_TRANS_SECRET;

  console.log('API_KEY loaded:', API_KEY);
  console.log('SECRET_KEY loaded:', SECRET_KEY);
  console.log('翻译APP_ID loaded:', TRANS_APP_ID);
  console.log('翻译SECRET loaded:', TRANS_SECRET);

  if (!API_KEY || !SECRET_KEY) {
    return {
      en: "object",
      zh: "物品",
      enSentence: "This is an object.",
      zhSentence: "这是一个物品。",
      emoji: "🔍",
      mocked: true,
    };
  }

  try {
    // 获取 access_token
    const tokenRes = await fetch(
      `/api/baidu/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`
    );
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error('获取access_token失败:', tokenData);
      return {
        en: "object",
        zh: "物品",
        enSentence: "This is an object.",
        zhSentence: "这是一个物品。",
        emoji: "🔍",
        mocked: true,
      };
    }

    // 调用百度图像识别 API (v2)
    const response = await fetch(
      `/api/baidu/rest/2.0/image-classify/v2/advanced_general?access_token=${tokenData.access_token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `image=${encodeURIComponent(image)}`,
      }
    );
    const data = await response.json();
    console.log('百度API响应:', data);

    if (data.result && data.result.length > 0) {
      const top = data.result[0];
      let zhKeyword = top.keyword;
      let enKeyword = zhKeyword;
      let enSentence = `This is a ${zhKeyword}.`;
      let zhSentence = `这是一个${zhKeyword}。`;
      let emoji = "🔍";

      // 先用中文原词做大类映射，命中后可跳过翻译
      let category = mapObjectCategory(zhKeyword);

      if (!category && TRANS_APP_ID && TRANS_SECRET) {
        try {
          console.log('开始翻译:', zhKeyword);
          const transResult = await translateText(zhKeyword, TRANS_APP_ID, TRANS_SECRET);
          console.log('翻译结果:', transResult);
          if (transResult) {
            enKeyword = transResult;
            category = mapObjectCategory(transResult) || mapObjectCategory(`${zhKeyword} ${transResult}`);
          }
        } catch (transError) {
          console.warn('翻译失败，使用中文关键词:', transError);
        }
      }

      if (category) {
        zhKeyword = category.zh;
        enKeyword = category.en;
        emoji = category.emoji || emoji;
        console.log("大类映射:", top.keyword, "->", category.en, category.zh);
      } else if (enKeyword !== zhKeyword) {
        const article = englishArticle(enKeyword);
        enSentence = `This is ${article} ${enKeyword}.`;
      }

      const article = englishArticle(enKeyword, category?.article);
      enSentence = `This is ${article} ${enKeyword}.`;
      zhSentence = `这是一个${zhKeyword}。`;

      return {
        en: enKeyword,
        zh: zhKeyword,
        enSentence,
        zhSentence,
        emoji,
        mocked: false,
      };
    }

    return {
      en: "object",
      zh: "物品",
      enSentence: "This is an object.",
      zhSentence: "这是一个物品。",
      emoji: "🔍",
      mocked: true,
    };
  } catch (error) {
    console.error("百度API调用失败:", error);
    return {
      en: "object",
      zh: "物品",
      enSentence: "This is an object.",
      zhSentence: "这是一个物品。",
      emoji: "🔍",
      mocked: true,
    };
  }
}

async function translateText(text, appId, secret) {
  const salt = Date.now();
  const sign = await generateSign(appId, text, salt, secret);

  const url = `/api/trans/api/trans/vip/translate?q=${encodeURIComponent(text)}&from=zh&to=en&appid=${appId}&salt=${salt}&sign=${sign}`;

  console.log('翻译请求URL:', url);

  const response = await fetch(url);
  const data = await response.json();
  console.log('翻译API响应:', data);

  if (data.trans_result && data.trans_result.length > 0) {
    return data.trans_result[0].dst;
  }

  console.warn('翻译返回空结果:', data);
  return null;
}

async function generateSign(appId, text, salt, secret) {
  const str = appId + text + salt + secret;
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}