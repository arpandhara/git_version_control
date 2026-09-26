# Online Python Code Compiler & IDE Sandbox Implementation Plan

This document outlines the complete architecture, security specifications, and stage-by-stage implementation plan for integrating a secure, full-featured Python IDE, sandboxed compiler, and interactive terminal into the existing Node.js/Express and React/Vite codebase running in GitHub Codespaces.

---

## Stage 1: System Architecture Overview

The system uses a decoupled architecture where the React frontend communicates with the Node.js backend via REST for file operations/batch execution and WebSockets for real-time interactive terminal sessions.

```text
+-----------------------------------------------------------------------------+
|                               Frontend (React + Vite)                       |
|  +--------------------+  +-------------------------+  +------------------+  |
|  |   File Explorer    |  |  Monaco Editor          |  |  Xterm.js PTY    |  |
|  |  (Tree / Tabs)     |  |  (Python LSP / Syn)     |  |  (Interactive)   |  |
|  +---------+----------+  +------------+------------+  +--------+---------+  |
+------------|--------------------------|------------------------|------------+
             | REST (Files / Projects)  | Batch Run (POST / SSE) | WebSocket (PTY)
+------------v--------------------------v------------------------v------------+
|                            Backend (Node.js / Express)                      |
|  +--------------------+  +-------------------------+  +------------------+  |
|  | Workspace Service  |  | Execution Controller    |  | Terminal Gateway |  |
|  | (CRUD disk/volume) |  | (Isolated runner)       |  | (node-pty/Docker)|  |
|  +---------+----------+  +------------+------------+  +--------+---------+  |
+------------|--------------------------|------------------------|------------+
             | Mounts / Ephemeral Files | Container Lifecycle    | Docker Socket
+------------v--------------------------v------------------------v------------+
|                          Sandboxing Layer (Docker / cgroups)                |
|  +-----------------------------------------------------------------------+  |
|  | Container: python:3.11-slim (User: sandbox, Non-root)                 |  |
|  | Limits: 256MB RAM, 0.5 CPU, 64 PIDs, no-new-privileges, Network: none |  |
|  | Mount: tmpfs (/tmp, /run), Read-Only rootfs, Ephemeral /workspace    |  |
|  +-----------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------+
```

---

## Stage 2: Sandboxing & Security Architecture

Running arbitrary user code requires strict, layered isolation.

1. **Codespaces Compatibility (Docker-outside-of-Docker / DooD):**
   * GitHub Codespaces provides access to the host Docker daemon via `/var/run/docker.sock`.
   * The backend orchestrates dynamic child containers via Dockerode.
2. **Container Security Flags:**
   * **Network Isolation:** `--network none` (prevents external data exfiltration, socket listeners, and DDOS).
   * **Resource Quotas:** `--memory=256m --memory-swap=256m --cpus=0.5 --pids-limit=64` (mitigates fork bombs and memory leaks).
   * **Filesystem Security:** `--read-only --tmpfs /tmp:rw,noexec,nosuid,size=64m`.
   * **Privilege Drop:** `--cap-drop ALL --security-opt=no-new-privileges:true -u 1000:1000`.
   * **Execution Watchdog:** Hard wall-clock timeout (e.g., 10-15 seconds) killing the container if stalled.

---

## Stage 3: Backend Implementation

### 3.1 Dependencies
Add the following to `backend/package.json`:
```json
{
  "dependencies": {
    "dockerode": "^4.0.2",
    "ws": "^8.18.0",
    "node-pty": "^1.0.2"
  }
}
```

### 3.2 Docker Sandbox Service (`backend/src/services/sandbox.service.js`)
Handles spawning ephemeral containers for batch runs and piping stdin/stdout/stderr.

```javascript
import Docker from 'dockerode';
import stream from 'stream';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const SANDBOX_IMAGE = 'python:3.11-slim';

export class SandboxService {
  static async runPythonCode({ code, stdin = '', timeoutMs = 10000 }) {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // Base64 encode code to safely inject without escaping issues
    const base64Script = Buffer.from(code).toString('base64');
    const runCmd = `echo "${base64Script}" | base64 -d | python3 -u -`;

    const container = await docker.createContainer({
      Image: SANDBOX_IMAGE,
      Cmd: ['/bin/sh', '-c', runCmd],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: true,
      StdinOnce: true,
      Tty: false,
      NetworkDisabled: true,
      HostConfig: {
        Memory: 256 * 1024 * 1024,
        MemorySwap: 256 * 1024 * 1024,
        NanoCpus: 500000000,
        PidsLimit: 64,
        Privileged: false,
        CapDrop: ['ALL'],
        ReadonlyRootfs: true,
        Tmpfs: { '/tmp': 'rw,noexec,nosuid,size=64m' },
        AutoRemove: true
      }
    });

    const execStream = await container.attach({
      stream: true, stdin: true, stdout: true, stderr: true
    });

    const outStream = new stream.PassThrough();
    const errStream = new stream.PassThrough();
    container.modem.demuxStream(execStream, outStream, errStream);

    outStream.on('data', (chunk) => { stdout += chunk.toString('utf8'); });
    errStream.on('data', (chunk) => { stderr += chunk.toString('utf8'); });

    await container.start();

    if (stdin) {
      execStream.write(stdin);
    }
    execStream.end();

    const timeout = setTimeout(async () => {
      timedOut = true;
      try { await container.kill(); } catch (_) {}
    }, timeoutMs);

    const status = await container.wait();
    clearTimeout(timeout);

    return {
      stdout: stdout.trimEnd(),
      stderr: stderr.trimEnd(),
      exitCode: status.StatusCode,
      timedOut
    };
  }
}
```

