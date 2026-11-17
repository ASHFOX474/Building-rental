import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_DIR = path.join(ROOT, 'server');
const CLIENT_DIR = path.join(ROOT, 'client');

const serverArgs = fs.existsSync(path.join(SERVER_DIR, '.env'))
  ? ['--watch', '--env-file=.env', 'src/index.js']
  : ['--watch', 'src/index.js'];

const serverProc = spawn(process.execPath, serverArgs, {
  cwd: SERVER_DIR,
  stdio: 'inherit',
});

const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const clientProc = spawn(npmBin, ['run', 'dev'], {
  cwd: CLIENT_DIR,
  stdio: 'inherit',
  env: { ...process.env, MANAGED_BY_ROOT_DEV: '1' },
});

function shutdown(code = 0) {
  if (!serverProc.killed) serverProc.kill('SIGTERM');
  if (!clientProc.killed) clientProc.kill('SIGTERM');
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
serverProc.on('exit', (code) => shutdown(code || 0));
clientProc.on('exit', (code) => shutdown(code || 0));
