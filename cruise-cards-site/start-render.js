const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

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
    if (containerMemoryMb <= 640) return 128;
    if (containerMemoryMb <= 1024) return 160;
    if (containerMemoryMb <= 1536) return 224;
    if (containerMemoryMb <= 3072) return 320;
    return 448;
  }

  // Fallback when memory limit cannot be detected.
  return 160;
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

child.on("error", (error) => {
  console.error("[startup] failed to launch server", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[startup] server exited via signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
