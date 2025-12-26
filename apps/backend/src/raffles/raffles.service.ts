import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import {
  Raffle,
  RaffleType,
  RaffleStatus,
  UserLevel,
} from '../entities/raffle.entity';
import { RaffleEntry } from '../entities/raffle-entry.entity';
import { User } from '../entities/user.entity';
import { CreateRaffleDto, UpdateRaffleDto } from './raffles.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class RafflesService {
  constructor(
    @InjectRepository(Raffle)
    private raffleRepository: Repository<Raffle>,
    @InjectRepository(RaffleEntry)
    private raffleEntryRepository: Repository<RaffleEntry>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private dataSource: DataSource,
  ) {}

  async findAll(userId?: string): Promise<Raffle[]> {
    const raffles = await this.raffleRepository.find({
      order: { createdAt: 'DESC' },
    });

    if (userId) {
      return this.getUserEligibleRaffles(userId, raffles);
    }

    return raffles;
  }

  async getUserEligibleRaffles(
    userId: string,
    raffles?: Raffle[],
  ): Promise<Raffle[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return [];
    }

    const allRaffles = raffles || (await this.findAll());
    const levelOrder = {
      Hobbyist: 0,
      Enthusiast: 1,
      Sneakerhead: 2,
    };

    const userLevelOrder = levelOrder[user.level as keyof typeof levelOrder];

    return allRaffles.filter((raffle) => {
      const raffleLevelOrder =
        levelOrder[raffle.requiredLevel as keyof typeof levelOrder];
      return userLevelOrder >= raffleLevelOrder;
    });
  }

  async findOne(id: string): Promise<Raffle | null> {
    return this.raffleRepository.findOne({ where: { id } });
  }

  async create(createRaffleDto: CreateRaffleDto): Promise<Raffle> {
    const raffle = this.raffleRepository.create({
      type: createRaffleDto.type as RaffleType,
      name: createRaffleDto.name,
      description: createRaffleDto.description,
      imageUrl: createRaffleDto.imageUrl,
      entryPrice: createRaffleDto.entryPrice,
      xpReward: createRaffleDto.xpReward,
      requiredLevel: createRaffleDto.requiredLevel as UserLevel,
      releaseDate: createRaffleDto.releaseDate
        ? new Date(createRaffleDto.releaseDate)
        : null,
      eventDate: createRaffleDto.eventDate
        ? new Date(createRaffleDto.eventDate)
        : null,
      location: createRaffleDto.location ?? null,
      capacity: createRaffleDto.capacity ?? null,
      status: createRaffleDto.status
        ? (createRaffleDto.status as RaffleStatus)
        : RaffleStatus.ACTIVE,
      productId: createRaffleDto.productId ?? null,
    });
    return this.raffleRepository.save(raffle);
  }

  async update(id: string, updateRaffleDto: UpdateRaffleDto): Promise<Raffle> {
    const raffle = await this.findOne(id);
    if (!raffle) {
      throw new NotFoundException('Raffle not found');
    }

    if (updateRaffleDto.type !== undefined) {
      raffle.type = updateRaffleDto.type as RaffleType;
    }
    if (updateRaffleDto.name !== undefined) {
      raffle.name = updateRaffleDto.name;
    }
    if (updateRaffleDto.description !== undefined) {
      raffle.description = updateRaffleDto.description;
    }
    if (updateRaffleDto.imageUrl !== undefined) {
      raffle.imageUrl = updateRaffleDto.imageUrl;
    }
    if (updateRaffleDto.entryPrice !== undefined) {
      raffle.entryPrice = updateRaffleDto.entryPrice;
    }
    if (updateRaffleDto.xpReward !== undefined) {
      raffle.xpReward = updateRaffleDto.xpReward;
    }
    if (updateRaffleDto.requiredLevel !== undefined) {
      raffle.requiredLevel = updateRaffleDto.requiredLevel as UserLevel;
    }
    if (updateRaffleDto.releaseDate !== undefined) {
      raffle.releaseDate = updateRaffleDto.releaseDate
        ? new Date(updateRaffleDto.releaseDate)
        : null;
    }
    if (updateRaffleDto.eventDate !== undefined) {
      raffle.eventDate = updateRaffleDto.eventDate
        ? new Date(updateRaffleDto.eventDate)
        : null;
    }
    if (updateRaffleDto.location !== undefined) {
      raffle.location = updateRaffleDto.location ?? null;
    }
    if (updateRaffleDto.capacity !== undefined) {
      raffle.capacity = updateRaffleDto.capacity ?? null;
    }
    if (updateRaffleDto.status !== undefined) {
      raffle.status = updateRaffleDto.status as RaffleStatus;
    }
    if (updateRaffleDto.productId !== undefined) {
      raffle.productId = updateRaffleDto.productId ?? null;
    }

    return this.raffleRepository.save(raffle);
  }

  async delete(id: string): Promise<void> {
    const raffle = await this.findOne(id);
    if (!raffle) {
      throw new NotFoundException('Raffle not found');
    }
    await this.raffleRepository.remove(raffle);
  }

  async enterRaffle(userId: string, raffleId: string): Promise<RaffleEntry> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const raffle = await this.raffleRepository.findOne({
      where: { id: raffleId },
    });
    if (!raffle) {
      throw new NotFoundException('Raffle not found');
    }

    const levelOrder = {
      Hobbyist: 0,
      Enthusiast: 1,
      Sneakerhead: 2,
    };

    const userLevelOrder = levelOrder[user.level as keyof typeof levelOrder];
    const raffleLevelOrder =
      levelOrder[raffle.requiredLevel as keyof typeof levelOrder];

    if (userLevelOrder < raffleLevelOrder) {
      throw new ForbiddenException(
        'User level is too low to enter this raffle',
      );
    }

    const existingEntry = await this.raffleEntryRepository.findOne({
      where: { userId, raffleId, removedFromPool: false },
    });

    if (existingEntry) {
      throw new BadRequestException('User has already entered this raffle');
    }

    const entry = this.raffleEntryRepository.create({
      userId,
      raffleId,
    });

    const savedEntry = await this.raffleEntryRepository.save(entry);

    if (!raffle.winnerSelectionStartedAt) {
      raffle.winnerSelectionStartedAt = new Date();
      await this.raffleRepository.save(raffle);

      setTimeout(async () => {
        await this.selectWinner(raffleId);
      }, 60000);
    }

    return savedEntry;
  }

  async selectWinner(raffleId: string): Promise<void> {
    const raffle = await this.raffleRepository.findOne({
      where: { id: raffleId },
    });
    if (!raffle) {
      return;
    }

    const activeEntries = await this.raffleEntryRepository.find({
      where: {
        raffleId,
        removedFromPool: false,
        isWinner: false,
        purchasedAt: IsNull(),
      },
    });

    if (activeEntries.length === 0) {
      await this.downgradeRaffleLevel(raffle);
      return;
    }

    const randomIndex = Math.floor(Math.random() * activeEntries.length);
    const winner = activeEntries[randomIndex];

    winner.isWinner = true;
    winner.winnerSelectedAt = new Date();
    await this.raffleEntryRepository.save(winner);

    raffle.currentWinnerId = winner.userId;
    raffle.winnerPurchaseDeadline = new Date(Date.now() + 60000);
    await this.raffleRepository.save(raffle);

    setTimeout(async () => {
      await this.handleWinnerTimeout(raffleId);
    }, 60000);
  }

  async handleWinnerTimeout(raffleId: string): Promise<void> {
    const raffle = await this.raffleRepository.findOne({
      where: { id: raffleId },
    });
    if (!raffle || !raffle.currentWinnerId) {
      return;
    }

    const winnerEntry = await this.raffleEntryRepository.findOne({
      where: {
        raffleId,
        userId: raffle.currentWinnerId,
        isWinner: true,
      },
    });

    if (winnerEntry && !winnerEntry.purchasedAt) {
      winnerEntry.removedFromPool = true;
      await this.raffleEntryRepository.save(winnerEntry);

      raffle.currentWinnerId = null;
      raffle.winnerPurchaseDeadline = null;
      await this.raffleRepository.save(raffle);

      await this.selectWinner(raffleId);
    }
  }

  async handleWinnerPurchase(
    raffleId: string,
    userId: string,
  ): Promise<RaffleEntry> {
    const raffle = await this.raffleRepository.findOne({
      where: { id: raffleId },
    });
    if (!raffle) {
      throw new NotFoundException('Raffle not found');
    }

    if (raffle.currentWinnerId !== userId) {
      throw new ForbiddenException('User is not the current winner');
    }

    const winnerEntry = await this.raffleEntryRepository.findOne({
      where: {
        raffleId,
        userId,
        isWinner: true,
      },
    });

    if (!winnerEntry) {
      throw new NotFoundException('Winner entry not found');
    }

    if (winnerEntry.purchasedAt) {
      throw new BadRequestException('Item already purchased');
    }

    winnerEntry.purchasedAt = new Date();
    await this.raffleEntryRepository.save(winnerEntry);

    await this.usersService.awardXP(userId, raffle.xpReward);

    raffle.currentWinnerId = null;
    raffle.winnerPurchaseDeadline = null;
    await this.raffleRepository.save(raffle);

    return winnerEntry;
  }

  async downgradeRaffleLevel(raffle: Raffle): Promise<void> {
    const levelOrder = ['Hobbyist', 'Enthusiast', 'Sneakerhead'];
    const currentIndex = levelOrder.indexOf(raffle.requiredLevel);

    if (currentIndex > 0) {
      raffle.requiredLevel = levelOrder[currentIndex - 1] as UserLevel;
      raffle.winnerSelectionStartedAt = null;
      await this.raffleRepository.save(raffle);
    }
  }

  async getUserEntries(userId: string): Promise<RaffleEntry[]> {
    return this.raffleEntryRepository.find({
      where: { userId },
      relations: ['raffle'],
      order: { enteredAt: 'DESC' },
    });
  }

  async getRaffleEntries(raffleId: string): Promise<RaffleEntry[]> {
    return this.raffleEntryRepository.find({
      where: { raffleId },
      relations: ['user'],
      order: { enteredAt: 'DESC' },
    });
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    const maxFileSize = 5 * 1024 * 1024;
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
}
