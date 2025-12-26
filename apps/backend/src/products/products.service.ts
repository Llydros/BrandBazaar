import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Review } from '../entities/review.entity';
import { User } from '../entities/user.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateReviewDto,
} from './products.dto';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async findAll(
    category?: string,
    limit: number = 50,
    offset: number = 0,
    search?: string,
    inStock?: boolean,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    isAdmin: boolean = false,
  ): Promise<{ products: Product[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product');

    if (!isAdmin) {
      query.where('product.isPublic = :isPublic', { isPublic: true });
    }

    if (search) {
      const condition = isAdmin ? 'andWhere' : 'andWhere';
      query[condition](
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.shortDescription ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      const condition = search || !isAdmin ? 'andWhere' : 'where';
      query[condition]('product.category = :category', { category });
    }

    if (inStock !== undefined) {
      const condition = search || category || !isAdmin ? 'andWhere' : 'where';
      if (inStock) {
        query[condition]('product.stock > 0');
      } else {
        query[condition]('product.stock = 0');
      }
    }

    const validSortFields = [
      'name',
      'price',
      'createdAt',
      'averageRating',
      'totalReviews',
    ];
    const sortField = validSortFields.includes(sortBy || '')
      ? sortBy
      : 'createdAt';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    query.orderBy(`product.${sortField}`, order);

    const [products, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return {
      products: this.mapProducts(products),
      total,
    };
  }

  async findOne(id: string): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants'],
    });

    if (product) {
      return this.mapProduct(product);
    }

    return product;
  }

  async findOneWithReviews(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['reviews', 'reviews.user', 'variants'],
      order: {
        reviews: {
          createdAt: 'DESC',
        },
      },
    });

    if (product) {
      return this.mapProduct(product);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { variants, ...productData } = createProductDto;

    const product = this.productRepository.create({
      ...productData,
      images: productData.images || [],
      isPublic: productData.isPublic ?? true,
    });

    const savedProduct = await this.productRepository.save(product);

    if (variants && variants.length > 0) {
      const productVariants = variants.map((variant) =>
        this.productVariantRepository.create({
          ...variant,
          productId: savedProduct.id,
        }),
      );
      await this.productVariantRepository.save(productVariants);
      savedProduct.variants = productVariants;
    }

    return savedProduct;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { variants, ...productData } = updateProductDto;
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Update product fields
    Object.assign(product, productData);
    const savedProduct = await this.productRepository.save(product);

    // Update variants if provided
    if (variants) {
      // For simplicity: delete existing and recreate, or match by ID?
      // Matching by ID is better if IDs are provided.
      // If variant has ID, update it. If not, create it.
      // Also consider deletions?
      // For now, let's iterate and upsert.

      // This logic can be complex. A simple strategy:
      // 1. If variant has ID, update.
      // 2. If no ID, create.
      // 3. (Optional) Delete variants not in the list? Maybe too aggressive for partial update.
      // Let's assume replacement of variants list if provided, or add/update.
      // The Requirement says "Add variants... Update stock...".
      // Let's implement upsert.

      for (const variantDto of variants) {
        if (variantDto.id) {
          await this.productVariantRepository.update(
            { id: variantDto.id },
            variantDto,
          );
        } else {
          await this.productVariantRepository.save(
            this.productVariantRepository.create({
              ...variantDto,
              productId: savedProduct.id,
            }),
          );
        }
      }

      // Refresh variants
      savedProduct.variants = await this.productVariantRepository.find({
        where: { productId: savedProduct.id },
      });
    }

    return savedProduct;
  }

  async delete(id: string): Promise<void> {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.softDelete(id);
  }

  async createReview(
    productId: string,
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { productId, userId },
    });

    if (existingReview) {
      throw new Error('User has already reviewed this product');
    }

    return this.dataSource.transaction(async (manager) => {
      const review = manager.create(Review, {
        ...createReviewDto,
        productId,
        userId,
      });

      const savedReview = await manager.save(review);

      const reviews = await manager.find(Review, {
        where: { productId },
      });

      const averageRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const totalReviews = reviews.length;

      await manager.update(
        Product,
        { id: productId },
        {
          averageRating: Math.round(averageRating * 100) / 100,
          totalReviews,
        },
      );

      return savedReview;
    });
  }

  async getReviews(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRecommendedProducts(
    productId: string,
    limit: number = 4,
  ): Promise<Product[]> {
    const currentProduct = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!currentProduct) {
      throw new NotFoundException('Product not found');
    }

    const recommended = await this.productRepository
      .createQueryBuilder('product')
      .where('product.category = :category', {
        category: currentProduct.category,
      })
      .andWhere('product.id != :productId', { productId })
      .orderBy('product.averageRating', 'DESC')
      .addOrderBy('product.totalReviews', 'DESC')
      .take(limit)
      .getMany();

    return this.mapProducts(recommended);
  }

  private mapProducts(products: Product[]): Product[] {
    return products.map((p) => this.mapProduct(p));
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const assetsDir = path.join(process.cwd(), 'assets');

    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const uploadedPaths: string[] = [];

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type: ${file.mimetype}. Allowed types: jpg, png, webp, gif`,
        );
      }

      if (file.size > maxFileSize) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds maximum size of 5MB`,
        );
      }

      const fileExtension = path.extname(file.originalname).toLowerCase();
      const uuid = randomUUID();
      const fileName = `${uuid}${fileExtension}`;
      const filePath = path.join(assetsDir, fileName);

      fs.writeFileSync(filePath, file.buffer);

      uploadedPaths.push(`/assets/${fileName}`);
    }

    return uploadedPaths;
  }

  private mapProduct(product: Product): Product {
    if (product) {
      const p = product as Product & {
        images: string[] | string;
        tags: string[] | string;
      };

      if (typeof p.images === 'string') {
        p.images = p.images ? p.images.split(',') : [];
      }
      if (typeof p.tags === 'string') {
        p.tags = p.tags ? p.tags.split(',') : [];
      }
    }
    return product;
  }
}
