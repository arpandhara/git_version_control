# Task: Backend Implementation for User Onboarding & Profile Management

## 🎯 Objective
Implement the necessary backend infrastructure to support a progressive user profiling system. This includes an initial onboarding endpoint (capturing core identity information), a live username validation endpoint, and a comprehensive profile editing endpoint (allowing users to populate extended details over time).

## 🗄️ 1. Database Schema Updates (`User.model.js`)
Update the existing User schema to accommodate the new profile fields. Ensure appropriate default values and validation rules are applied.

*   **Required Core Fields:**
    *   `name`: String (Required)
    *   `username`: String (Required, Unique, Lowercase Index)
    *   `email`: String (Required, Unique - *already exists*)
*   **Optional Profile Fields (Nullable/Default Empty):**
    *   `bio` (Description): String (Max length: ~500 chars)
    *   `gender`: String (Enum: e.g., 'Male', 'Female', 'Non-binary', 'Prefer not to say')
    *   `profilePicture`: String (URL to cloud storage, e.g., AWS S3/Cloudinary)
    *   `organization`: String
    *   `location`: Object containing:
        *   `city`: String
        *   `state`: String
        *   `country`: String
    *   `localTime`: String (Timezone identifier, e.g., 'UTC+05:30' or 'Asia/Kolkata')
    *   `socialLinks`: Array of Objects or nested Object (e.g., `{ platform: String, url: String }` for LinkedIn, GitHub, Instagram, etc.)

## 🔗 2. API Endpoints Implementation

### A. Live Username Check Endpoint
**Route:** `GET /api/users/check-username?q=requestedName`
*   **Purpose:** To provide real-time feedback on username availability during the frontend form fill.
*   **Auth:** Requires valid JWT.
*   **Behavior:** 
    *   Performs a fast `findOne` query against the database index.
    *   Returns `{ available: boolean }` allowing the frontend to immediately show a success checkmark or failure warning.

### B. Onboarding Endpoint
**Route:** `PATCH /api/users/onboarding`
*   **Purpose:** To capture the initial set of data immediately following account creation. 
*   **Auth:** Requires valid JWT (User must be logged in).
*   **Accepted Payload:**
    *   `name` (Required)
    *   `username` (Required)
    *   `bio` (Optional)
*   **Behavior:** 
    *   Updates the existing user record.
    *   **Duplicate Handling Fallback:** Catches duplicate key errors (MongoDB code `11000`) if a race condition occurs or the frontend check is bypassed. Returns an HTTP `409 Conflict` status along with an array of available `suggestions` (e.g., appending random numbers to the requested string).
    *   *Note:* The PAT (Personal Access Token) generation step will be handled by the frontend calling the *existing* PAT endpoint sequentially after this onboarding request succeeds.

### C. Edit Profile Endpoint
**Route:** `PATCH /api/users/profile`
*   **Purpose:** To allow users to update any of their profile fields at a later time.
*   **Auth:** Requires valid JWT.
*   **Accepted Payload (All Optional):**
    *   `name`, `username`, `bio`, `gender`, `profilePicture`, `organization`, `location`, `localTime`, `socialLinks`.
*   **Behavior:**
    *   Dynamically updates only the fields provided in the request body.
    *   Ensures users cannot overwrite protected fields (like `_id`, `email`, or `password` through this specific endpoint).

## 🛡️ 3. Validation & Middleware (`auth.validation.js`)
*   **Zod Schemas:** Create strict Zod validation schemas for all endpoints to sanitize and parse incoming data.
*   **Username Constraints:** Ensure the username contains no spaces, special characters (except underscores/dashes), and meets minimum/maximum length requirements.
*   **URL Validation:** Ensure `profilePicture` and `socialLinks` values are valid URLs to prevent XSS or broken links.

## 🚀 4. Next Steps & Integration
*   [ ] Update `User.model.js` with the new fields and unique lowercase index on `username`.
*   [ ] Write Zod validation schemas for the new payload structures.
*   [ ] Implement controllers for `checkUsername`, `updateOnboarding`, and `updateProfile`.
*   [ ] Wire up the routes in `auth.route.js` (or a dedicated `user.route.js`).
*   [ ] Test endpoints via Postman or Swagger to verify constraints and duplicate username handling logic (including the 409 conflict suggestions).