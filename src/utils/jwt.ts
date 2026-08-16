import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { UnauthorizedError } from './errors.js';

export interface TokenPayload {
  userId: string;
  orgId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const cleanPayload: TokenPayload = {
    userId: payload.userId,
    orgId: payload.orgId,
    email: payload.email,
    role: payload.role,
  };
  return jwt.sign(cleanPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL as any,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const cleanPayload: TokenPayload = {
    userId: payload.userId,
    orgId: payload.orgId,
    email: payload.email,
    role: payload.role,
  };
  return jwt.sign(cleanPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL as any,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired access token', 'TOKEN_EXPIRED');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token', 'REFRESH_TOKEN_EXPIRED');
  }
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
