const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

// Rate limiter specifically for the check-username endpoint
const checkUsernameLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 20, // Limit each IP to 20 requests per `window`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next) => {
        next(new ApiError(429, 'Too many username checks from this IP, please try again after a minute.'));
    }
});

module.exports = {
    checkUsernameLimiter
};
