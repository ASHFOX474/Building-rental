import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_UPLOAD_DIR = path.resolve(__dirname, '../../uploads/tmp');

fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TEMP_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname || '');
    cb(null, `upload-${unique}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024, // up to 250 MB for walkthrough videos
    files: 20,
  },
});

/** Remove temporary multer files safely after Drive upload completes or fails. */
export function cleanupTempFiles(files = []) {
  for (const f of files) {
    if (f?.path) {
      fs.promises.unlink(f.path).catch(() => {});
    }
  }
}
