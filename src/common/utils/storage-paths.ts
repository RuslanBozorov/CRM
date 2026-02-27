import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');
export const HOMEWORK_UPLOADS_DIR = join(UPLOADS_DIR, 'files');

const SRC_TEMPLATES_DIR = join(process.cwd(), 'src', 'templates');
const DIST_TEMPLATES_DIR = join(process.cwd(), 'dist', 'templates');

export const TEMPLATES_DIR = existsSync(DIST_TEMPLATES_DIR)
  ? DIST_TEMPLATES_DIR
  : SRC_TEMPLATES_DIR;

export function ensureStorageDirs(): void {
  mkdirIfMissing(UPLOADS_DIR);
  mkdirIfMissing(HOMEWORK_UPLOADS_DIR);
}

function mkdirIfMissing(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}
