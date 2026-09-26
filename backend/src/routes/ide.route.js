const express = require('express');
const { SandboxService } = require('../services/sandbox.service');
const { FileService } = require('../services/file.service');

const router = express.Router();

// Helper to determine workspace ID (for now, use 'default_workspace' if no user is authenticated)
const getWorkspaceId = (req) => {
    // If you integrate auth, you can do: return req.user?._id || 'guest';
    return 'default_workspace';
};

/**
 * @swagger
 * /api/v1/ide/files:
 *   get:
 *     summary: Get the workspace file tree
 */
router.get('/files', async (req, res) => {
    try {
        const workspaceId = getWorkspaceId(req);
        const tree = await FileService.getWorkspaceTree(workspaceId);
        res.json({ tree });
    } catch (error) {
        console.error('Error fetching file tree:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/ide/files/content:
 *   get:
 *     summary: Get file content
 */
router.get('/files/content', async (req, res) => {
    try {
        const workspaceId = getWorkspaceId(req);
        const { path } = req.query;
        if (!path) return res.status(400).json({ error: 'Path is required' });

        const content = await FileService.readFile(workspaceId, path);
        res.json({ content });
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/ide/files:
 *   post:
 *     summary: Create a file or folder
 */
router.post('/files', async (req, res) => {
    try {
        const workspaceId = getWorkspaceId(req);
        const { path, type } = req.body;
        if (!path) return res.status(400).json({ error: 'Path is required' });

        const result = await FileService.create(workspaceId, path, type);
        res.json(result);
    } catch (error) {
        console.error('Error creating file:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/ide/files/content:
 *   put:
 *     summary: Update file content
 */
router.put('/files/content', async (req, res) => {
    try {
        const workspaceId = getWorkspaceId(req);
        const { path, content } = req.body;
        if (!path) return res.status(400).json({ error: 'Path is required' });

        const result = await FileService.updateFile(workspaceId, path, content || '');
        res.json(result);
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/ide/files:
 *   delete:
 *     summary: Delete a file or folder
 */
router.delete('/files', async (req, res) => {
    try {
        const workspaceId = getWorkspaceId(req);
        const { path } = req.body;
        if (!path) return res.status(400).json({ error: 'Path is required' });

        const result = await FileService.delete(workspaceId, path);
        res.json(result);
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/ide/run:
 *   post:
 *     summary: Execute Python code in the sandbox
 */
router.post('/run', async (req, res) => {
    try {
        const workspaceId = getWorkspaceId(req);
        const { filePath, code, stdin } = req.body;
        
        let result;
        // If filePath is provided, we run the file from the workspace
        if (filePath) {
            // First, ensure any unsaved code changes in the editor are saved to the file before running
            if (code !== undefined) {
                await FileService.updateFile(workspaceId, filePath, code);
            }
            result = await SandboxService.runPythonFile({ workspaceId, filePath, stdin });
        } else if (code) {
            // Fallback for raw code execution (legacy behavior)
            result = await SandboxService.runPythonCode({ code, stdin });
        } else {
            return res.status(400).json({ error: 'Either filePath or code is required' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error running sandbox code:', error);
        res.status(500).json({ error: 'Failed to run code in sandbox', details: error.message });
    }
});

module.exports = router;
