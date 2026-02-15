const { existsSync } = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const appDir = path.join(__dirname, "cruise-cards-site");
const appStart = path.join(appDir, "start-render.js");

if (!existsSync(appStart)) {
  console.error(`[startup-wrapper] Missing app start script at ${appStart}`);
  process.exit(1);
}

const child = spawn(process.execPath, [appStart], {
  cwd: appDir,
  stdio: "inherit",
  env: process.env,
});

child.on("error", (error) => {
  console.error("[startup-wrapper] failed to launch app start script", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[startup-wrapper] app exited via signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
