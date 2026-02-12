import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { TokenService } from '../services/token.service';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access token is required');
  }

  const token = authHeader.substring(7);

  const payload = TokenService.verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  req.user = user;
  next();
});
