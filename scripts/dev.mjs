import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const runCommand = (command, args) => {
  if (process.platform === 'win32') {
    return spawn('cmd', ['/d', '/s', '/c', `${command} ${args.join(' ')}`], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: false,
    });
  }

  return spawn(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
  });
};

const frontend = runCommand('bun', ['run', 'dev:frontend']);
const backend = runCommand('bun', ['run', 'dev:backend']);

const stopAll = () => {
  if (!frontend.killed) {
    frontend.kill();
  }
  if (!backend.killed) {
    backend.kill();
  }
};

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
process.on('exit', stopAll);

frontend.on('exit', (code, signal) => {
  if (signal) {
    backend.kill();
    process.exit(0);
  }

  if (code && code !== 0) {
    backend.kill();
    process.exit(code);
  }
});

backend.on('exit', (code, signal) => {
  if (signal) {
    frontend.kill();
    process.exit(0);
  }

  if (code && code !== 0) {
    frontend.kill();
    process.exit(code);
  }
});
