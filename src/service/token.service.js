// service/token.service.js
import RefreshToken from '../models/token.js';
import { getTokenExpiryDate } from '../utils/token.js';

export const saveRefreshToken = async ({ userId, refreshToken }) => {
  return RefreshToken.create({
    user: userId,
    token: refreshToken,
    expiresAt: getTokenExpiryDate(refreshToken),
  });
};

export const rotateRefreshToken = async ({
  userId,
  oldRefreshToken,
  newRefreshToken,
}) => {
  const tokenDoc = await RefreshToken.findOne({
    user: userId,
    token: oldRefreshToken,
  });

  if (!tokenDoc) return null;

  tokenDoc.token = newRefreshToken;
  tokenDoc.expiresAt = getTokenExpiryDate(newRefreshToken);

  await tokenDoc.save();
  return tokenDoc;
};

export const verifyRefreshTokenExists = async (token) => {
  return RefreshToken.findOne({ token });
}
