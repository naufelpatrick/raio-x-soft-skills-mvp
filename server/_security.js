const rateLimitBuckets = new Map();

export function applySecurityHeaders(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

export function requirePost(req, res) {
  if (req.method === "POST") return true;

  res.setHeader("Allow", "POST");
  res.status(405).json({ error: "Método não permitido." });
  return false;
}

export function requireJson(req, res) {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("application/json")) return true;

  res.status(415).json({ error: "Envie os dados como JSON." });
  return false;
}

export function requireAllowedOrigin(req, res) {
  const configuredOrigins = (process.env.APP_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.length === 0) return true;

  const requestOrigin = req.headers.origin;
  if (!requestOrigin || configuredOrigins.includes(requestOrigin)) return true;

  res.status(403).json({ error: "Origem não autorizada." });
  return false;
}

export function checkRateLimit(req, res, namespace, limit, windowMs) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const clientIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  const key = `${namespace}:${clientIp}`;
  const now = Date.now();
  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
    res.status(429).json({ error: "Muitas tentativas. Aguarde alguns minutos." });
    return false;
  }

  current.count += 1;
  return true;
}

export function parseBody(req) {
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  return req.body || {};
}

export function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}
