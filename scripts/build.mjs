import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_DIR = path.join(ROOT, 'server');
const CLIENT_DIR = path.join(ROOT, 'client');
const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const isCloudBuild = Boolean(process.env.RENDER || process.env.CI);

function runNpm(args, label) {
  console.log(`\n[build] ${label}...`);
  execFileSync(npmBin, args, {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

// 1. Install server runtime dependencies if missing or running in cloud/CI build (Render.com)
const hasServerDeps = fs.existsSync(path.join(SERVER_DIR, 'node_modules/express'));
if (isCloudBuild || !hasServerDeps) {
  runNpm(['--prefix', 'server', 'install', '--omit=dev'], 'Installing server dependencies');
}

// 2. Install client dependencies (explicitly --include=dev so Vite is installed even when NODE_ENV=production)
const hasClientVite = fs.existsSync(path.join(CLIENT_DIR, 'node_modules/vite'));
if (isCloudBuild || !hasClientVite) {
  runNpm(['--prefix', 'client', 'install', '--include=dev'], 'Installing client build dependencies');
}

// 3. Build Vite React frontend into client/dist
runNpm(['--prefix', 'client', 'run', 'build'], 'Building Vite production frontend');

console.log('\n[build] Moni Lodge production build complete (client/dist ready).\n');