### 3.3 Interactive Terminal Gateway (`backend/src/services/terminal.service.js`)
Binds interactive PTY sessions via WebSockets.

```javascript
import WebSocket from 'ws';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export function initTerminalServer(server) {
  const wss = new WebSocket.Server({ noServer: true, path: '/ws/terminal' });

  wss.on('connection', async (ws, req) => {
    try {
      const container = await docker.createContainer({
        Image: 'python:3.11-slim',
        Tty: true,
        OpenStdin: true,
        StdinOnce: false,
        Cmd: ['/bin/bash'],
        NetworkDisabled: true,
        HostConfig: {
          Memory: 256 * 1024 * 1024,
          NanoCpus: 500000000,
          PidsLimit: 64,
          AutoRemove: true
        }
      });

      const execStream = await container.attach({
        stream: true, stdin: true, stdout: true, stderr: true, hijack: true
      });

      await container.start();

      execStream.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(chunk.toString('utf8'));
      });

      ws.on('message', (msg) => {
        const parsed = JSON.parse(msg);
        if (parsed.type === 'input') {
          execStream.write(parsed.data);
        } else if (parsed.type === 'resize') {
          container.resize({ h: parsed.rows, w: parsed.cols }).catch(() => {});
        }
      });

      ws.on('close', async () => {
        try { await container.kill(); } catch (_) {}
      });
    } catch (err) {
      ws.send(`\r\nError: ${err.message}\r\n`);
      ws.close();
    }
  });

  return wss;
}
```

---

## Stage 4: Frontend Implementation

### 4.1 Dependencies
Add the following to `frontend/package.json`:
```json
{
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "xterm": "^5.3.0",
    "xterm-addon-fit": "^0.8.0",
    "xterm-addon-web-links": "^0.9.0",
    "lucide-react": "^0.475.0"
  }
}
```

### 4.2 Terminal Component (`frontend/src/components/ide/Terminal.jsx`)

```jsx
import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function Terminal({ wsUrl }) {
  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);

  useEffect(() => {
    const term = new XTerm({
      cursorBlink: true,
      theme: { background: '#0d1117', foreground: '#c9d1d9', cursor: '#58a6ff' },
      fontFamily: 'JetBrains Mono, Menlo, monospace',
      fontSize: 13,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermInstance.current = term;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}${wsUrl}`);

    socket.onmessage = (event) => term.write(event.data);
    term.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'input', data }));
      }
    });

    const handleResize = () => {
      fitAddon.fit();
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.close();
      term.dispose();
    };
  }, [wsUrl]);

  return <div ref={terminalRef} className="h-full w-full bg-[#0d1117] p-2" />;
}
```

### 4.3 Editor Component (`frontend/src/components/ide/Editor.jsx`)

```jsx
import React from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ code, onChange, onRun }) {
  const handleEditorDidMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });
  };

  return (
    <MonacoEditor
      height="100%"
      language="python"
      theme="vs-dark"
      value={code}
      onChange={onChange}
      onMount={handleEditorDidMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        wordWrap: 'on',
      }}
    />
  );
}
```

---

## Stage 5: Agent Execution Workflow

1. **Codespaces Environment Verification:**
   * Verify access to `/var/run/docker.sock` within the dev container.
   * Run `docker pull python:3.11-slim` to pre-cache the execution image.
2. **Backend Construction:**
   * Install backend dependencies.
   * Create the sandbox and terminal services.
   * Mount the WebSocket upgrade handler inside `backend/server.js` using Node's `server.on('upgrade')`.
   * Register the `/api/v1/ide` POST routes in `backend/src/app.js`.
3. **Frontend Construction:**
   * Install frontend dependencies.
   * Create `Editor.jsx` and `Terminal.jsx` components.
   * Scaffold the `IDE.jsx` view unifying both components.
   * Update `frontend/vite.config.js` to proxy `/ws/terminal` with `ws: true`.
4. **End-to-End Verification:**
   * Run a standard Python script via the Editor (e.g., list comprehensions).
   * Verify the security watchdog by executing an infinite loop or `time.sleep(20)`.
   * Connect to the Interactive Terminal and run shell commands (`ls`, `pwd`, `python3`).