import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.resolve(__dirname, '../server');

function isPort4000Alive() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:4000/api/health', { timeout: 600 }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

function autoStartBackendPlugin() {
  let child = null;

  const stopChild = () => {
    if (child && !child.killed) {
      child.kill('SIGTERM');
      child = null;
    }
  };

  return {
    name: 'auto-start-backend',
    apply: 'serve',
    async configureServer(server) {
      if (process.env.MANAGED_BY_ROOT_DEV === '1') return;
      if (!fs.existsSync(path.join(SERVER_DIR, 'src/index.js'))) return;
      if (await isPort4000Alive()) return;

      const args = fs.existsSync(path.join(SERVER_DIR, '.env'))
        ? ['--watch', '--env-file=.env', 'src/index.js']
        : ['--watch', 'src/index.js'];

      child = spawn(process.execPath, args, {
        cwd: SERVER_DIR,
        stdio: 'inherit',
      });

      child.on('exit', () => {
        child = null;
      });

      server.httpServer?.once('close', stopChild);
      process.once('exit', stopChild);
      process.once('SIGINT', stopChild);
      process.once('SIGTERM', stopChild);

      // Give Express a moment to bind port 4000 before Vite opens
      for (let i = 0; i < 15; i += 1) {
        if (await isPort4000Alive()) break;
        await new Promise((r) => setTimeout(r, 150));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), autoStartBackendPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        timeout: 600000,
        proxyTimeout: 600000,
      },
    },
  },
});
