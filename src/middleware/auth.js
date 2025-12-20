import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { unauthorized } from '../utils/responseHelpers.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Token tidak ditemukan');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return unauthorized(res, 'User tidak valid');
    }

    req.user = user;
    next();
  } catch (error) {
    return unauthorized(res, 'Token tidak valid');
  }
};
export default auth;
