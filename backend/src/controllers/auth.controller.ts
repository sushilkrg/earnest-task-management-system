import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterInput, LoginInput } from '../types/auth.types';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const input: RegisterInput = req.body;
    const result = await AuthService.register(input);
    
    res.status(201).json(ApiResponse.created(result, 'Registration successful'));
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const input: LoginInput = req.body;
    const result = await AuthService.login(input);
    
    res.status(200).json(ApiResponse.success(result, 'Login successful'));
  });

  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshAccessToken(refreshToken);
    
    res.status(200).json(ApiResponse.success(result, 'Token refreshed successfully'));
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    await AuthService.logout(refreshToken);
    
    res.status(200).json(ApiResponse.success(null, 'Logout successful'));
  });
}
