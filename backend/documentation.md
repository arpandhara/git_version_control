# Backend Technical Documentation

## 1. API Endpoints Reference

### Authentication Endpoints (`/api/v1/auth`)

#### `POST /register`
- **Description:** Registers a new user via email and password.
- **Payload:** `{ "email": "user@example.com", "password": "securepassword" }`
- **Response (201):** Creates the user (with `isEmailVerified: false`) and triggers a 6-digit OTP to their email. Does *not* issue session tokens yet.

#### `POST /verify-email`
- **Description:** Verifies the 6-digit OTP sent during registration.
- **Payload:** `{ "email": "user@example.com", "otp": "123456" }`
- **Response (200):** Marks the email as verified, returns the user profile and Access Token. Sets Refresh Token cookie.

#### `POST /resend-verification`
- **Description:** Resends the registration OTP if the user hasn't verified yet.
- **Payload:** `{ "email": "user@example.com" }`
- **Response (200):** Generic success message.

#### `POST /login`
- **Description:** Authenticates an existing user via email and password. Fails if `isEmailVerified` is false.
- **Payload:** `{ "email": "user@example.com", "password": "securepassword" }`
- **Response (200):** Returns the user profile and Access Token. Sets Refresh Token cookie.

#### `POST /forgot-password`
- **Description:** Requests a password reset OTP.
- **Payload:** `{ "email": "user@example.com" }`
- **Response (200):** Generic success message (prevents email enumeration).

#### `POST /reset-password`
- **Description:** Resets a user's password using the OTP.
- **Payload:** `{ "email": "user@example.com", "otp": "123456", "newPassword": "newsecurepassword" }`
- **Response (200):** Resets the password and instantly rotates the user's `securitySalt`, revoking all active sessions globally.

#### `POST /google/callback`
- **Description:** Handles the manual OAuth 2.0 exchange from Google.
- **Payload:** `{ "code": "google_auth_code", "redirectUri": "callback_url" }`
- **Response (200):** Returns the user profile and Access Token. Sets Refresh Token cookie.

#### `POST /refresh`
- **Description:** Rotates the session by exchanging a valid Refresh Token cookie for a new Access Token.
- **Payload:** None (Requires `refreshToken` cookie).
- **Response (200):** Returns a new Access Token and issues a new Refresh Token cookie (Invalidates the old refresh token in DB).

#### `POST /cli/login`
- **Description:** Designed specifically for CLI clients. Authenticates a user using their email and a generated Personal Access Token (PAT).
- **Payload:** `{ "email": "user@example.com", "pat": "git_pat_randomhex" }`
- **Response (200):** Returns the Access Token, Refresh Token (in JSON payload), and user profile.

### Token Management Endpoints (`/api/v1/tokens`)
*Note: All endpoints here require a valid Bearer Access Token.*

#### `POST /request-otp`
- **Description:** Step-Up Authentication challenge. Requests an OTP required to generate or revoke PATs.
- **Payload:** None.
- **Response (200):** Sends an OTP to the authenticated user's email.

#### `POST /`
- **Description:** Generates a new Personal Access Token (PAT). Requires Step-Up Authentication.
- **Payload:** `{ "name": "Device Identifier", "otp": "123456" }`
- **Response (201):** Returns the raw PAT string exactly once.

#### `GET /`
- **Description:** Lists all active (non-revoked) PATs for the authenticated user.
- **Response (200):** Returns an array of token objects (excluding their secure hashes).

#### `DELETE /:tokenId`
- **Description:** Revokes a specific PAT by ID. Requires Step-Up Authentication.
- **Payload:** `{ "otp": "123456" }`
- **Response (200):** Success message.

---

## 2. Core Services & Functions

### `auth.service.js`
- `registerLocalUser(email, password)`: Checks for email collisions, creates a new `User` document, and triggers the pre-save hook for password hashing and Salt generation.
- `loginLocalUser(email, password)`: Looks up a user by email and compares the plaintext password against the stored bcrypt hash via `isPasswordCorrect`.
- `exchangeGoogleCodeForTokens(code, redirectUri)`: Sends a direct POST request to `oauth2.googleapis.com/token` to exchange an authorization code for Google tokens.
- `getGoogleUserProfile(idToken, accessToken)`: Fetches the user's profile from `googleapis.com/oauth2/v2/userinfo`.
- `handleGoogleOAuth(code, redirectUri)`: Orchestrates the Google login flow. Creates a new user if one doesn't exist, or links a Google ID to an existing local account.

### `otp.service.js` (New)
- `generateAndSendOtp(user, purpose)`: Uses `crypto.randomInt` to generate a 6-digit code. Hashes it with `bcryptjs`, saves it in the `VerificationCode` collection with a 15-minute TTL, and fires a `resend` email.
- `verifyOtp(userId, inputOtp, purpose)`: Securely retrieves and compares the provided OTP against the hash. Enforces a maximum of 3 failed attempts before permanently locking the OTP.

### `token.service.js`
- `getJwtSecret(userSalt)`: Combines the system-wide `JWT_PEPPER_SECRET` with the user's specific `securitySalt` and hashes them via `sha256` to create the JWT signing key.
- `generateAuthTokens(user)`: Generates a signed Access Token (15m expiry) and a cryptographically random Refresh Token string. Hashes and stores the Refresh Token in the DB.
- `generatePersonalAccessToken(userId, name)`: Generates a random `git_pat_` prefixed token, hashes it via `sha256`, stores the hash in the DB with a 6-month inactivity TTL, and returns the raw string.
- `verifyAccessToken(token, userSalt)`: Validates a provided JWT against the specific `salt + pepper` key. Throws an `ApiError` if invalid.

### `User.model.js` (Methods & Hooks)
- `pre('save')`: Auto-generates a 16-byte `securitySalt` for new users. Automatically hashes `passwordHash` if modified using bcryptjs.
- `isPasswordCorrect(password)`: Compares a plaintext password against the stored bcrypt hash.
- `invalidateAllSessions()`: Regenerates the `securitySalt`, immediately invalidating all active JWTs.

---

## 3. Middleware

- `auth.middleware.js > protect`: Extracts the Bearer token, decodes it to find the user, retrieves their `securitySalt` from the DB, and securely verifies the JWT signature.
- `error.middleware.js > errorHandler`: Intercepts thrown exceptions, casts them to `ApiError` format, logs them via Winston, and returns a standardized JSON error response.
- `validate.middleware.js > validate(schema)`: Generic middleware that uses Zod schemas to strictly parse and sanitize `req.body`, `req.query`, and `req.params`.
