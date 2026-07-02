import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const env = {
  ...process.env,
  PORT: process.env.PORT || '8080',
};

const serverPath = path.join(rootDir, '.output', 'server', 'index.mjs');
const child = spawn(process.execPath, [serverPath], {
  stdio: 'inherit',
  cwd: rootDir,
  env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code);
  }
});
