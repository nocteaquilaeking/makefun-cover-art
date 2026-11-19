// Assemble the static editor and its captured views for the make.fun runner.
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const captureFolder = join(root, 'screenshots');
const visibleCaptures = existsSync(captureFolder) && statSync(captureFolder).isDirectory()
  ? readdirSync(captureFolder).filter((entry) => !entry.startsWith('.')) : [];
if (!visibleCaptures.length) throw new Error(`Cannot build entry: screenshots/ is missing or empty at ${captureFolder}`);

mkdirSync(output, { recursive: true });
cpSync(join(root, 'app'), join(output, 'app'), { recursive: true });
mkdirSync(join(output, 'screenshots'), { recursive: true });
cpSync(captureFolder, join(output, 'screenshots'), { recursive: true });
const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(output, 'dossier.json'), dossier);
