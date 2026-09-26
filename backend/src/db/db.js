const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger.js');

// Set default DNS result order to IPv4 first to prevent IPv6 lookup delays on Windows/MongoDB Atlas
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const connectDb = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/git_project';
        await mongoose.connect(mongoURI, {
            family: 4,
            serverSelectionTimeoutMS: 10000,
        });
        logger.info(`Successfully connected to MongoDB ✅`);
    } catch (error) {
        logger.error(`Error connecting to MongoDB ❌: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

module.exports = connectDb;
