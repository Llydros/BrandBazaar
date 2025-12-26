import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { User, UserRole, UserStatus } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let bcryptCompare: jest.Mock;

  beforeEach(async () => {
    const mockUsersService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        AuthService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    bcryptCompare = bcrypt.compare as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
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

    it('should return user when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      usersService.findOne.mockResolvedValue(mockUser);
      bcryptCompare.mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith(email);
      expect(bcryptCompare).toHaveBeenCalledWith(
        password,
        mockUser.passwordHash,
      );
    });

    it('should return null when user null or undefined', async () => {
      // null case
      const email = 'nonexistent@example.com';
      const password = 'password123';
      usersService.findOne.mockResolvedValue(null);

      const result1 = await service.validateUser(email, password);

      expect(result1).toBeNull();
      expect(usersService.findOne).toHaveBeenCalledWith(email);
      expect(bcryptCompare).not.toHaveBeenCalled();

      // undefined case
      usersService.findOne.mockResolvedValue(undefined as unknown as User);
      const result2 = await service.validateUser(email, password);

      expect(result2).toBeNull();
      expect(usersService.findOne).toHaveBeenCalledWith(email);
      expect(bcryptCompare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrong-password';
      usersService.findOne.mockResolvedValue(mockUser);
      bcryptCompare.mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(usersService.findOne).toHaveBeenCalledWith(email);
      expect(bcryptCompare).toHaveBeenCalledWith(
        password,
        mockUser.passwordHash,
      );
    });
  });
});
