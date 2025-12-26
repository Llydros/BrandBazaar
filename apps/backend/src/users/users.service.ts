import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole, UserStatus } from 'src/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async create(userData: {
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const user = this.usersRepository.create({
      ...userData,
      roles: [UserRole.CUSTOMER],
      status: UserStatus.ACTIVE,
      passwordChangedAt: new Date(),
    });

    return await this.usersRepository.save(user);
  }

  async findAll(
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.usersRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
    return { users, total };
  }

  async updateLastSeen(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastSeenAt: new Date(),
    });
  }

  async awardXP(userId: string, amount: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    user.xp += amount;
    await this.checkLevelUp(user);
    return this.usersRepository.save(user);
  }

  async checkLevelUp(user: User): Promise<void> {
    const levelThresholds = {
      Hobbyist: 0,
      Enthusiast: 1000,
      Sneakerhead: 5000,
    };

    let newLevel: 'Hobbyist' | 'Enthusiast' | 'Sneakerhead' = user.level;

    if (
      user.xp >= levelThresholds.Sneakerhead &&
      user.level !== 'Sneakerhead'
    ) {
      newLevel = 'Sneakerhead';
    } else if (
      user.xp >= levelThresholds.Enthusiast &&
      user.level === 'Hobbyist'
    ) {
      newLevel = 'Enthusiast';
    }

    if (newLevel !== user.level) {
      user.level = newLevel;
    }
  }

  async findOneById(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }
}
