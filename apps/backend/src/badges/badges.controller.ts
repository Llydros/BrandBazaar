import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { UserBadge } from '../entities/user-badge.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { CreateBadgeDto, UpdateBadgeDto } from './badges.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../entities/user.entity';
import { AuthService } from '../auth/auth.service';

@ApiTags('badges')
@Controller('badges')
@UseGuards(RolesGuard)
export class BadgesController {
  constructor(
    private readonly badgesService: BadgesService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all badges' })
  @ApiResponse({ status: 200, description: 'List of badges' })
  async findAll() {
    const badges = await this.badgesService.findAll();
    return { badges };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user badges' })
  @ApiResponse({ status: 200, description: 'List of user badges' })
  async findMyBadges(
    @Request() req: ExpressRequest & { cookies?: { session?: string } },
  ): Promise<{ badges: UserBadge[] }> {
    const sessionToken = req.cookies?.session;
    if (!sessionToken) {
      throw new NotFoundException('User not authenticated');
    }

    const user = await this.authService.validateSession(sessionToken);
    if (!user) {
      throw new NotFoundException('Invalid session');
    }

    const userBadges = await this.badgesService.findUserBadges(user.id);
    return { badges: userBadges };
  }
}

@ApiTags('admin-badges')
@Controller('admin/badges')
@UseGuards(RolesGuard)
export class AdminBadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all badges (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'List of badges' })
  async findAll() {
    const badges = await this.badgesService.findAll();
    return { badges };
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new badge (Admin/Staff only)' })
  @ApiResponse({ status: 201, description: 'Badge created' })
  async create(@Body() createBadgeDto: CreateBadgeDto) {
    const badge = await this.badgesService.create(createBadgeDto);
    return { badge };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a badge (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Badge updated' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBadgeDto: UpdateBadgeDto,
  ) {
    const badge = await this.badgesService.update(id, updateBadgeDto);
    return { badge };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a badge (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Badge deleted' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  async remove(@Param('id') id: string) {
    await this.badgesService.delete(id);
    return { message: 'Badge deleted successfully' };
  }
}
