// Prepare the browser app and its captured screenshots for the make.fun runner.
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const appSource = join(root, 'app');
const screenshotsSource = join(root, 'screenshots');

function screenshotFiles(directory: string): string[] {
  if (!existsSync(directory) || !statSync(directory).isDirectory()) return [];
  return readdirSync(directory).filter((entry) => !entry.startsWith('.'));
}

function assemble(outputDirectory: string): void {
  const screenshots = screenshotFiles(screenshotsSource);
  const hasJpeg = screenshots.some((name) => name.toLowerCase().endsWith('.jpg'));
  if (screenshots.length === 0 || !hasJpeg) {
    throw new Error(`Cannot build entry: ${screenshotsSource} must exist, contain files, and include at least one .jpg file`);
  }

  mkdirSync(outputDirectory, { recursive: true });
  cpSync(appSource, join(outputDirectory, 'app'), { recursive: true });
  mkdirSync(join(outputDirectory, 'screenshots'), { recursive: true });
  cpSync(screenshotsSource, join(outputDirectory, 'screenshots'), { recursive: true });

  const dossierPath = join(outputDirectory, 'dossier.json');
  const dossier = buildDossier(outputDirectory, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000
  });
  writeFileSync(dossierPath, dossier);

  if (!existsSync(dossierPath) || statSync(dossierPath).size === 0) {
    throw new Error(`Dossier was not written or is empty: ${dossierPath}`);
  }
}

assemble(outputRoot);
