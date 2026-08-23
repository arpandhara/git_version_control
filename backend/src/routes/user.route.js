const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { checkUsernameLimiter } = require('../middlewares/rateLimit.middleware');
const validate = require('../middlewares/validate.middleware');
const { 
    checkUsernameSchema, 
    onboardingSchema, 
    updateProfileSchema 
} = require('../validations/user.validation');
const { 
    getMe,
    checkUsername, 
    updateOnboarding, 
    updateProfile 
} = require('../controllers/user.controller');

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/v1/users/check-username:
 *   get:
 *     summary: Check if a username is available
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Username to check
 *     responses:
 *       200:
 *         description: Availability status returned
 *       429:
 *         description: Too many requests
 */
router.get('/check-username', checkUsernameLimiter, validate(checkUsernameSchema), checkUsername);

/**
 * @swagger
 * /api/v1/users/onboarding:
 *   patch:
 *     summary: Submit initial onboarding profile data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
 *       409:
 *         description: Username already taken (returns suggestions)
 */
router.patch('/onboarding', protect, validate(onboardingSchema), updateOnboarding);

/**
 * @swagger
 * /api/v1/users/profile:
 *   patch:
 *     summary: Dynamically update user profile fields
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               gender:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               organization:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *               localTime:
 *                 type: string
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     platform:
 *                       type: string
 *                     url:
 *                       type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch('/profile', protect, validate(updateProfileSchema), updateProfile);

module.exports = router;
