import express from 'express';
import {
  register,
  login,
  getProfile,
  refreshToken
} from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Authorization
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Elvin Mustianto
 *               email:
 *                 type: string
 *                 example: elvin@mail.com
 *               password:
 *                 type: string
 *                 example: password123
 *               companyId:
 *                 type: string
 *                 example: 65f9b123abc
 *     responses:
 *       201:
 *         description: Register berhasil
 *       409:
 *         description: Email sudah terdaftar
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: elvin@mail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Email atau password salah
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Generate access token baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui
 *       401:
 *         description: Refresh token tidak valid
 */
router.post('/refresh-token', refreshToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ambil profile user login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil ambil profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, getProfile);

export default router;
