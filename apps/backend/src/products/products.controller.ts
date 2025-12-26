import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
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
import { ProductsService } from './products.service';
import { AuthService } from '../auth/auth.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateReviewDto,
  UploadFilesResponseDto,
} from './products.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../entities/user.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products' })
  async findAll(
    @Request() req,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
    @Query('inStock') inStock?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const isAdmin =
      req.user?.roles?.includes(UserRole.ADMIN) ||
      req.user?.roles?.includes(UserRole.STAFF);
    const result = await this.productsService.findAll(
      category,
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
      search,
      inStock === 'true' ? true : inStock === 'false' ? false : undefined,
      sortBy,
      sortOrder,
      isAdmin,
    );
    return result;
  }

  @Post('upload')
  @UseGuards(RolesGuard)
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
  @ApiOperation({ summary: 'Upload product images' })
  @ApiResponse({
    status: 200,
    description: 'Files uploaded successfully',
    type: UploadFilesResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadFilesResponseDto> {
    if (!files || files.length === 0) {
      throw new NotFoundException('No files provided');
    }
    const filePaths = await this.productsService.uploadFiles(files);
    return { files: filePaths };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOneWithReviews(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return { product };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created' })
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);
    return { product };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(id, updateProductDto);
    return { product };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    await this.productsService.delete(id);
    return { message: 'Product deleted successfully' };
  }

  @Post(':id/reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a review for a product' })
  @ApiResponse({ status: 201, description: 'Review created' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createReview(
    @Param('id') productId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Request() req: any,
  ) {
    const sessionToken = req.cookies?.session;
    if (!sessionToken) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.authService.validateSession(sessionToken);
    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }

    const review = await this.productsService.createReview(
      productId,
      user.id,
      createReviewDto,
    );
    return { review };
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get reviews for a product' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  async getReviews(@Param('id') id: string) {
    const reviews = await this.productsService.getReviews(id);
    return { reviews };
  }

  @Get(':id/recommendations')
  @ApiOperation({ summary: 'Get recommended products' })
  @ApiResponse({ status: 200, description: 'List of recommended products' })
  async getRecommendations(
    @Param('id') productId: string,
    @Query('limit') limit?: string,
  ) {
    const products = await this.productsService.getRecommendedProducts(
      productId,
      limit ? parseInt(limit, 10) : undefined,
    );
    return { products };
  }
}
