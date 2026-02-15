const { rmSync } = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

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
  const cwd = process.cwd();
  const env = {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || "1",
    SKIP_TYPECHECK: process.env.SKIP_TYPECHECK || "true",
    NODE_OPTIONS: process.env.NODE_OPTIONS || "--max-old-space-size=192",
  };

  // If this command is accidentally used as the runtime start command, bind the
  // web port immediately instead of running install/build steps.
  if (process.env.PORT) {
    console.log(
      `[build-wrapper] Detected PORT=${process.env.PORT}. Launching runtime server instead of build.`
    );
    const code = await run(process.execPath, [path.join(cwd, "start-render.js")], {
      cwd,
      env,
    });
    process.exit(code);
  }

  await run("npm", ["ci", "--prefer-offline", "--no-audit", "--no-fund"], {
    cwd,
    env,
  });
  await run(process.execPath, [path.join(cwd, "scripts", "render-build.js")], {
    cwd,
    env,
  });
  await run("npm", ["prune", "--omit=dev", "--omit=optional", "--no-audit", "--no-fund"], {
    cwd,
    env,
  });

  rmSync(path.join(cwd, ".next", "cache"), { recursive: true, force: true });
}

main().catch((error) => {
  console.error("[build-wrapper] failed", error);
  process.exit(1);
});
