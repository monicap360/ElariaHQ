const { existsSync, rmSync } = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const appDir = path.join(__dirname, "cruise-cards-site");
const appBuildScript = path.join(appDir, "scripts", "render-build.js");
const rootStartScript = path.join(__dirname, "start-render.js");

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) return reject(new Error(`${command} exited via signal ${signal}`));
      resolve(code ?? 1);
    });
  });
}

async function main() {
  if (!existsSync(appDir) || !existsSync(appBuildScript)) {
    throw new Error(`App directory or build script missing: ${appBuildScript}`);
  }

  // If misconfigured as the runtime start command, bind the web port instead
  // of attempting another build.
  if (process.env.PORT) {
    const code = await run(process.execPath, [rootStartScript], {
      cwd: __dirname,
      env: process.env,
    });
    process.exit(code);
  }

  const env = {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || "1",
    SKIP_TYPECHECK: process.env.SKIP_TYPECHECK || "true",
    NODE_OPTIONS: process.env.NODE_OPTIONS || "--max-old-space-size=192",
  };

  await run("npm", ["ci", "--prefer-offline", "--no-audit", "--no-fund"], {
    cwd: appDir,
    env,
  });
  await run(process.execPath, [appBuildScript], {
    cwd: appDir,
    env,
  });
  await run("npm", ["prune", "--omit=dev", "--omit=optional", "--no-audit", "--no-fund"], {
    cwd: appDir,
    env,
  });

  const cachePath = path.join(appDir, ".next", "cache");
  rmSync(cachePath, { recursive: true, force: true });
}

main().catch((error) => {
  console.error("[build-wrapper] failed", error);
  process.exit(1);
});
