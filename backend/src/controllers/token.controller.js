const asyncHandler = require('../utils/asyncHandler');
const { generatePersonalAccessToken } = require('../services/token.service');
const { generateAndSendOtp, verifyOtp } = require('../services/otp.service');
const Token = require('../models/Token.model');
const ApiError = require('../utils/ApiError');

const requestOtp = asyncHandler(async (req, res) => {
    // req.user is set by the protect middleware
    await generateAndSendOtp(req.user, 'PAT_ACTION');
    
    res.status(200).json({
        success: true,
        message: 'Security code sent to your email.'
    });
});

const generatePAT = asyncHandler(async (req, res) => {
    const { name, otp } = req.body;
    
    // Step-Up Authentication Challenge
    if (!otp) throw new ApiError(400, 'Security code (OTP) is required to generate a PAT');
    await verifyOtp(req.user._id, otp, 'PAT_ACTION');

    const rawToken = await generatePersonalAccessToken(req.user._id, name);
    
    res.status(201).json({
        success: true,
        message: 'Personal Access Token generated successfully',
        data: {
            token: rawToken,
            warning: 'Copy this token now. You will not be able to see it again!'
        }
    });
});

const listPATs = asyncHandler(async (req, res) => {
    const tokens = await Token.find({ 
        userId: req.user._id, 
        type: 'PERSONAL_ACCESS_TOKEN',
        isRevoked: false
    }).select('-tokenHash'); // Do not send hashes to frontend

    res.status(200).json({
        success: true,
        data: tokens
    });
});

const revokePAT = asyncHandler(async (req, res) => {
    const { tokenId } = req.params;
    const { otp } = req.body;

    // Step-Up Authentication Challenge
    if (!otp) throw new ApiError(400, 'Security code (OTP) is required to revoke a PAT');
    await verifyOtp(req.user._id, otp, 'PAT_ACTION');

    const tokenDoc = await Token.findOne({ _id: tokenId, userId: req.user._id, type: 'PERSONAL_ACCESS_TOKEN' });
    
    if (!tokenDoc) {
        throw new ApiError(404, 'Token not found');
    }

    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    res.status(200).json({
        success: true,
        message: 'Personal Access Token revoked successfully'
    });
});

module.exports = {
    requestOtp,
    generatePAT,
    listPATs,
    revokePAT
};
