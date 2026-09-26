const { cloudinary } = require('../config/cloudinary.config');
const { FileService } = require('./file.service');
const fs = require('fs/promises');
const path = require('path');
const AdmZip = require('adm-zip');
const logger = require('../utils/logger');
const https = require('https');

class CloudStorageService {
    /**
     * Compresses the user's workspace and uploads it to Cloudinary.
     * @param {string} userId - The user's ID
     * @returns {Promise<string>} The Cloudinary secure_url of the zip file
     */
    static async backupWorkspace(userId) {
        const workspacePath = FileService.getSecurePath(userId);
        const zipPath = path.join(workspacePath, '..', `${userId}_backup.zip`);

        try {
            // 1. Zip the workspace using adm-zip
            const zip = new AdmZip();
            zip.addLocalFolder(workspacePath);
            zip.writeZip(zipPath);

            // 2. Upload to Cloudinary as a raw file
            const uploadResult = await cloudinary.uploader.upload(zipPath, {
                resource_type: 'raw',
                folder: 'workspaces',
                public_id: `workspace_${userId}`,
                overwrite: true
            });

            // 3. Clean up the zip file locally
            await fs.unlink(zipPath);
            
            logger.info(`Workspace for ${userId} backed up successfully to Cloudinary.`);
            return uploadResult.secure_url;
        } catch (error) {
            logger.error(`Failed to backup workspace for ${userId}: ${error.message}`);
            // Attempt to clean up temp zip if it failed halfway
            await fs.unlink(zipPath).catch(() => {});
            throw error;
        }
    }

    /**
     * Downloads the workspace zip from Cloudinary and extracts it into the user's workspace folder.
     * @param {string} userId - The user's ID
     * @param {string} zipUrl - The Cloudinary secure_url of the zip file
     */
    static async restoreWorkspace(userId, zipUrl) {
        const workspacePath = await FileService.ensureWorkspace(userId);
        const zipPath = path.join(workspacePath, '..', `${userId}_download.zip`);

        try {
            // 1. Download the zip file using https (avoids IPv6 fetch timeout issues on Windows)
            await new Promise((resolve, reject) => {
                const file = require('fs').createWriteStream(zipPath);
                https.get(zipUrl, (response) => {
                    if (response.statusCode >= 400) {
                        return reject(new Error(`Failed to download zip: HTTP ${response.statusCode}`));
                    }
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close((err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }).on('error', (err) => {
                    require('fs').unlink(zipPath, () => {});
                    reject(err);
                });
            });

            // 2. Clear out the existing workspace so it doesn't merge old deleted files
            const stat = await fs.stat(workspacePath).catch(() => null);
            if (stat) {
                await fs.rm(workspacePath, { recursive: true, force: true });
            }
            await fs.mkdir(workspacePath, { recursive: true });

            // 3. Extract the zip
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(workspacePath, true);

            // 4. Clean up the zip file
            await fs.unlink(zipPath);

            logger.info(`Workspace for ${userId} restored successfully from Cloudinary.`);
            return { success: true };
        } catch (error) {
            logger.error(`Failed to restore workspace for ${userId}: ${error.message}`);
            await fs.unlink(zipPath).catch(() => {});
            throw error;
        }
    }
}

module.exports = { CloudStorageService };
