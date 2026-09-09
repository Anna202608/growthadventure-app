const SYSTEM_PROMPT = `You identify the main object in a child's photo for a language-learning app.
Return ONLY compact JSON, no markdown, with keys:
en: English noun (lowercase unless a proper name)
zh: Chinese name
enSentence: one short simple English sentence using the English word
zhSentence: one short simple Chinese sentence using the Chinese word
emoji: one emoji that matches the object
If unsure, still pick the most likely everyday object.`;

function extractJson(text) {
  const raw = String(text || "").trim();
  const fenced = raw.match(/\{[\s\S]*\}/);
  const payload = fenced ? fenced[0] : raw;
  const parsed = JSON.parse(payload);
  const en = String(parsed.en || parsed.english || "").trim();
  const zh = String(parsed.zh || parsed.chinese || "").trim();
  if (!en || !zh) throw new Error("识别结果不完整");
  return {
    en,
    zh,
    enSentence: String(parsed.enSentence || parsed.en_sentence || `This is ${en}.`).trim(),
    zhSentence: String(parsed.zhSentence || parsed.zh_sentence || `这是${zh}。`).trim(),
    emoji: String(parsed.emoji || "🔍").trim() || "🔍",
  };
}

async function callChat({ url, apiKey, model, image }) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Identify the main object and return JSON." },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `识别接口出错（${response.status}）`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  const text = data?.choices?.[0]?.message?.content;
  return extractJson(text);
}

export async function handleWorldExplore({ image } = {}) {
  if (!image || !String(image).startsWith("data:image")) {
    const err = new Error("请先拍一张照片");
    err.status = 400;
    throw err;
  }

  const moonshot = process.env.MOONSHOT_API_KEY || process.env.KIMI_API_KEY;
  const openai = process.env.OPENAI_API_KEY;

  if (moonshot) {
    return callChat({
      url: "https://api.moonshot.cn/v1/chat/completions",
      apiKey: moonshot,
      model: process.env.MOONSHOT_VISION_MODEL || "moonshot-v1-8k-vision-preview",
      image,
    });
  }

  if (openai) {
    return callChat({
      url: "https://api.openai.com/v1/chat/completions",
      apiKey: openai,
      model: process.env.OPENAI_VISION_MODEL || "gpt-4o-mini",
      image,
    });
  }

  const err = new Error("NO_KEY");
  err.status = 501;
  err.code = "NO_KEY";
  throw err;
}
