const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');

const getMe = asyncHandler(async (req, res) => {
    // req.user is populated by protect middleware
    const user = await User.findById(req.user._id).select('-passwordHash -securitySalt');
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    res.status(200).json({
        success: true,
        data: { user }
    });
});

const checkUsername = asyncHandler(async (req, res) => {
    const { q } = req.query;
    
    // Quick index lookup
    const user = await User.findOne({ username: q.toLowerCase() }).select('_id');
    
    let suggestions = [];
    if (user) {
        const base = q.toLowerCase();
        suggestions = [
            `${base}${Math.floor(1000 + Math.random() * 9000)}`,
            `${base}${Math.floor(1000 + Math.random() * 9000)}`,
            `${base}${Math.floor(1000 + Math.random() * 9000)}`
        ];
    }

    res.status(200).json({
        success: true,
        data: {
            available: !user,
            requestedUsername: q,
            suggestions
        }
    });
});

const updateOnboarding = asyncHandler(async (req, res, next) => {
    const { name, username, bio } = req.body;
    
    // req.user should be populated by the protect middleware
    const userId = req.user._id;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name,
                    username: username.toLowerCase(),
                    bio
                }
            },
            { returnDocument: 'after', runValidators: true }
        ).select('-passwordHash -securitySalt');

        if (!updatedUser) {
            throw new ApiError(404, 'User not found');
        }

        res.status(200).json({
            success: true,
            message: 'Onboarding completed successfully',
            data: { user: updatedUser }
        });
    } catch (error) {
        // Handle MongoDB duplicate key error for username
        if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
            // Generate 3 suggestions using the requested username + a random 4 digit number
            const base = username.toLowerCase();
            const suggestions = [
                `${base}${Math.floor(1000 + Math.random() * 9000)}`,
                `${base}${Math.floor(1000 + Math.random() * 9000)}`,
                `${base}${Math.floor(1000 + Math.random() * 9000)}`
            ];
            
            return next(new ApiError(409, 'Username is already taken', [], { suggestions }));
        }
        
        next(error);
    }
});

const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    // Explicitly destructure allowed fields to prevent overwriting protected fields like _id, email, password
    const {
        name,
        username,
        bio,
        gender,
        profilePicture,
        organization,
        location,
        localTime,
        socialLinks
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username.toLowerCase();
    if (bio !== undefined) updateData.bio = bio;
    if (gender !== undefined) updateData.gender = gender;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (organization !== undefined) updateData.organization = organization;
    if (location !== undefined) updateData.location = location;
    if (localTime !== undefined) updateData.localTime = localTime;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        ).select('-passwordHash -securitySalt');

        if (!updatedUser) {
            throw new ApiError(404, 'User not found');
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: updatedUser }
        });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
            throw new ApiError(409, 'Username is already taken');
        }
        throw error;
    }
});

const uploadProfilePhoto = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No file provided');
    }

    const userId = req.user._id;
    const profilePictureUrl = req.file.path; // Multer-storage-cloudinary places the URL in req.file.path

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { profilePicture: profilePictureUrl } },
        { returnDocument: 'after', runValidators: true }
    ).select('-passwordHash -securitySalt');

    if (!updatedUser) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        data: { user: updatedUser }
    });
});

const updateDashboardCard = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { avatarKey, cardColor } = req.body;

    const updateData = {};
    if (avatarKey !== undefined) updateData['dashboardCard.avatarKey'] = avatarKey;
    if (cardColor !== undefined) updateData['dashboardCard.cardColor'] = cardColor;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { returnDocument: 'after' }
    ).select('-passwordHash -securitySalt');

    if (!updatedUser) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
        success: true,
        message: 'Dashboard card updated successfully',
        data: { user: updatedUser },
    });
});

module.exports = {
    getMe,
    checkUsername,
    updateOnboarding,
    updateProfile,
    uploadProfilePhoto,
    updateDashboardCard,
};
