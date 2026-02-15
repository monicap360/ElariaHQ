const path = require("node:path");
const { spawn } = require("node:child_process");

function runNode(args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: "inherit",
      env,
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) return reject(new Error(`Process exited via signal ${signal}`));
      resolve(code ?? 1);
    });
  });
}

async function main() {
  const runtimePort = process.env.PORT;

  if (runtimePort) {
    console.log(
      `[build-guard] Detected PORT=${runtimePort}. Launching runtime server instead of running a build.`
    );
    const code = await runNode([path.join(process.cwd(), "start-render.js")]);
    process.exit(code);
  }

  const env = {
    ...process.env,
    SKIP_TYPECHECK: process.env.SKIP_TYPECHECK || "true",
  };
  const nextCli = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const code = await runNode(["--max-old-space-size=256", nextCli, "build"], env);
  process.exit(code);
}

main().catch((error) => {
  console.error("[build-guard] failed", error);
  process.exit(1);
});
