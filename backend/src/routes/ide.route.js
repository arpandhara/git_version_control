const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { protect, protectOptional } = require('../middlewares/auth.middleware');
const {
    getCodespaceInfo,
    loadCodespace,
    pushCodespace,
    closeCodespace,
    saveEnv,
    downloadExe,
    getFiles,
    getFileContent,
    createFileOrFolder,
    updateFileContent,
    deleteFileOrFolder,
    runCode,
    cleanupCodespaceWorkspace,
} = require('../controllers/ide.controller');

const router = express.Router();

// Apply optional auth so req.user is set when token is present
router.use(protectOptional);

// Rate limiter specifically for code execution inside sandbox container (max 20 runs per min per IP)
const runLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: 'Too many execution requests. Please wait a moment before running code again.' }
});

// Middleware to assign unique ephemeral guest workspace id so guest sessions do not overwrite each other
router.use((req, res, next) => {
    if (!req.user && !req.cookies?.guest_workspace_id && !req.headers['x-guest-workspace-id']) {
        const guestId = crypto.randomBytes(12).toString('hex');
        res.cookie('guest_workspace_id', guestId, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        req.cookies = req.cookies || {};
        req.cookies.guest_workspace_id = guestId;
    }
    next();
});

/**
 * @swagger
 * tags:
 *   name: IDE
 *   description: In-browser IDE, codespace management, file tree, and code execution endpoints
 */

/**
 * @swagger
 * /api/v1/ide/codespace-info:
 *   get:
 *     summary: Get metadata and permissions for the currently loaded repository
 *     tags: [IDE]
 *     responses:
 *       200:
 *         description: Codespace info retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/codespace-info', getCodespaceInfo);

/**
 * @swagger
 * /api/v1/ide/load-codespace:
 *   post:
 *     summary: Loads a specific git file or repository into the user's IDE sandbox
 *     tags: [IDE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [file, repo]
 *               owner:
 *                 type: string
 *               repo:
 *                 type: string
 *               hash:
 *                 type: string
 *               filename:
 *                 type: string
 *     responses:
 *       200:
 *         description: Codespace loaded successfully
 *       400:
 *         description: Bad request (missing required fields or invalid type)
 *       404:
 *         description: Blob or repository not found
 *       500:
 *         description: Internal server error
 */
router.post('/load-codespace', loadCodespace);

/**
 * @swagger
 * /api/v1/ide/push-codespace:
 *   post:
 *     summary: Commits and pushes changes made in Codespace back to the repository
 *     tags: [IDE]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - owner
 *               - repo
 *             properties:
 *               owner:
 *                 type: string
 *               repo:
 *                 type: string
 *               commitMessage:
 *                 type: string
 *                 default: Update from Codespace
 *     responses:
 *       200:
 *         description: Changes pushed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient push permissions)
 *       404:
 *         description: Repository not found
 *       500:
 *         description: Internal server error
 */
router.post('/push-codespace', pushCodespace);

/**
 * @swagger
 * /api/v1/ide/close-codespace:
 *   post:
 *     summary: Cleans up the user's workspace directory when closing the codespace
 *     tags: [IDE]
 *     responses:
 *       200:
 *         description: Codespace cleaned and closed successfully
 *       500:
 *         description: Internal server error
 */
router.post('/close-codespace', closeCodespace);

/**
 * @swagger
 * /api/v1/ide/save-env:
 *   post:
 *     summary: Manually snapshots the current Python packages (.local) to Cloudflare R2
 *     tags: [IDE]
 *     responses:
 *       200:
 *         description: Python packages snapshot saved successfully
 *       400:
 *         description: No repository loaded in codespace
 *       500:
 *         description: Internal server error
 */
router.post('/save-env', saveEnv);

/**
 * @swagger
 * /api/v1/ide/download-exe:
 *   get:
 *     summary: Download the latest rusty executable from Cloudflare R2
 *     tags: [IDE]
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [linux, windows]
 *         description: Target OS platform
 *       - in: query
 *         name: version
 *         schema:
 *           type: string
 *           default: latest
 *         description: Binary version tag
 *     responses:
 *       200:
 *         description: Presigned download URL returned
 *       500:
 *         description: Internal server error
 */
router.get('/download-exe', downloadExe);

/**
 * @swagger
 * /api/v1/ide/files:
 *   get:
 *     summary: Get the workspace file tree
 *     tags: [IDE]
 *     responses:
 *       200:
 *         description: Workspace file tree returned
 *       500:
 *         description: Internal server error
 */
router.get('/files', getFiles);

/**
 * @swagger
 * /api/v1/ide/files/content:
 *   get:
 *     summary: Get file content
 *     tags: [IDE]
 *     parameters:
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Relative file path within workspace
 *     responses:
 *       200:
 *         description: File content returned
 *       400:
 *         description: Path is required
 *       500:
 *         description: Internal server error
 */
router.get('/files/content', getFileContent);

/**
 * @swagger
 * /api/v1/ide/files:
 *   post:
 *     summary: Create a file or folder
 *     tags: [IDE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *             properties:
 *               path:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [file, folder]
 *     responses:
 *       200:
 *         description: File or folder created
 *       400:
 *         description: Path is required
 *       500:
 *         description: Internal server error
 */
router.post('/files', createFileOrFolder);

/**
 * @swagger
 * /api/v1/ide/files/content:
 *   put:
 *     summary: Update file content
 *     tags: [IDE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *             properties:
 *               path:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: File content updated
 *       400:
 *         description: Path is required
 *       500:
 *         description: Internal server error
 */
router.put('/files/content', updateFileContent);

/**
 * @swagger
 * /api/v1/ide/files:
 *   delete:
 *     summary: Delete a file or folder
 *     tags: [IDE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *             properties:
 *               path:
 *                 type: string
 *     responses:
 *       200:
 *         description: File or folder deleted
 *       400:
 *         description: Path is required
 *       500:
 *         description: Internal server error
 */
router.delete('/files', deleteFileOrFolder);

/**
 * @swagger
 * /api/v1/ide/run:
 *   post:
 *     summary: Execute Python code in the sandbox
 *     tags: [IDE]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 *               code:
 *                 type: string
 *               stdin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Execution result
 *       400:
 *         description: Either filePath or code is required
 *       500:
 *         description: Failed to run code in sandbox
 */
router.post('/run', protect, runLimiter, runCode);

module.exports = router;
module.exports.cleanupCodespaceWorkspace = cleanupCodespaceWorkspace;
