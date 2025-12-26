import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const sessionToken = req.cookies?.session;

    if (sessionToken) {
      const user = await this.authService.validateSession(sessionToken);
      if (user) {
        req.user = user;
      }
    }

    next();
  }
}
