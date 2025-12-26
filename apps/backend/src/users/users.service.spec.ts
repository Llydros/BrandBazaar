import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole, UserStatus } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        UsersService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    const mockUser: User = {
      id: 'test-id',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      passwordChangedAt: new Date(),
      roles: [UserRole.CUSTOMER],
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should return user when found by email', async () => {
      const email = 'test@example.com';
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(email);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null when user is not found', async () => {
      const email = 'nonexistent@example.com';
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(email);

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return undefined when user is undefined', async () => {
      const email = 'test@example.com';
      userRepository.findOne.mockResolvedValue(undefined as unknown as null);

      const result = await service.findOne(email);

      expect(result).toBeUndefined();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });
});
