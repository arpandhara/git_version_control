const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    markAsArchived,
    archiveMultiple,
    toggleSave
} = require('../controllers/notification.controller');

// All notification routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management, filtering, and status updates
 */

/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', getUnreadCount);

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [unread, read, archived, done, saved]
 *         description: Filter notifications by read or archive status (default shows active inbox)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type (e.g., PR_ASSIGNED, PR_REVIEW_REQUESTED, COLLABORATOR_INVITE, etc.)
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get('/', getNotifications);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.patch('/read-all', markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/archive:
 *   patch:
 *     summary: Archive multiple notifications in bulk
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f1a2b3c4d5e6f7a8b9c0d1", "64f1a2b3c4d5e6f7a8b9c0d2"]
 *     responses:
 *       200:
 *         description: Notifications archived successfully
 *       400:
 *         description: No notification IDs provided
 *       401:
 *         description: Unauthorized
 */
router.patch('/archive', archiveMultiple);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/read', markAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/archive:
 *   patch:
 *     summary: Mark a single notification as archived (Done)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification archived
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/archive', markAsArchived);

/**
 * @swagger
 * /api/v1/notifications/{id}/save:
 *   patch:
 *     summary: Toggle saved/bookmarked status of a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification bookmark toggled
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/save', toggleSave);

module.exports = router;
