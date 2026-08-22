# Backend Improvements & Critiques

This document critiques the current backend implementation from a security and professionalism standpoint. Improvements should be checked off in the tracker below. Once an improvement is marked as done, it should also be logged into `progress.md`.

## 🛡️ Security Critiques
- **CORS Configuration**: Currently, `CORS_ORIGIN` falls back to `'*'` if not provided in the environment. This is too permissive and risky for a production environment. 
  - *Improvement*: Enforce strict origin whitelists and throw an error or default to a safe internal domain if no origin is defined in production.
- **Rate Limiting**: The `express-rate-limit` package is installed but currently not implemented in the minimal `app.js`. 
  - *Improvement*: Implement global or route-specific rate limiting to prevent brute-force attacks (especially on auth routes) and DDoS.
- **Environment Validation**: Environment variables are read directly without validation.
  - *Improvement*: Validate all environment variables at startup using `zod` to fail fast if critical secrets (like JWT secrets or database URIs) are missing.

## 🏗️ Professionalism & Architecture
- **Logging**: The application currently uses `console.log` and `console.error`. While fine for basic debugging, this is hard to parse and manage in production.
  - *Improvement*: Integrate a professional structured logger like `winston` or `pino` for better log management, formatting, log rotation, and severity levels.
- **Error Handling Architecture**: The global error handler relies on basic error object properties. 
  - *Improvement*: Create a custom `AppError` class extending the native `Error` class to clearly distinguish between trusted operational errors (e.g., validation failed) and unknown programming bugs.
- **Hardcoded Fallbacks**: The DB connection falls back to a local MongoDB URI in the code (`mongodb://localhost:27017/git_project`). 
  - *Improvement*: Remove hardcoded sensitive fallbacks. The application should refuse to boot if a database URI isn't explicitly provided.

---

## ✅ Task Tracker (Done / Not Done)

- [ ] **SEC-01**: Restrict CORS origin strictly to trusted domains.
- [ ] **SEC-02**: Implement API rate limiting using `express-rate-limit`.
- [ ] **SEC-03**: Implement environment variable validation with `zod` at startup.
- [x] **PRO-01**: Replace `console.log` with a structured logger (`winston` or `pino`).
- [x] **PRO-02**: Implement a custom `AppError` utility class for standardized error generation.
- [ ] **PRO-03**: Remove local database URI fallbacks in `db.js`.
