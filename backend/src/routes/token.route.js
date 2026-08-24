const express = require('express');
const validate = require('../middlewares/validate.middleware');
const { generatePatSchema } = require('../validations/auth.validation');
const { requestOtp, generatePAT, listPATs, revokePAT, checkTokenName } = require('../controllers/token.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect); 

router.get('/check-name', checkTokenName);

/**
 * @swagger
 * /api/v1/tokens/request-otp:
 *   post:
 *     summary: Request an OTP for PAT generation/revocation
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security code sent to your email
 */
router.post('/request-otp', requestOtp);

/**
 * @swagger
 * /api/v1/tokens:
 *   post:
 *     summary: Generate a Personal Access Token (PAT)
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       201:
 *         description: Returns the raw PAT string exactly once
 */
router.post('/', validate(generatePatSchema), generatePAT);

/**
 * @swagger
 * /api/v1/tokens:
 *   get:
 *     summary: List all active PATs
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of active Personal Access Tokens
 */
router.get('/', listPATs);

/**
 * @swagger
 * /api/v1/tokens/{tokenId}:
 *   delete:
 *     summary: Revoke a specific PAT
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Token ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token revoked successfully
 */
router.delete('/:tokenId', revokePAT);

module.exports = router;
