const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters long'),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

const cliLoginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        pat: z.string().startsWith('git_pat_', 'Invalid Personal Access Token format'),
    }),
});

const generatePatSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Token name is required').max(50, 'Token name is too long'),
        otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
    }),
});

const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
    }),
});

const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    }),
});

const resetPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
    cliLoginSchema,
    generatePatSchema,
    verifyOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};
