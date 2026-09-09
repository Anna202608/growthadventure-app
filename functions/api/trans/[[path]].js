const BAIDU_TRANS_ORIGIN = "https://fanyi-api.baidu.com";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "cf-connecting-ip",
  "cf-ipcountry",
  "cf-ray",
  "cf-visitor",
  "cf-ew-via",
  "cdn-loop",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-real-ip",
]);

function joinPath(pathParam) {
  if (!pathParam) return "";
  if (Array.isArray(pathParam)) return pathParam.join("/");
  return String(pathParam).replace(/^\/+/, "");
}

function filterHeaders(headers) {
  const next = new Headers();
  for (const [key, value] of headers.entries()) {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) continue;
    next.set(key, value);
  }
  return next;
}

export async function onRequest({ request, params }) {
  const incoming = new URL(request.url);
  const upstreamPath = joinPath(params.path);
  const targetUrl = `${BAIDU_TRANS_ORIGIN}/${upstreamPath}${incoming.search}`;

  const method = request.method.toUpperCase();
  const headers = filterHeaders(request.headers);

  const init = {
    method,
    headers,
    redirect: "follow",
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = request.body;
  }

  const upstream = await fetch(targetUrl, init);
  const responseHeaders = filterHeaders(upstream.headers);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
