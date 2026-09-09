import { handleWorldExplore } from "../../server/worldExploreCore.mjs";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(204, {});
  if (event.httpMethod !== "POST") return json(405, { error: "请用 POST 提交照片" });
  try {
    const payload = JSON.parse(event.body || "{}");
    const result = await handleWorldExplore(payload);
    return json(200, result);
  } catch (error) {
    return json(error.status || 500, {
      error: error.message || "识别失败",
      code: error.code || undefined,
    });
  }
}
