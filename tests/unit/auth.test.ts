import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../src/utils/password.js';
import { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken } from '../../src/utils/jwt.js';

describe('Unit Tests: Authentication & Security Utilities', () => {
  it('should hash password with bcrypt cost factor >= 12 and verify correctly', async () => {
    const rawPassword = 'Password123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(rawPassword);

    const isMatch = await comparePassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('should generate and verify valid JWT Access Token', () => {
    const payload = {
      userId: 'user-123',
      orgId: 'org-456',
      email: 'admin@acme.com',
      role: 'org_admin',
    };

    const token = generateAccessToken(payload);
    expect(token).toBeDefined();

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.orgId).toBe(payload.orgId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('should generate and verify valid JWT Refresh Token', () => {
    const payload = {
      userId: 'user-123',
      orgId: 'org-456',
      email: 'admin@acme.com',
      role: 'org_admin',
    };

    const refreshToken = generateRefreshToken(payload);
    expect(refreshToken).toBeDefined();

    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.userId).toBe(payload.userId);
  });
});
