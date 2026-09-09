import { handleWorldExplore } from "./server/worldExploreCore.mjs";

export function worldExploreApiPlugin() {
  return {
    name: "world-explore-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split("?")[0];
        if (path !== "/api/world-explore") return next();

        res.setHeader("Content-Type", "application/json");
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "请用 POST 提交照片" }));
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
          const result = await handleWorldExplore(payload);
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (error) {
          res.statusCode = error.status || 500;
          res.end(JSON.stringify({ error: error.message || "识别失败", code: error.code }));
        }
      });
    },
  };
}
