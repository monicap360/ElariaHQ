const { existsSync, readFileSync, writeFileSync, unlinkSync } = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

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
      if (bytes > 1024 * 1024 * 1024 * 1024) continue;
      return Math.floor(bytes / (1024 * 1024));
    } catch {
      // ignore
    }
  }
  return null;
}

const markerPath = path.join(process.cwd(), ".render-build-skipped");
const memoryMb = detectContainerMemoryMb();

const forceSkip = process.env.RENDER_SKIP_NEXT_BUILD === "1";
const forceBuild = process.env.RENDER_FORCE_NEXT_BUILD === "1";

const lowMemory = memoryMb != null ? memoryMb <= 640 : false;
const shouldSkip = !forceBuild && (forceSkip || lowMemory);

if (shouldSkip) {
  // Create a marker so runtime can enter maintenance mode reliably.
  writeFileSync(
    markerPath,
    JSON.stringify(
      {
        skipped: true,
        reason: forceSkip ? "forced" : "low-memory",
        memoryMb: memoryMb ?? "unknown",
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log(
    `[build] skipping next build (reason=${forceSkip ? "forced" : "low-memory"} memoryMb=${memoryMb ?? "unknown"})`
  );
  process.exit(0);
}

// Ensure marker is removed on full builds.
if (existsSync(markerPath)) {
  try {
    unlinkSync(markerPath);
  } catch {
    // ignore
  }
}

console.log(`[build] running next build (memoryMb=${memoryMb ?? "unknown"})`);
const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "build"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      // Respect Render-provided heap caps like NODE_OPTIONS="--max-old-space-size=256"
    },
  }
);

process.exit(result.status ?? 1);
