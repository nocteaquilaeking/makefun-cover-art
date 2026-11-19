// Package the offline studio and its recorded browser captures.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const appSource = join(root, 'app');
const shotSource = join(root, 'screenshots');

function visibleNames(directory: string): string[] {
  if (!existsSync(directory) || !statSync(directory).isDirectory()) return [];
  return readdirSync(directory).filter((name) => !name.startsWith('.'));
}

function countFiles(directory: string): number {
  let count = 0;
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const entry = statSync(path);
    if (entry.isDirectory()) count += countFiles(path);
    else if (entry.isFile()) count++;
  }
  return count;
}

function recordedAppFileCount(dossier: unknown, dossierPath: string): number {
  if (dossier === null || typeof dossier !== 'object' || !('text' in dossier) || typeof dossier.text !== 'string') {
    throw new Error(`Dossier has no app summary text: ${dossierPath}`);
  }
  const source = /^Source files: (\d+) \(/m.exec(dossier.text);
  const vendored = /^Vendored files: (\d+) \(/m.exec(dossier.text);
  const assets = /^Assets: (.*)$/m.exec(dossier.text);
  if (!source || !vendored || !assets) throw new Error(`Dossier app file counts are missing or invalid: ${dossierPath}`);
  const assetFiles = assets[1] === 'none'
    ? 0
    : [...assets[1].matchAll(/(?:^|, )[^,]+? (\d+) \(\d+ bytes\)/g)]
      .reduce((total, match) => total + Number(match[1]), 0);
  return Number(source[1]) + Number(vendored[1]) + assetFiles;
}

function buildEntry(): void {
  const page = join(appSource, 'index.html');
  if (!existsSync(page) || !statSync(page).isFile()) {
    throw new Error(`Missing required studio page: ${page}`);
  }

  const captures = visibleNames(shotSource);
  if (!captures.length || !captures.some((name) => name.toLowerCase().endsWith('.jpg'))) {
    throw new Error(`Screenshots at ${shotSource} must include files and at least one .jpg`);
  }

  mkdirSync(output, { recursive: true });
  cpSync(appSource, join(output, 'app'), { recursive: true });
  mkdirSync(join(output, 'screenshots'), { recursive: true });
  cpSync(shotSource, join(output, 'screenshots'), { recursive: true });

  const dossierPath = join(output, 'dossier.json');
  const dossier = buildDossier(output, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000
  });
  writeFileSync(dossierPath, dossier);

  const written = readFileSync(dossierPath, 'utf8');
  if (!written.length) throw new Error(`Dossier is empty: ${dossierPath}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(written);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Dossier is not valid JSON (${dossierPath}): ${message}`);
  }
  if (parsed === null || typeof parsed !== 'object') throw new Error(`Dossier is not a JSON object: ${dossierPath}`);

  const recordedCount = recordedAppFileCount(parsed, dossierPath);
  const copiedCount = countFiles(join(output, 'app'));
  if (recordedCount !== copiedCount) {
    throw new Error(`Dossier app file count mismatch: recorded ${recordedCount}, copied ${copiedCount} (${dossierPath})`);
  }
}

buildEntry();
