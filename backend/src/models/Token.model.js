const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['REFRESH_TOKEN', 'PERSONAL_ACCESS_TOKEN'],
            required: true,
        },
        tokenHash: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            // Descriptive name (e.g., "MacBook CLI") - Primarily used for PATs
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        lastUsedAt: {
            type: Date,
            // Tracked for PATs to enforce the "6 months of inactivity" expiration logic
        },
        isRevoked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// TTL index to automatically purge documents when they expire
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
