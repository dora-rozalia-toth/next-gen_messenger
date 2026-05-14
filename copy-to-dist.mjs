// "Build" for a pre-built static prototype: no compilation, just stage the
// already-built files into dist/ so the host's mandatory `npm run build`
// succeeds and has something to publish. Atlas is already baked into these
// files, so the deployed site matches the local build exactly.
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
const SKIP = new Set([
  "dist", "node_modules", "package.json", "package-lock.json",
  "copy-to-dist.mjs", "netlify.toml", ".git", ".gitignore",
]);
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
for (const entry of readdirSync(".")) {
  if (SKIP.has(entry)) continue;
  cpSync(entry, `dist/${entry}`, { recursive: true });
}
console.log("staged pre-built static files into dist/");
