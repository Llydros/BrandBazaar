import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './addresses.dto';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('addresses')
@Controller('addresses')
@UseGuards(RolesGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user addresses' })
  @ApiResponse({ status: 200, description: 'List of addresses' })
  async findAll(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const addresses = await this.addressesService.findAllByUserId(req.user.id);
    return { addresses };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiResponse({ status: 200, description: 'Address details' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async findOne(@Request() req, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const address = await this.addressesService.findOne(id, req.user.id);
    return { address };
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  async create(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const address = await this.addressesService.create(
      req.user.id,
      createAddressDto,
    );
    return { address };
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({ status: 200, description: 'Address updated' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const address = await this.addressesService.update(
      id,
      req.user.id,
      updateAddressDto,
    );
    return { address };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async remove(@Request() req, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    await this.addressesService.remove(id, req.user.id);
    return { message: 'Address deleted successfully' };
  }
}
