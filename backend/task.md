# Task: Two-Step Email Verification Engine (Resend) & Security Hardening

## 1. Project Context & Current Progress
The core backend architecture for the custom Version Control System (VCS) is built using Express, Node.js, MongoDB (Mongoose), and standard REST principles. Stateless JWTs (Salt & Pepper signature), direct Google OAuth 2.0, refresh token rotations, and CLI PAT endpoints are already implemented.

### Completed Milestones
- [x] Server initialization, error handling (`ApiError`, `asyncHandler`), Winston logging.
- [x] Security headers (`helmet`), strict CORS, body limits, cookie parser.
- [x] User and Token schemas with `bcryptjs` hashing.
- [x] Salt & Pepper JWT signing with user-specific dynamic DB salts.
- [x] Local auth (`/register`, `/login`) and direct Google OAuth 2.0 (`/google/callback`).
- [x] Session refresh endpoints with HTTP-only cookies and DB revocation tracking.
- [x] Personal Access Token (PAT) generation and `/api/v1/auth/cli/login` endpoint.
- [x] OpenAPI / Swagger documentation (`/api-docs`) and JSDoc annotations.

---

## 2. New Scope: Two-Step Email Verification & Action Guarding
We are integrating **Resend** as the third-party transactional email provider. A 6-digit OTP (One-Time Password) challenge must gate the following critical actions:
1. **User Registration:** Initial account activation requires verifying the user's email via OTP.
2. **Password Reset:** Resetting a forgotten password requires a valid verification OTP.
3. **PAT Management (Step-Up Authentication):** Creating, viewing, or revoking Personal Access Tokens requires a verified OTP challenge within a strict time window to prevent unauthorized token minting.

---

## 3. Security Architecture for OTPs

### A. Generation & Storage Standards
- **Format:** 6-digit numeric string generated via `crypto.randomInt(100000, 999999).toString()`.
- **Hashing:** OTPs must **never** be stored in plaintext. Hash the OTP using `bcryptjs` before persisting it to the database.
- **Expiration / TTL:** OTP records must expire after **10 to 15 minutes**. Use MongoDB TTL indexes (`expireAfterSeconds: 0`) to ensure automatic document cleanup.
- **Attempt Limits & Rate Limiting:** Enforce a maximum of 3 invalid verification attempts per OTP. Lock or invalidate the OTP immediately upon exceeding attempts.
- **Single-Use Invalidation:** Immediately delete or mark the OTP as `used: true` upon successful verification to prevent replay attacks.

### B. Database Schema: `VerificationCode`
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  codeHash: { type: String, required: true },
  purpose: { 
    type: String, 
    enum: ['REGISTRATION_VERIFY', 'PASSWORD_RESET', 'PAT_ACTION'], 
    required: true 
  },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  isUsed: { type: Boolean, default: false }
}
```

---

## 4. Execution Tasks for the AI Agent

### Phase 1: Email Infrastructure Setup
- [x] Install the official Resend SDK: `npm install resend`.
- [x] Create `src/config/email.config.js` to initialize and export the Resend client using `RESEND_API_KEY`.
- [x] Create `src/services/email.service.js` containing reusable email dispatch functions:
  - `sendVerificationEmail(toEmail, otpCode)`
  - `sendPasswordResetEmail(toEmail, otpCode)`
  - `sendPatSecurityCodeEmail(toEmail, otpCode)`
- [x] Design clean, responsive HTML email templates with clear branding, security advisories, and the formatted 6-digit code.

### Phase 2: Verification Code Management
- [x] Create `src/models/verificationCode.model.js` with the TTL index and schema defined above.
- [x] Create `src/services/otp.service.js`:
  - `generateAndSendOtp(user, purpose)`: Generates crypto-safe 6-digit code, hashes it with bcrypt, saves to DB, and triggers `email.service.js`.
  - `verifyOtp(userId, inputOtp, purpose)`: Validates code hash, checks expiration/usage, increments attempt counters, and invalidates the token upon success.

### Phase 3: Auth Route Integrations

#### 1. Registration Flow (`/api/v1/auth/register` & `/verify-email`)
- [x] Update `register` controller: create user with `isEmailVerified: false`, generate `REGISTRATION_VERIFY` OTP, and dispatch verification email.
- [x] Create `POST /api/v1/auth/verify-email`: validates the 6-digit code, marks `isEmailVerified: true`, and issues initial session tokens.
- [x] Create `POST /api/v1/auth/resend-verification`: rate-limited endpoint to resend a new OTP.

#### 2. Password Reset Flow (`/forgot-password` & `/reset-password`)
- [x] Create `POST /api/v1/auth/forgot-password`: generates `PASSWORD_RESET` OTP if the email exists (returns generic 200 response to prevent email enumeration).
- [x] Create `POST /api/v1/auth/reset-password`: takes `email`, `otp`, and `newPassword`. Verifies OTP, updates password hash, rotates `securitySalt` (invalidating all active JWTs), and confirms success.

#### 3. PAT Step-Up Verification (`/api/v1/tokens`)
- [x] Create `POST /api/v1/tokens/request-otp`: triggers a `PAT_ACTION` OTP sent to the logged-in user's email.
- [x] Update `POST /api/v1/tokens/generate`: require an `otp` in the request body (or a short-lived step-up verification token). Reject token creation if OTP is missing or invalid.
- [x] Update `DELETE /api/v1/tokens/:tokenId`: require OTP validation before revoking sensitive production PATs.

---

## 5. Required Environment Variables

Add the following variables to `.env`:

```env
# RESEND EMAIL SERVICE
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM="VCS Auth <onboarding@resend.dev>" # Use your verified domain once configured

# OTP CONFIGURATION
OTP_EXPIRATION_MINUTES=15