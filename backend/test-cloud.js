require('dotenv').config();
const { CloudStorageService } = require('./src/services/cloudStorage.service');
const fs = require('fs/promises');
const path = require('path');

(async () => {
    try {
        const fakeUserId = 'fake_user_123';
        const workspacePath = path.join(__dirname, 'workspace_data', fakeUserId);

        console.log('1. Setting up a temporary workspace...');
        await fs.mkdir(workspacePath, { recursive: true });
        await fs.writeFile(path.join(workspacePath, 'hello.txt'), 'This file was restored from Cloudinary!');

        console.log('\n2. Zipping and Uploading workspace to Cloudinary...');
        const zipUrl = await CloudStorageService.backupWorkspace(fakeUserId);
        console.log('✅ Upload Success! Zip File URL:', zipUrl);

        console.log('\n3. Deleting workspace from local hard drive entirely...');
        await fs.rm(workspacePath, { recursive: true, force: true });
        console.log('🗑️  Workspace deleted locally.');

        console.log('\n4. Restoring workspace from Cloudinary URL...');
        await CloudStorageService.restoreWorkspace(fakeUserId, zipUrl);
        
        // Verify it came back!
        const restoredContent = await fs.readFile(path.join(workspacePath, 'hello.txt'), 'utf8');
        console.log('✅ Restore Success! The file was retrieved from the cloud and says:', restoredContent);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
})();
