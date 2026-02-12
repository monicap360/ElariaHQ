const { existsSync } = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const host = "0.0.0.0";
const port = process.env.PORT || "10000";
const heapMb = process.env.RENDER_START_HEAP_MB || "384";

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

console.log(`[startup] mode=${mode} host=${host} port=${port} heapMb=${heapMb}`);

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
