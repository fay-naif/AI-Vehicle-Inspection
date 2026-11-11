#!/usr/bin/env node
/**
 * Bundles locales/*.json into js/generated/locales.js.
 *
 * The app is plain <script> files so it also runs when index.html is opened
 * straight from disk, where browsers do not allow fetch() of local JSON.
 * Edit the JSON files, then run:  npm run build:locales
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = join(root, "locales");
const outFile = join(root, "js", "generated", "locales.js");

const locales = {};
for (const file of readdirSync(localesDir).filter((f) => f.endsWith(".json")).sort()) {
  locales[file.replace(".json", "")] = JSON.parse(readFileSync(join(localesDir, file), "utf8"));
}

const banner = [
  "/**",
  " * UI strings for every language.",
  " * Built from locales/*.json by scripts/build-locales.mjs – edit the JSON files, not this one.",
  " */",
].join("\n");

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${banner}\nwindow.VAI = window.VAI || {};\n\nVAI.locales = ${JSON.stringify(locales, null, 2)};\n`);
console.log(`Wrote ${Object.keys(locales).join(", ")} → js/generated/locales.js`);
