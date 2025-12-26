import bcrypt from 'bcrypt';
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthResponse, LogoutResponse } from '@shared/auth';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/entities/user.entity';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(email);
    if (user == undefined) return null;

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return null;

    return user;
  }

  async register(
    registerDto: RegisterDto,
    res: Response,
  ): Promise<AuthResponse> {
    const { email, password } = registerDto;

    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await this.usersService.create({
      email,
      passwordHash,
    });

    const sessionToken = this.generateSessionToken(user);
    res.cookie('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // If frontend/backend are on different domains (Vercel + Railway),
      // browsers require SameSite=None + Secure for cookies to be sent.
      sameSite:
        process.env.COOKIE_SAMESITE ??
        (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        status: user.status,
        xp: user.xp,
        level: user.level,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto, res: Response): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const sessionToken = this.generateSessionToken(user);
    res.cookie('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:
        process.env.COOKIE_SAMESITE ??
        (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        status: user.status,
        xp: user.xp,
        level: user.level,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      message: 'Login successful',
    };
  }

  logout(res: Response): LogoutResponse {
    res.clearCookie('session', { path: '/' });
    return { message: 'Logout successful' };
  }

  private generateSessionToken(user: User): string {
    return Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        timestamp: Date.now(),
      }),
    ).toString('base64');
  }

  async validateSession(sessionToken: string): Promise<User | null> {
    try {
      console.log('Validating session token:', sessionToken);
      const decoded = JSON.parse(
        Buffer.from(sessionToken, 'base64').toString(),
      );
      console.log('Decoded session:', decoded);

      // Check if the session token is not too old (24 hours)
      const tokenAge = Date.now() - decoded.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      console.log('Token age:', tokenAge, 'Max age:', maxAge);

      if (tokenAge > maxAge) {
        console.log('Session token expired');
        return null;
      }

      const user = await this.usersService.findOne(decoded.email);
      console.log('User found:', user ? 'Yes' : 'No');
      return user;
    } catch (error) {
      console.log('Session validation error:', error);
      return null;
    }
  }

  async updateLastSeen(userId: string): Promise<void> {
    await this.usersService.updateLastSeen(userId);
  }
}
