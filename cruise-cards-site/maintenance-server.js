const http = require("node:http");
const { URL } = require("node:url");

const host = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || "10000");

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.end(body);
}

function text(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/api/health") {
    return json(res, 200, {
      ok: true,
      mode: "maintenance",
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  }

  if (url.pathname === "/api/version") {
    return json(res, 200, {
      ok: true,
      mode: "maintenance",
      commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || null,
      timestamp: new Date().toISOString(),
    });
  }

  return text(
    res,
    200,
    [
      "Cruises From Galveston is temporarily in maintenance mode.",
      "",
      "We are upgrading the server and will be back shortly.",
      "",
      "Health check: /api/health",
    ].join("\n")
  );
});

server.listen(port, host, () => {
  console.log(`[maintenance] listening on http://${host}:${port}`);
});

server.on("error", (err) => {
  console.error("[maintenance] server error", err);
  process.exit(1);
});
