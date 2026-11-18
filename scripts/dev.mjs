import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Single-command dev: the Express API (/api/*) is mounted directly inside the
// Vite dev server (see client/vite.config.js), so only Vite needs to run.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLIENT_DIR = path.join(ROOT, 'client');

const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const clientProc = spawn(npmBin, ['run', 'dev'], {
  cwd: CLIENT_DIR,
  stdio: 'inherit',
});

function shutdown(code = 0) {
  if (!clientProc.killed) clientProc.kill('SIGTERM');
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
clientProc.on('exit', (code) => shutdown(code || 0));
