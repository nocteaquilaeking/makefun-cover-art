import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-app.ts';

const root = new URL('.', import.meta.url).pathname;
const sourceApp = join(root, 'app');
const sourceShots = join(root, 'screenshots');
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
if (!existsSync(sourceShots) || !statSync(sourceShots).isDirectory() || !readdirSync(sourceShots).some((name) => /\.jpg$/i.test(name) && statSync(join(sourceShots, name)).isFile())) {
  throw new Error('screenshots/ must exist and contain at least one .jpg file');
}
mkdirSync(output, { recursive: true });
cpSync(sourceApp, join(output, 'app'), { recursive: true });
cpSync(sourceShots, join(output, 'screenshots'), { recursive: true });
const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(output, 'dossier.json'), dossier);
const saved = readFileSync(join(output, 'dossier.json'), 'utf8');
if (!saved.trim()) throw new Error('dossier.json is empty');
JSON.parse(saved);
const screenshotFiles = readdirSync(sourceShots).filter((name) => statSync(join(sourceShots, name)).isFile());
for (const name of screenshotFiles) {
  const bytes = statSync(join(sourceShots, name)).size;
  if (bytes > 262144) throw new Error(`Screenshot ${name} is ${bytes} bytes; maximum is 262144 bytes`);
}
const shotsManifest = JSON.parse(readFileSync(join(root, 'shots.json'), 'utf8'));
if (!Array.isArray(shotsManifest.shots)) throw new Error('shots.json must contain a shots array');
if (screenshotFiles.length !== shotsManifest.shots.length) {
  throw new Error(`Screenshot count is ${screenshotFiles.length}; shots.json declares ${shotsManifest.shots.length} shots`);
}
console.log(`Dossier written and parsed at ${join(output, 'dossier.json')}`);
