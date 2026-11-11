/**
 * Project checks: run with  npm test  (Node 18+).
 * They guard the things that break silently in a no-build project:
 * missing translations, stale locale bundle, broken file references
 * and an out-of-date offline file list.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(root, file), "utf8");
const html = read("index.html");

/** Every file under a folder, as project-relative paths. */
function walk(dir) {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    return statSync(join(root, path)).isDirectory() ? walk(path) : [path];
  });
}

test("Arabic and English have exactly the same keys", () => {
  const ar = Object.keys(JSON.parse(read("locales/ar.json"))).sort();
  const en = Object.keys(JSON.parse(read("locales/en.json"))).sort();
  assert.deepEqual(ar, en);
});

test("every data-i18n key in index.html exists", () => {
  const en = JSON.parse(read("locales/en.json"));
  const keys = [...html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(keys.length > 50);
  for (const key of keys) assert.ok(key in en, `missing key: ${key}`);
});

test("js/generated/locales.js matches the JSON files", () => {
  const sandbox = { window: {} };
  sandbox.VAI = sandbox.window.VAI = {};
  vm.runInNewContext(read("js/generated/locales.js"), sandbox);
  // compare as JSON: objects built inside the vm belong to another realm
  const bundled = JSON.parse(JSON.stringify(sandbox.VAI.locales));
  assert.deepEqual(bundled.ar, JSON.parse(read("locales/ar.json")));
  assert.deepEqual(bundled.en, JSON.parse(read("locales/en.json")));
});

test("all files referenced by index.html exist", () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((m) => m[1]);
  for (const ref of refs) assert.ok(existsSync(join(root, ref)), `missing file: ${ref}`);
});

test("every stylesheet is imported by css/main.css", () => {
  const imports = [...read("css/main.css").matchAll(/@import url\("([^"]+)"\)/g)].map((m) => `css/${m[1]}`);
  const sheets = walk("css").filter((f) => !["css/main.css", "css/print.css"].includes(f));
  assert.deepEqual([...sheets].sort(), [...imports].sort());
});

test("the service worker caches every app file", () => {
  const cached = new Set([...read("service-worker.js").matchAll(/^\s+"([^"]+)",?$/gm)].map((m) => m[1]));
  const appFiles = [...walk("css"), ...walk("js"), ...walk("assets").filter((f) => !f.endsWith(".md"))];
  for (const file of appFiles) assert.ok(cached.has(file), `not cached offline: ${file}`);
  for (const file of cached) assert.ok(file === "./" || existsSync(join(root, file)), `cached file missing: ${file}`);
});

test("manifest is installable", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  assert.equal(manifest.display, "standalone");
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes("192x192") && sizes.includes("512x512"));
  assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"));
  for (const icon of manifest.icons) assert.ok(existsSync(join(root, icon.src)), icon.src);
});

test("source files stay small", () => {
  const sources = [...walk("js"), ...walk("css")].filter((f) => !f.includes("generated"));
  for (const file of sources) {
    const lines = read(file).split("\n").length;
    assert.ok(lines <= 220, `${relative(".", file)} has ${lines} lines`);
  }
});
