// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodObject, ZodRawShape } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validate = (
  schema: ZodObject<ZodRawShape>,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data =
        source === 'body'
          ? req.body
          : source === 'query'
          ? req.query
          : req.params;

      const validated = await schema.parseAsync(data);

      if (source === 'body') {
        // body is safe to mutate
        req.body = validated;
      }
      // For query/params we just use the validated object locally in controllers
      // or rely on the return value; do NOT assign: req.query = validated

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        next(ApiError.badRequest(message));
      } else {
        next(error);
      }
    }
  };
};
