// Copies the offline cover studio and screenshot evidence to the grader's output, then writes the kit dossier.
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const screenshots = join(here, 'screenshots');
if (!existsSync(screenshots) || !statSync(screenshots).isDirectory() || readdirSync(screenshots).length === 0) {
  throw new Error(`Cannot build cover art entry: screenshots/ is missing or empty (${screenshots}). Add the required screenshots and run again.`);
}
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
cpSync(screenshots, join(out, 'screenshots'), { recursive: true });
writeFileSync(join(out, 'dossier.json'), buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
}));
