const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');

/**
 * Registers a new user via local email/password authentication.
 * 
 * @async
 * @param {string} email - The user's email address.
 * @param {string} password - The user's plaintext password (will be hashed by pre-save hook).
 * @returns {Promise<Object>} The created Mongoose User document.
 * @throws {ApiError} (409) If a user with the given email already exists.
 */
const registerLocalUser = async (email, password) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, 'User with this email already exists');
    }

    const user = await User.create({ email, passwordHash: password });
    return user;
};

/**
 * Authenticates an existing user via local email/password authentication.
 * 
 * @async
 * @param {string} email - The user's email address.
 * @param {string} password - The user's plaintext password.
 * @returns {Promise<Object>} The authenticated Mongoose User document.
 * @throws {ApiError} (401) If the email is not found or the password doesn't match.
 */
const loginLocalUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    return user;
};

/**
 * Exchanges a Google OAuth 2.0 authorization code for access and ID tokens.
 * 
 * @async
 * @param {string} code - The authorization code returned by Google.
 * @param {string} redirectUri - The callback URL that was used to obtain the code.
 * @returns {Promise<Object>} The tokens payload from Google.
 * @throws {ApiError} (400) If the code exchange fails.
 */
const exchangeGoogleCodeForTokens = async (code, redirectUri) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new ApiError(400, 'Failed to exchange Google authorization code: ' + (errData.error_description || 'Unknown error'));
    }

    return response.json();
};

/**
 * Fetches the Google user's profile using their access token.
 * 
 * @async
 * @param {string} idToken - The ID token from Google (currently unused but good for future verification).
 * @param {string} accessToken - The access token from Google to authorize the fetch.
 * @returns {Promise<Object>} The user profile payload from Google.
 * @throws {ApiError} (400) If the profile fetch fails.
 */
const getGoogleUserProfile = async (idToken, accessToken) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new ApiError(400, 'Failed to fetch Google user profile');
    }

    return response.json();
};

/**
 * Orchestrates the full manual Google OAuth flow.
 * Exchanges the code, fetches the profile, and registers/logs in the user.
 * 
 * @async
 * @param {string} code - The authorization code returned by Google.
 * @param {string} redirectUri - The callback URL.
 * @returns {Promise<Object>} The Mongoose User document.
 */
const handleGoogleOAuth = async (code, redirectUri) => {
    const tokens = await exchangeGoogleCodeForTokens(code, redirectUri);
    const profile = await getGoogleUserProfile(tokens.id_token, tokens.access_token);

    let user = await User.findOne({ email: profile.email });

    if (!user) {
        // Register new user
        user = await User.create({
            email: profile.email,
            googleId: profile.id,
        });
    } else if (!user.googleId) {
        // Link existing local account to Google
        user.googleId = profile.id;
        await user.save();
    }

    return user;
};

module.exports = {
    registerLocalUser,
    loginLocalUser,
    handleGoogleOAuth,
};
