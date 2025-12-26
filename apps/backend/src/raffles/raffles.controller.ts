import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { RafflesService } from './raffles.service';
import { CreateRaffleDto, UpdateRaffleDto } from './raffles.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../entities/user.entity';
import { EnterRaffleRequestSchema } from '@shared/raffles';
import { createZodDto } from 'nestjs-zod';

@ApiTags('raffles')
@Controller('raffles')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all raffles' })
  @ApiResponse({ status: 200, description: 'List of raffles' })
  async findAll(@Request() req) {
    const userId = req.user?.id;
    const raffles = await this.rafflesService.findAll(userId);
    return { raffles };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get raffle by ID' })
  @ApiResponse({ status: 200, description: 'Raffle details' })
  @ApiResponse({ status: 404, description: 'Raffle not found' })
  async findOne(@Param('id') id: string) {
    const raffle = await this.rafflesService.findOne(id);
    if (!raffle) {
      throw new NotFoundException('Raffle not found');
    }
    return { raffle };
  }

  @Post(':id/enter')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enter a raffle' })
  @ApiResponse({ status: 201, description: 'Successfully entered raffle' })
  @ApiResponse({ status: 403, description: 'User level too low' })
  async enterRaffle(@Request() req, @Param('id') raffleId: string) {
    if (!req.user) {
      throw new NotFoundException('User not found');
    }
    const entry = await this.rafflesService.enterRaffle(req.user.id, raffleId);
    return { entry };
  }

  @Get('entries/my')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user raffle entries' })
  @ApiResponse({ status: 200, description: 'List of user entries' })
  async getMyEntries(@Request() req) {
    if (!req.user) {
      throw new NotFoundException('User not found');
    }
    const entries = await this.rafflesService.getUserEntries(req.user.id);
    return { entries };
  }

  @Post(':id/purchase')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase raffle item as winner' })
  @ApiResponse({ status: 200, description: 'Purchase successful' })
  @ApiResponse({ status: 403, description: 'User is not the winner' })
  async purchaseRaffleItem(@Request() req, @Param('id') raffleId: string) {
    if (!req.user) {
      throw new NotFoundException('User not found');
    }
    const entry = await this.rafflesService.handleWinnerPurchase(
      raffleId,
      req.user.id,
    );
    return { entry };
  }
}

@ApiTags('admin-raffles')
@Controller('admin/raffles')
@UseGuards(RolesGuard)
export class AdminRafflesController {
  constructor(private readonly rafflesService: RafflesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all raffles (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'List of raffles' })
  async findAll() {
    const raffles = await this.rafflesService.findAll();
    return { raffles };
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new raffle (Admin/Staff only)' })
  @ApiResponse({ status: 201, description: 'Raffle created' })
  async create(@Body() createRaffleDto: CreateRaffleDto) {
    const raffle = await this.rafflesService.create(createRaffleDto);
    return { raffle };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a raffle (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Raffle updated' })
  @ApiResponse({ status: 404, description: 'Raffle not found' })
  async update(
    @Param('id') id: string,
    @Body() updateRaffleDto: UpdateRaffleDto,
  ) {
    const raffle = await this.rafflesService.update(id, updateRaffleDto);
    return { raffle };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a raffle (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Raffle deleted' })
  @ApiResponse({ status: 404, description: 'Raffle not found' })
  async remove(@Param('id') id: string) {
    await this.rafflesService.delete(id);
    return { message: 'Raffle deleted successfully' };
  }

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload raffle images' })
  @ApiResponse({ status: 200, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new NotFoundException('No files provided');
    }
    const filePaths = await this.rafflesService.uploadFiles(files);
    return { files: filePaths };
  }
}
