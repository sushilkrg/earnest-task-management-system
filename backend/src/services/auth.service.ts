import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { RegisterInput, LoginInput, AuthResponse } from '../types/auth.types';
import { ApiError } from '../utils/ApiError';
import { TokenService } from './token.service';

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const accessToken = TokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = TokenService.generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    await TokenService.saveRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  static async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const accessToken = TokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = TokenService.generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    await TokenService.cleanExpiredTokens(user.id);
    await TokenService.saveRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const isValid = await TokenService.validateRefreshToken(refreshToken);

    if (!isValid) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const payload = TokenService.verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    await TokenService.removeRefreshToken(refreshToken);

    const newAccessToken = TokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const newRefreshToken = TokenService.generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    await TokenService.saveRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(refreshToken: string): Promise<void> {
    await TokenService.removeRefreshToken(refreshToken);
  }
}
