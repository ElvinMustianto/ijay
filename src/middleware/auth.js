import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import RefreshToken from '../models/token.js';
import { unauthorized } from '../utils/responseHelpers.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Token tidak ditemukan');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    let isRefreshToken = false;
    try {
      // try access token
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // fallback to refresh token
      try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        isRefreshToken = true;

        // cek apakah refresh token ada di DB dan valid
        const exists = await RefreshToken.findOne({ token });
        if (!exists) {
          return unauthorized(res, 'Refresh token tidak terdaftar');
        }
      } catch (err2) {
        return unauthorized(res, 'Token tidak valid');
      }
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return unauthorized(res, 'User tidak valid');
    }

    req.user = user;
    req.isRefreshToken = isRefreshToken;
    next();
  } catch (error) {
    console.error('[AUTH ERROR]', error.message);
    return unauthorized(res, 'Token tidak valid');
  }
};
export default auth;
