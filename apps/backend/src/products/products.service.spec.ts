import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { Review } from '../entities/review.entity';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let reviewRepository: Repository<Review>;
  let userRepository: Repository<User>;
  let dataSource: DataSource;

  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    update: jest.fn(),
  };

  const mockReviewRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    reviewRepository = module.get<Repository<Review>>(
      getRepositoryToken(Review),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 100,
        },
      ] as Product[];

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProducts),
      };

      mockProductRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll();

      expect(result).toEqual(mockProducts);
      expect(queryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 100,
      } as Product;

      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['variants'],
      });
    });

    it('should return null if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto = {
        name: 'New Product',
        description: 'Test description',
        price: 100,
        images: [],
        stock: 10,
      };

      const mockProduct = {
        id: '1',
        ...createProductDto,
      } as Product;

      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });

  describe('createReview', () => {
    it('should create a review and update product statistics', async () => {
      const productId = 'product-1';
      const userId = 'user-1';
      const createReviewDto = {
        rating: 5,
        comment: 'Great product!',
      };

      const mockProduct = {
        id: productId,
      } as Product;

      const mockUser = {
        id: userId,
        email: 'test@example.com',
      } as User;

      const mockReview = {
        id: 'review-1',
        ...createReviewDto,
        productId,
        userId,
      } as Review;

      const mockTransactionManager = {
        create: jest.fn().mockReturnValue(mockReview),
        save: jest.fn().mockResolvedValue(mockReview),
        find: jest.fn().mockResolvedValue([mockReview]),
        update: jest.fn().mockResolvedValue(undefined),
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockReviewRepository.findOne.mockResolvedValue(null);
      mockDataSource.transaction.mockImplementation(async (callback) => {
        return callback(mockTransactionManager);
      });

      const result = await service.createReview(
        productId,
        userId,
        createReviewDto,
      );

      expect(result).toEqual(mockReview);
      expect(mockTransactionManager.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createReview('non-existent', 'user-1', { rating: 5 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
