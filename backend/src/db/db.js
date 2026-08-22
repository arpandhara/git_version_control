const mongoose = require('mongoose');
const logger = require('../utils/logger.js');

const connectDb = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/git_project';
        await mongoose.connect(mongoURI);
        logger.info(`Successfully connected to MongoDB ✅`);
    } catch (error) {
        logger.error(`Error connecting to MongoDB ❌: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

module.exports = connectDb;
