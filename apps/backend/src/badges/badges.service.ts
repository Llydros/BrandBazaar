import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from '../entities/badge.entity';
import { UserBadge } from '../entities/user-badge.entity';
import { CreateBadgeDto, UpdateBadgeDto } from './badges.dto';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
  ) {}

  async findAll(): Promise<Badge[]> {
    return this.badgeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Badge | null> {
    return this.badgeRepository.findOne({ where: { id } });
  }

  async findUserBadges(userId: string): Promise<UserBadge[]> {
    return this.userBadgeRepository.find({
      where: { userId },
      relations: ['badge'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(createBadgeDto: CreateBadgeDto): Promise<Badge> {
    const badge = this.badgeRepository.create(createBadgeDto);
    return this.badgeRepository.save(badge);
  }

  async update(id: string, updateBadgeDto: UpdateBadgeDto): Promise<Badge> {
    const badge = await this.findOne(id);
    if (!badge) {
      throw new NotFoundException('Badge not found');
    }
    Object.assign(badge, updateBadgeDto);
    return this.badgeRepository.save(badge);
  }

  async delete(id: string): Promise<void> {
    const badge = await this.findOne(id);
    if (!badge) {
      throw new NotFoundException('Badge not found');
    }
    await this.badgeRepository.remove(badge);
  }
}
