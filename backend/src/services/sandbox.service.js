const Docker = require('dockerode');

const isWindows = process.platform === 'win32';
const socketPath = isWindows ? '//./pipe/docker_engine' : '/var/run/docker.sock';
const docker = new Docker({ socketPath });

const SANDBOX_IMAGE = 'python:3.11-slim';

/**
 * Parses a raw Docker multiplexed log buffer into separate stdout and stderr strings.
 * Docker prepends an 8-byte header to each chunk: [stream_type, 0, 0, 0, size(4 bytes)].
 *
 * @param {Buffer} buffer - The raw Docker log buffer.
 * @returns {{ stdout: string, stderr: string }}
 */
function parseDemuxedBuffer(buffer) {
    let stdout = '';
    let stderr = '';
    let i = 0;
    while (i < buffer.length) {
        if (i + 8 > buffer.length) break;
        const streamType = buffer[i];
        const size = buffer.readUInt32BE(i + 4);
        if (i + 8 + size > buffer.length) break;
        const chunk = buffer.slice(i + 8, i + 8 + size).toString('utf8');
        if (streamType === 1) stdout += chunk;
        else if (streamType === 2) stderr += chunk;
        i += 8 + size;
    }
    return { stdout, stderr };
}

/**
 * Service to handle secure execution of untrusted Python code
 * using ephemeral Docker containers with strict resource limits.
 * @class SandboxService
 */
class SandboxService {
    /**
     * Executes Python code inside a sandboxed Docker container.
     * Uses the Docker Logs API for reliable output capture on Windows Docker Desktop.
     *
     * @param {Object} options - The execution options.
     * @param {string} options.code - The Python source code to execute.
     * @param {string} [options.stdin=''] - Optional standard input to provide to the script.
     * @param {number} [options.timeoutMs=10000] - Execution timeout in milliseconds.
     * @returns {Promise<{stdout: string, stderr: string, exitCode: number, timedOut: boolean}>} The execution result.
     */
    static async runPythonCode({ code, stdin = '', timeoutMs = 10000 }) {
        let timedOut = false;
        let container;

        try {
            // Base64 encode code to safely inject without escaping issues in shell
            const base64Script = Buffer.from(code).toString('base64');
            const runCmd = `echo "${base64Script}" | base64 -d | python3 -u -`;

            container = await docker.createContainer({
                Image: SANDBOX_IMAGE,
                Cmd: ['/bin/sh', '-c', runCmd],
                AttachStdin: !!stdin,
                AttachStdout: true,
                AttachStderr: true,
                OpenStdin: !!stdin,
                StdinOnce: true,
                Tty: false,
                NetworkDisabled: true, // Prevent external network access
                HostConfig: {
                    Memory: 256 * 1024 * 1024, // 256MB RAM limit
                    MemorySwap: 256 * 1024 * 1024,
                    NanoCpus: 500000000, // 0.5 CPU limit
                    PidsLimit: 64, // Prevent fork bombs
                    Privileged: false,
                    CapDrop: ['ALL'], // Drop all Linux capabilities
                    ReadonlyRootfs: true, // Prevent writing to the filesystem
                    Tmpfs: { '/tmp': 'rw,noexec,nosuid,size=64m' }, // Allow temp writes only
                    AutoRemove: false // Keep container so we can fetch logs after exit
                }
            });

            // If stdin is provided, pipe it via the attach stream before starting
            if (stdin) {
                const stdinStream = await container.attach({ stream: true, stdin: true, stdout: false, stderr: false });
                await container.start();
                stdinStream.write(stdin);
                stdinStream.end();
            } else {
                await container.start();
            }

            // Setup watchdog timeout to kill container if it runs too long
            const timeout = setTimeout(async () => {
                timedOut = true;
                try { await container.kill(); } catch (_) { /* ignore kill errors */ }
            }, timeoutMs);

            // Wait for the container process to exit
            const status = await container.wait();
            clearTimeout(timeout);

            // Fetch logs using the Docker Logs API — returns a multiplexed Buffer
            // This is more reliable than the attach+demux approach on Windows Docker Desktop
            const logBuffer = await container.logs({ stdout: true, stderr: true, follow: false });
            const { stdout, stderr } = parseDemuxedBuffer(logBuffer);

            return {
                stdout: stdout.trimEnd(),
                stderr: stderr.trimEnd(),
                exitCode: status.StatusCode,
                timedOut
            };
        } finally {
            // Always cleanup the container, even on error
            if (container) {
                try { await container.remove({ force: true }); } catch (err) { console.error('Failed to cleanup sandbox container:', err); }
            }
        }
    }

    /**
     * Executes a specific Python file from the user's workspace by mounting the workspace directory into the container.
     *
     * @param {Object} options
     * @param {string} options.workspaceId - The ID of the user's workspace.
     * @param {string} options.filePath - The relative path to the file to run.
     * @param {string} [options.stdin=''] - Optional standard input.
     * @param {number} [options.timeoutMs=10000] - Execution timeout in milliseconds.
     */
    static async runPythonFile({ workspaceId, filePath, stdin = '', timeoutMs = 10000 }) {
        let timedOut = false;
        let container;

        try {
            const { FileService } = require('./file.service');
            const hostWorkspacePath = FileService.getSecurePath(workspaceId);
            
            // Format for Windows/Linux Docker mount
            const bindPath = `${hostWorkspacePath}:/workspace`;

            container = await docker.createContainer({
                Image: SANDBOX_IMAGE,
                Cmd: ['python3', '-u', filePath],
                WorkingDir: '/workspace',
                AttachStdin: !!stdin,
                AttachStdout: true,
                AttachStderr: true,
                OpenStdin: !!stdin,
                StdinOnce: true,
                Tty: false,
                NetworkDisabled: false,
                Env: [
                  'PIP_USER=1',
                  'PYTHONUSERBASE=/workspace/.local',
                  'PATH=/workspace/.local/bin:/usr/local/bin:/usr/local/sbin:/usr/sbin:/usr/bin:/sbin:/bin'
                ],
                HostConfig: {
                    Binds: [bindPath],
                    Memory: 256 * 1024 * 1024,
                    MemorySwap: 256 * 1024 * 1024,
                    NanoCpus: 500000000,
                    PidsLimit: 64,
                    Privileged: false,
                    CapDrop: ['ALL'],
                    ReadonlyRootfs: false, // Disabling to avoid permission issues writing to __pycache__ or similar in workspace
                    AutoRemove: false 
                }
            });

            if (stdin) {
                const stdinStream = await container.attach({ stream: true, stdin: true, stdout: false, stderr: false });
                await container.start();
                stdinStream.write(stdin);
                stdinStream.end();
            } else {
                await container.start();
            }

            const timeout = setTimeout(async () => {
                timedOut = true;
                try { await container.kill(); } catch (_) {}
            }, timeoutMs);

            const status = await container.wait();
            clearTimeout(timeout);

            const logBuffer = await container.logs({ stdout: true, stderr: true, follow: false });
            const { stdout, stderr } = parseDemuxedBuffer(logBuffer);

            return {
                stdout: stdout.trimEnd(),
                stderr: stderr.trimEnd(),
                exitCode: status.StatusCode,
                timedOut
            };
        } finally {
            if (container) {
                try { await container.remove({ force: true }); } catch (err) { console.error('Failed to cleanup sandbox container:', err); }
            }
        }
    }
}

module.exports = { SandboxService };
