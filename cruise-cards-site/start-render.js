const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const http = require("node:http");

const host = "0.0.0.0";
const port = process.env.PORT || "10000";
const containerMemoryMb = detectContainerMemoryMb();

function detectContainerMemoryMb() {
  const candidates = [
    "/sys/fs/cgroup/memory.max",
    "/sys/fs/cgroup/memory/memory.limit_in_bytes",
  ];

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;

    try {
      const raw = readFileSync(candidate, "utf8").trim();
      if (!raw || raw === "max") continue;
      const bytes = Number(raw);
      if (!Number.isFinite(bytes) || bytes <= 0) continue;

      // Ignore clearly invalid "no limit" sentinel values.
      if (bytes > 1024 * 1024 * 1024 * 1024) continue;

      return Math.floor(bytes / (1024 * 1024));
    } catch {
      // ignore and continue checking fallbacks
    }
  }

  return null;
}

function resolveHeapMb() {
  const override = Number(process.env.RENDER_START_HEAP_MB || "");
  if (Number.isFinite(override) && override > 0) {
    return Math.floor(override);
  }

  if (containerMemoryMb && containerMemoryMb > 0) {
    // Conservative tiers to avoid OOM on small containers.
    if (containerMemoryMb <= 640) return 96;
    if (containerMemoryMb <= 1024) return 128;
    if (containerMemoryMb <= 1536) return 192;
    if (containerMemoryMb <= 3072) return 320;
    return 448;
  }

  // Fallback when memory limit cannot be detected.
  return 96;
}

const heapMb = String(resolveHeapMb());

const env = {
  ...process.env,
  NEXT_TELEMETRY_DISABLED: "1",
  HOSTNAME: host,
  PORT: port,
};

const standaloneServerPath = path.join(process.cwd(), ".next", "standalone", "server.js");
const nextCliPath = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const mode = existsSync(standaloneServerPath) ? "standalone" : "next-start";
const args =
  mode === "standalone"
    ? [`--max-old-space-size=${heapMb}`, standaloneServerPath]
    : [`--max-old-space-size=${heapMb}`, nextCliPath, "start", "-H", host, "-p", port];

console.log(
  `[startup] mode=${mode} host=${host} port=${port} heapMb=${heapMb} containerMemoryMb=${containerMemoryMb ?? "unknown"}`
);

const child = spawn(process.execPath, args, {
  stdio: "inherit",
  env,
});

let fallbackStarted = false;

function startFallbackServer(reason) {
  if (fallbackStarted) return;
  fallbackStarted = true;

  console.error(`[startup] falling back to maintenance server (${reason})`);
  const server = http.createServer((_req, res) => {
    res.statusCode = 503;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Service is starting. Please retry in a moment.");
  });

  server.listen(Number(port), host, () => {
    console.log(`[startup] maintenance server listening on ${host}:${port}`);
  });

  server.on("error", (error) => {
    console.error("[startup] maintenance server failed", error);
    process.exit(1);
  });
}

setTimeout(() => {
  if (fallbackStarted || child.exitCode !== null) return;

  const probe = http.createServer();
  probe.once("error", (error) => {
    // EADDRINUSE means an app server is already listening.
    if (error && error.code !== "EADDRINUSE") {
      console.error("[startup] port probe error", error);
    }
  });
  probe.once("listening", () => {
    probe.close(() => {
      child.kill("SIGTERM");
      startFallbackServer("app did not bind port within startup window");
    });
  });
  probe.listen(Number(port), host);
}, 12000);

child.on("error", (error) => {
  console.error("[startup] failed to launch server", error);
  startFallbackServer("launcher error");
});

child.on("exit", (code, signal) => {
  if (fallbackStarted) return;
  if (signal) {
    console.error(`[startup] server exited via signal ${signal}`);
    startFallbackServer(`signal ${signal}`);
    return;
  }
  if ((code ?? 1) !== 0) {
    startFallbackServer(`exit code ${code ?? 1}`);
    return;
  }
  process.exit(0);
});
