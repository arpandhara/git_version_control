const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
    let error = err;

    // Convert native Error to ApiError if it isn't one already
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, [], err.stack);
    }

    // Use winston to log the error properly
    if (error.statusCode >= 500) {
        logger.error(`[${req.method} ${req.url}] ${error.message}`, { stack: error.stack });
    } else {
        logger.warn(`[${req.method} ${req.url}] ${error.message}`);
    }

    const response = {
        success: error.success,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    };

    return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
