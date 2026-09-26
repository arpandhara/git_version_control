const WebSocket = require('ws');
const Docker = require('dockerode');

const isWindows = process.platform === 'win32';
const socketPath = isWindows ? '//./pipe/docker_engine' : '/var/run/docker.sock';
const docker = new Docker({ socketPath });

/**
 * Initializes the WebSocket server for interactive terminal sessions.
 * Spawns an ephemeral Docker container for each connected client and pipes
 * their WebSocket stream directly into a bash TTY process.
 *
 * @param {import('http').Server} server - The running HTTP server instance.
 * @returns {WebSocket.Server} The configured WebSocket server instance.
 */
function initTerminalServer(server) {
  const wss = new WebSocket.Server({ noServer: true, path: '/ws/terminal' });

  wss.on('connection', async (ws, req) => {
    let container;
    let isClosed = false;

    // Cleanup container if the WebSocket closes
    ws.on('close', async () => {
      isClosed = true;
      try { if (container) await container.remove({ force: true }); } catch (_) { /* ignore kill errors */ }
    });

    try {
      const { FileService } = require('./file.service');
      // Using 'default_workspace' for now. For auth, parse ws params or cookies.
      const workspaceId = 'default_workspace'; 
      const hostWorkspacePath = await FileService.ensureWorkspace(workspaceId);
      const bindPath = `${hostWorkspacePath}:/workspace`;

      // Create an isolated container for the terminal session
      container = await docker.createContainer({
        Image: 'python:3.11-slim',
        Tty: true,
        OpenStdin: true,
        StdinOnce: false,
        Cmd: ['/bin/bash'],
        WorkingDir: '/workspace', // Start in their workspace
        NetworkDisabled: false, // Temporarily disabled network isolation so pip can download packages!
        Env: [
          'PIP_USER=1',
          'PYTHONUSERBASE=/workspace/.local',
          'PATH=/workspace/.local/bin:/usr/local/bin:/usr/local/sbin:/usr/sbin:/usr/bin:/sbin:/bin'
        ],
        HostConfig: {
          Binds: [bindPath], // Mount the workspace
          Memory: 256 * 1024 * 1024, // 256MB RAM limit
          NanoCpus: 500000000, // 0.5 CPU limit
          PidsLimit: 64,
          AutoRemove: false // Set to false because we are explicitly removing it with {force: true} to avoid Windows bugs
        }
      });

      // Race condition check: if they disconnected while we were creating it!
      if (isClosed) {
          await container.remove({ force: true }).catch(() => {});
          return;
      }

      const execStream = await container.attach({
        stream: true, stdin: true, stdout: true, stderr: true, hijack: true
      });

      await container.start();

      // Pipe container output directly to the WebSocket client
      execStream.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(chunk.toString('utf8'));
      });

      // Handle input and resize commands from the client
      ws.on('message', (msg) => {
        const parsed = JSON.parse(msg);
        if (parsed.type === 'input') {
          execStream.write(parsed.data);
        } else if (parsed.type === 'resize') {
          container.resize({ h: parsed.rows, w: parsed.cols }).catch(() => { /* ignore resize errors */ });
        }
      });

    } catch (err) {
      if (ws.readyState === WebSocket.OPEN) ws.send(`\r\nError: ${err.message}\r\n`);
      ws.close();
    }
  });

  return wss;
}

module.exports = { initTerminalServer };
