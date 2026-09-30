#!/usr/bin/env node
/* Builds the site into dist/:
     dist/app.<hash>.js     — React, supabase-js and every app file, minified
     dist/styles.<hash>.css — styles.css, minified
   and points index.html + Bonxosh.html at them (between the
   <!-- build:assets --> markers). New content → new file names, so a
   browser can never mix files from two releases.

   npm run build          one-off build
   npm run build -- --watch   rebuild on every save */
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIST = path.join(ROOT, "dist");
const PAGES = ["index.html", "Bonxosh.html"];
const START = "<!-- build:assets -->", END = "<!-- /build:assets -->";

const options = {
  absWorkingDir: ROOT,
  entryPoints: { app: "src/main.js", styles: "styles.css" },
  outdir: "dist",
  entryNames: "[name].[hash]",
  bundle: true,
  minify: true,
  metafile: true,
  target: ["es2019", "safari13"],
  jsx: "transform",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  loader: { ".js": "jsx", ".jsx": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
  logLevel: "warning",
};

function publish(result) {
  const outputs = Object.keys(result.metafile.outputs).map((p) => path.basename(p));
  const js = outputs.find((f) => /^app\.[\w-]+\.js$/.test(f));
  const css = outputs.find((f) => /^styles\.[\w-]+\.css$/.test(f));
  if (!js || !css) throw new Error("build produced no app/styles output");

  // drop bundles from earlier builds
  for (const f of fs.readdirSync(DIST)) if (f !== js && f !== css) fs.rmSync(path.join(DIST, f));

  const tags = `${START}\n  <link rel="stylesheet" href="dist/${css}"/>\n  <script defer src="dist/${js}"></script>\n  ${END}`;
  for (const page of PAGES) {
    const file = path.join(ROOT, page);
    const html = fs.readFileSync(file, "utf8");
    const a = html.indexOf(START), b = html.indexOf(END);
    if (a < 0 || b < 0) throw new Error(`${page}: missing ${START} … ${END} markers`);
    fs.writeFileSync(file, html.slice(0, a) + tags + html.slice(b + END.length));
  }
  const kb = (f) => (fs.statSync(path.join(DIST, f)).size / 1024).toFixed(0) + " KB";
  console.log(`built dist/${js} (${kb(js)}), dist/${css} (${kb(css)})`);
}

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context({
    ...options,
    plugins: [{ name: "publish", setup: (b) => b.onEnd((r) => { if (!r.errors.length) publish(r); }) }],
  });
  await ctx.watch();
  console.log("watching for changes…");
} else {
  publish(await esbuild.build(options));
}
