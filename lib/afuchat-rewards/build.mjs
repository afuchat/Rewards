import path from "node:path";
import { fileURLToPath } from "node:url";
import { rm } from "node:fs/promises";
import { build as esbuild } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(__dirname, "dist");
  await rm(distDir, { recursive: true, force: true });

  const shared = {
    entryPoints: [path.resolve(__dirname, "src/index.ts")],
    bundle: true,
    platform: "node",
    target: "node18",
    sourcemap: "linked",
    logLevel: "info",
  };

  await Promise.all([
    esbuild({
      ...shared,
      format: "esm",
      outfile: path.resolve(distDir, "index.js"),
    }),
    esbuild({
      ...shared,
      format: "cjs",
      outfile: path.resolve(distDir, "index.cjs"),
    }),
  ]);
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
