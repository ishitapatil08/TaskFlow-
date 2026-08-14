import { prisma } from '../db/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt.js';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors.js';
import { Role } from '@prisma/client';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  orgName: string;
  orgSlug: string;
}

export interface LoginInput {
  email: string;
  password: string;
  orgSlug: string;
  deviceInfo?: string;
}

export class AuthService {
  static async register(input: RegisterInput) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    // Check if org slug exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: input.orgSlug },
    });

    if (existingOrg) {
      throw new ConflictError('Organization slug already in use', 'ORG_SLUG_EXISTS');
    }

    const hashedPassword = await hashPassword(input.password);

    // Transaction: Create user, organization, and org_member (org_admin)
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash: hashedPassword,
          name: input.name,
        },
      });

      const org = await tx.organization.create({
        data: {
          name: input.orgName,
          slug: input.orgSlug,
        },
      });

      const member = await tx.orgMember.create({
        data: {
          orgId: org.id,
          userId: user.id,
          role: Role.org_admin,
        },
      });

      return { user, org, member };
    });

    const payload: TokenPayload = {
      userId: result.user.id,
      orgId: result.org.id,
      email: result.user.email,
      role: result.member.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in DB
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: result.user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      organization: {
        id: result.org.id,
        name: result.org.name,
        slug: result.org.slug,
        role: result.member.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Verify user belongs to requested organization
    const org = await prisma.organization.findUnique({
      where: { slug: input.orgSlug },
    });

    if (!org) {
      throw new NotFoundError('Organization not found', 'ORG_NOT_FOUND');
    }

    const member = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId: org.id,
          userId: user.id,
        },
      },
    });

    if (!member) {
      throw new UnauthorizedError('User is not a member of this organization', 'NOT_ORG_MEMBER');
    }

    const payload: TokenPayload = {
      userId: user.id,
      orgId: org.id,
      email: user.email,
      role: member.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token with rotation support
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        deviceInfo: input.deviceInfo || 'Unknown Device',
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: member.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async refreshTokens(rawRefreshToken: string, deviceInfo?: string) {
    const payload = verifyRefreshToken(rawRefreshToken);
    const incomingHash = hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash: incomingHash,
        userId: payload.userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token is invalid or revoked', 'INVALID_REFRESH_TOKEN');
    }

    // Revoke old token (Refresh Token Rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Generate new tokens
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        tokenHash: newTokenHash,
        deviceInfo: deviceInfo || storedToken.deviceInfo,
        expiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(rawRefreshToken: string) {
    const incomingHash = hashToken(rawRefreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash: incomingHash },
      data: { revoked: true },
    });
  }

  static async logoutAll(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}
