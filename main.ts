// Assemble the static studio and its captured views for make.fun.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const sourceApp = join(projectRoot, 'app');
const sourceShots = join(projectRoot, 'screenshots');

function listCaptureNames(folder: string): string[] {
  if (!existsSync(folder) || !statSync(folder).isDirectory()) return [];
  return readdirSync(folder).filter((name) => !name.startsWith('.'));
}

function createEntry(): void {
  const requiredPage = join(sourceApp, 'index.html');
  if (!existsSync(requiredPage) || !statSync(requiredPage).isFile()) {
    throw new Error(`Cannot build entry: required app page is missing from ${sourceApp}`);
  }

  const captures = listCaptureNames(sourceShots);
  const includesJpeg = captures.some((name) => name.toLowerCase().endsWith('.jpg'));
  if (!captures.length || !includesJpeg) {
    throw new Error(`Cannot build entry: ${sourceShots} must exist, contain files, and include at least one .jpg file`);
  }

  mkdirSync(destination, { recursive: true });
  cpSync(sourceApp, join(destination, 'app'), { recursive: true });
  mkdirSync(join(destination, 'screenshots'), { recursive: true });
  cpSync(sourceShots, join(destination, 'screenshots'), { recursive: true });

  const dossierFile = join(destination, 'dossier.json');
  const contents = buildDossier(destination, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000
  });
  writeFileSync(dossierFile, contents);

  let parsedDossier: unknown;
  try {
    parsedDossier = JSON.parse(readFileSync(dossierFile, 'utf8'));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Dossier could not be read as valid JSON at ${dossierFile}: ${detail}`);
  }
  if (parsedDossier === null || typeof parsedDossier !== 'object') {
    throw new Error(`Dossier did not contain a JSON object: ${dossierFile}`);
  }
}

createEntry();
