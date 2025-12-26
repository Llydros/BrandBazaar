import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

export enum RaffleType {
  SNEAKER = 'sneaker',
  EVENT = 'event',
}

export enum RaffleStatus {
  ACTIVE = 'active',
  UPCOMING = 'upcoming',
  ENDED = 'ended',
}

export enum UserLevel {
  HOBBYIST = 'Hobbyist',
  ENTHUSIAST = 'Enthusiast',
  SNEAKERHEAD = 'Sneakerhead',
}

@Entity()
export class Raffle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RaffleType })
  type: RaffleType;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  imageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  entryPrice: number;

  @Column({ type: 'int' })
  xpReward: number;

  @Column({ type: 'enum', enum: UserLevel, default: UserLevel.HOBBYIST })
  requiredLevel: UserLevel;

  @Column({ type: 'timestamptz', nullable: true })
  releaseDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  eventDate: Date | null;

  @Column({ type: 'text', nullable: true })
  location: string | null;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ type: 'enum', enum: RaffleStatus, default: RaffleStatus.ACTIVE })
  status: RaffleStatus;

  @ManyToOne(() => Product, { nullable: true })
  product: Product | null;

  @Column({ nullable: true })
  productId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  winnerSelectionStartedAt: Date | null;

  @ManyToOne(() => User, { nullable: true })
  currentWinner: User | null;

  @Column({ nullable: true })
  currentWinnerId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  winnerPurchaseDeadline: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
