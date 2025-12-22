import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';
import { saveRefreshToken, rotateRefreshToken } from '../service/token.service.js';
import {
  success,
  badRequest,
  unauthorized,
  forbidden,
  internalServerError,
} from '../utils/responseHelpers.js';

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return badRequest(res, 'Email dan password wajib diisi');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return unauthorized(res, 'Email atau password salah');
    }

    if (!user.isActive) {
      return forbidden(res, 'Akun tidak aktif');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await saveRefreshToken({
      userId: user._id,
      refreshToken,
    });

    return success(res, {
      message: 'Login berhasil',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return internalServerError(res, 'Gagal login', error);
  }
};

/**
 * REFRESH TOKEN
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return badRequest(res, 'Refresh token wajib disertakan');
    }
    
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return unauthorized(res, 'Refresh token tidak valid');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return unauthorized(res, 'User tidak valid');
    }

    const newRefreshToken = generateRefreshToken(user);

    const rotated = await rotateRefreshToken({
      userId: user._id,
      oldRefreshToken: refreshToken,
      newRefreshToken,
    });

    if (!rotated) {
      return unauthorized(res, 'Refresh token tidak valid atau sudah digunakan');
    }

    return success(res, {
      message: 'Token berhasil diperbarui',
      data: {
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return unauthorized(res, 'Refresh token tidak valid');
  }
};

/**
 * PROFILE
 */
export const getProfile = async (req, res) => {
  return success(res, {
    message: 'Berhasil mengambil profile',
    data: req.user,
  });
};
