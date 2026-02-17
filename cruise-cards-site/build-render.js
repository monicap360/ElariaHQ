#!/usr/bin/env node
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

const isRender = Boolean(
  process.env.RENDER_SERVICE_ID || process.env.RENDER_GIT_COMMIT || process.env.RENDER_EXTERNAL_URL
);
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

console.log(`[build] installing dependencies (memoryMb=${memoryMb ?? "unknown"})`);
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const install = spawnSync(npmCmd, ["ci", "--prefer-offline", "--no-audit", "--no-fund"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: "1",
  },
});

if ((install.status ?? 1) !== 0) {
  process.exit(install.status ?? 1);
}

console.log(`[build] running next build (memoryMb=${memoryMb ?? "unknown"})`);
const build = spawnSync(npmCmd, ["run", "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: "1",
    // Respect Render-provided heap caps like NODE_OPTIONS="--max-old-space-size=256"
  },
});

if ((build.status ?? 1) === 0) {
  process.exit(0);
}

// On Render, if the build fails (often memory-related on tiny instances),
// fall back to maintenance mode so the deploy can still succeed.
if (isRender && !forceBuild) {
  writeFileSync(
    markerPath,
    JSON.stringify(
      {
        skipped: true,
        reason: "build-failed",
        memoryMb: memoryMb ?? "unknown",
        buildStatus: build.status ?? null,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log("[build] next build failed; deploying maintenance mode instead");
  process.exit(0);
}

process.exit(build.status ?? 1);
