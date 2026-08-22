const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        // Zod throws an error object that contains either .errors or .issues
        const zodErrors = error.errors || error.issues;
        
        if (zodErrors && Array.isArray(zodErrors)) {
            const errors = zodErrors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return next(new ApiError(400, 'Validation Error', errors));
        }
        
        // If it's not a Zod error, pass it down to the global error handler
        next(error);
    }
};

module.exports = validate;
