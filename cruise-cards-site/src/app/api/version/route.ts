import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const commit =
    process.env.RENDER_GIT_COMMIT ||
    process.env.GIT_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    "unknown";
  const branch = process.env.RENDER_GIT_BRANCH || process.env.GIT_BRANCH || "unknown";
  const deployId = process.env.RENDER_DEPLOY_ID || "unknown";
  const version = process.env.npm_package_version || "unknown";

  return NextResponse.json({
    commit,
    branch,
    deployId,
    version,
    runtime: "next",
  });
}
