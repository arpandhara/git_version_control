# Backend Progress

## Initial Setup
- [x] Initialized the Node.js backend project structure.
- [x] Installed core dependencies (`express`, `mongoose`, `dotenv`, `cors`, `helmet`, `cookie-parser`, `bcryptjs`, `jsonwebtoken`, `zod`, `multer`, `nodemailer`, `express-rate-limit`).
- [x] Configured `package.json` with project metadata and development scripts (`npm run dev`).

## Server & Process Management (`server.js`)
- [x] Implemented a robust entry point separating server initialization from the Express app.
- [x] Added graceful shutdown logic listening to `SIGINT` and `SIGTERM` to safely close the HTTP server and database connections.
- [x] Added safety timeouts to force shutdown if graceful shutdown hangs.
- [x] Set up unhandled exception and promise rejection catchers to prevent silent crashes.

## Express Application (`src/app.js`)
- [x] Configured global middlewares: `helmet` for security headers, `cors`, `cookie-parser`, and JSON/URL-encoded body parsers with strict size limits (`16kb`).
- [x] Established the base `/api/v1/auth` routing structure.
- [x] Integrated a global error-handling middleware structure at the end of the middleware chain.

## Database & Utilities
- [x] Created `src/db/db.js` to handle MongoDB connections using Mongoose.
- [x] Scaffolded boilerplate files for `auth.route.js` and `error.middleware.js` to establish the architecture.

## Professional Utilities & Error Handling
- [x] Integrated `winston` for robust, structured logging, replacing `console.log`.
- [x] Implemented a custom `ApiError` class for standardized error generation.
- [x] Refactored the global error middleware to log effectively and manage `ApiError` correctly.
- [x] Created an `asyncHandler` wrapper to eliminate repetitive `try/catch` blocks in async route controllers.

## Web & CLI Authentication Architecture
- [x] **Data Layer**: Designed `User` and `Token` models with `bcryptjs` password hashing and TTL indexes.
- [x] **Security Engine**: Implemented Salt & Pepper JWT signing using dynamic per-user salts stored in the DB.
- [x] **Web Flow**: Built `/login`, `/register`, and direct Google OAuth 2.0 exchange (`/google/callback`).
- [x] **Session Management**: Built a `/refresh` endpoint utilizing HTTP-only secure cookies and DB-tracked Refresh Tokens.
- [x] **CLI Compatibility**: Created a Personal Access Token (PAT) generation system (`/api/v1/tokens`) and the CLI authentication endpoint (`/api/v1/auth/cli/login`).
- [x] **Input Validation**: Hardened all endpoints with `zod` schemas to prevent injection/malformed payloads.

## Security Enhancements & Documentation
- [x] **Strict Cookie Security**: Migrated Access Token delivery to strict `HttpOnly`, `Secure` cookies for maximum XSS protection on web clients, while retaining `Bearer` header fallback for CLI tools.
- [x] **API Documentation**: Integrated `swagger-ui-express` and `swagger-jsdoc` to auto-generate interactive OpenAPI docs at `/api-docs`.
- [x] **Codebase Documentation**: Added comprehensive JSDoc comments to core authentication and token services for rich IDE intellisense.

## Two-Step Verification & OTP Engine
- [x] **Email Infrastructure**: Integrated the `resend` SDK and built `email.service.js` with professional HTML templates.
- [x] **OTP Management**: Designed `VerificationCode` schema with `bcryptjs` hashing, attempt limiting (rate-limiting), and MongoDB TTL expiration.
- [x] **Registration Gating**: Upgraded the registration flow to require OTP verification (`/verify-email`) before issuing session tokens.
- [x] **Secure Password Reset**: Built `/forgot-password` and `/reset-password` flows utilizing OTPs. Passwords are reset securely, and all global sessions are revoked instantly via `securitySalt` rotation.
- [x] **PAT Step-Up Authentication**: Gated sensitive token generation and revocation actions with an explicit OTP challenge (`/request-otp`).
- [x] **CLI PAT Refactor**: Architected the CLI flow to use Personal Access Tokens (PATs) directly as long-lived Bearer tokens (100-year expiration), securely hashing and verifying them in real-time via the `protect` middleware, while retaining `/cli/login` as a credential verifier.

## User Profiling System
- [x] **Database Extensions**: Safely extended the `User` schema with `name`, `username`, `bio`, `gender`, `profilePicture`, `organization`, `location`, `localTime`, and `socialLinks`. Configured `username` to be unique, lowercase, and `sparse`.
- [x] **Validation**: Implemented strict `zod` schemas (`user.validation.js`) to sanitize and validate payloads, including explicit enum checks for gender and specific social platforms (`insta`, `youtube`, `linkedin`), and URL constraints. Fix applied to correctly wrap schemas in `z.object()` for middleware compatibility.
- [x] **API Logic**: Built `user.controller.js` to handle real-time username availability checks (`/check-username`), initial onboarding (`/onboarding`), and dynamic profile updates (`/profile`).
- [x] **Conflict Resolution**: Implemented mathematical fallback logic during onboarding to generate 3 random username suggestions (e.g., `username1234`) when a duplicate key `409 Conflict` occurs.
- [x] **Routing Integration**: Mounted the new user RESTful resource securely behind JWT `protect` middleware at `/api/v1/users` in `app.js`.
- [x] **Security / Rate Limiting**: Added `checkUsernameLimiter` using `express-rate-limit` (max 20 requests per minute per IP) to the `GET /check-username` endpoint to prevent automated enumeration and DDoS attacks against the database index.
- [x] **Current User Endpoint**: Built a `GET /api/v1/users/me` endpoint to expose the authenticated user's profile data to the frontend for robust session validation.
- [x] **Social Login Guard**: Enhanced the `forgotPassword` controller to intercept reset requests for accounts registered exclusively via Google (`googleId` exists but no `passwordHash`) and reject them with a descriptive 400 API error, avoiding dead-end OTP loops.
