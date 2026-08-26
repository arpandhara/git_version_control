const { z } = require('zod');

// Schema for GET /api/v1/users/check-username?q=
const checkUsernameSchema = z.object({
    query: z.object({
        q: z.string()
            .min(3, 'Username must be at least 3 characters')
            .max(30, 'Username cannot exceed 30 characters')
            .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and dashes')
    }),
});

// Schema for PATCH /api/v1/users/onboarding
const onboardingSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
        username: z.string()
            .min(3, 'Username must be at least 3 characters')
            .max(30, 'Username cannot exceed 30 characters')
            .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and dashes')
            .toLowerCase(),
        bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    }),
});

// Schema for PATCH /api/v1/users/profile
const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name cannot be empty').max(100, 'Name cannot exceed 100 characters').optional(),
        username: z.string()
            .min(3, 'Username must be at least 3 characters')
            .max(30, 'Username cannot exceed 30 characters')
            .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and dashes')
            .toLowerCase()
            .optional(),
        bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
        gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say']).optional(),
        profilePicture: z.string().url('Invalid URL for profile picture').optional(),
        organization: z.string().max(100, 'Organization name cannot exceed 100 characters').optional(),
        location: z.object({
            city: z.string().optional(),
            state: z.string().optional(),
            country: z.string().optional(),
        }).optional(),
        localTime: z.string().optional(),
        socialLinks: z.array(
            z.object({
                platform: z.enum(['insta', 'youtube', 'linkedin']),
                url: z.string().url('Invalid URL for social link'),
            })
        ).optional(),
    }),
});

// Schema for PATCH /api/v1/users/dashboard-card
const updateDashboardCardSchema = z.object({
    body: z.object({
        avatarKey: z.enum([
            'boyAvatar1', 'boyAvatar2', 'boyAvatar3',
            'girlAvatar1', 'girlAvatar2', 'girlAvatar3',
        ]).optional(),
        cardColor: z
            .string()
            .regex(/^#[0-9a-fA-F]{6}$/, 'cardColor must be a valid 6-digit hex color')
            .optional(),
    }),
});

module.exports = {
    checkUsernameSchema,
    onboardingSchema,
    updateProfileSchema,
    updateDashboardCardSchema,
};
