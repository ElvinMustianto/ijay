import express from 'express';
import { deleteImage, setPrimaryImage } from '../controllers/image.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Image management
 */

/**
 * @swagger
 * /api/images/{id}:
 *   delete:
 *     summary: Delete image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Image ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image berhasil dihapus
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image tidak ditemukan
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, deleteImage);

/**
 * @swagger
 * /api/images/{id}/primary:
 *   patch:
 *     summary: Set image as primary
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Image ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Primary image berhasil diperbarui
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image tidak ditemukan
 *       500:
 *         description: Server error
 */
router.patch('/:id/primary', auth, setPrimaryImage);

export default router;
