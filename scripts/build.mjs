import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = join(projectDir, "dist");
const requiredFiles = ["index.html", "styles.css", "script.js"];

const checks = [
  ["index.html", "24 сентября"],
  ["index.html", "16:00–18:00 МСК"],
  ["index.html", 'id="application-form"'],
  ["script.js", "GOOGLE_FORM_ACTION"],
  ["script.js", 'name: "entry.896684943"'],
  ["script.js", '"utm_source"'],
];

for (const file of requiredFiles) {
  const info = await stat(join(projectDir, file));
  if (!info.isFile() || info.size === 0) throw new Error(`Missing required file: ${file}`);
}

for (const [file, expected] of checks) {
  const content = await readFile(join(projectDir, file), "utf8");
  if (!content.includes(expected)) throw new Error(`Expected marker not found in ${file}: ${expected}`);
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const file of requiredFiles) {
  await cp(join(projectDir, file), join(outputDir, file));
}

await cp(join(projectDir, "assets"), join(outputDir, "assets"), { recursive: true });
await writeFile(join(outputDir, ".nojekyll"), "", "utf8");

console.log(`Built static site in ${outputDir}`);
