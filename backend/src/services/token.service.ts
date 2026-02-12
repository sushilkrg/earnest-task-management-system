import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { JWTPayload } from "../types/auth.types";
import { ApiError } from "../utils/ApiError";

export class TokenService {
  static generateAccessToken(payload: JWTPayload): string {
    const secret: Secret = env.JWT_ACCESS_SECRET;

    const options: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRY as any, // e.g. "15m"
    };

    return jwt.sign(payload, secret, options);
  }

  static generateRefreshToken(payload: JWTPayload): string {
    const secret: Secret = env.JWT_REFRESH_SECRET;

    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRY as any, // e.g. "7d"
    };

    return jwt.sign(payload, secret, options);
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      const secret: Secret = env.JWT_ACCESS_SECRET;
      return jwt.verify(token, secret) as JWTPayload;
    } catch {
      throw ApiError.unauthorized("Invalid or expired access token");
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const secret: Secret = env.JWT_REFRESH_SECRET;
      return jwt.verify(token, secret) as JWTPayload;
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }
  }

  static async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  static async removeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { token },
    });
  }

  static async validateRefreshToken(token: string): Promise<boolean> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  static async cleanExpiredTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
