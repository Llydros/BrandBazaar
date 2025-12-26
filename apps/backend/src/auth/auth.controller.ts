import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { User } from 'src/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(registerDto, res);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Get('me')
  async getMe(@Request() req) {
    console.log('Cookies received:', req.cookies);
    const sessionToken = req.cookies?.session;
    console.log('Session token:', sessionToken);

    if (!sessionToken) {
      console.log('No session token found');
      return { user: null };
    }

    const user = await this.authService.validateSession(sessionToken);
    console.log('User from session:', user ? 'Found' : 'Not found');

    if (!user) {
      return { user: null };
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        roles: userWithoutPassword.roles,
        status: userWithoutPassword.status,
        xp: userWithoutPassword.xp ?? 0,
        level: userWithoutPassword.level ?? 'Hobbyist',
        createdAt: userWithoutPassword.createdAt.toISOString(),
        updatedAt: userWithoutPassword.updatedAt.toISOString(),
      },
    };
  }

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  async heartbeat(@Request() req) {
    const user = req.user as User | null;
    if (!user) {
      return { success: false };
    }

    await this.authService.updateLastSeen(user.id);
    return { success: true };
  }
}
