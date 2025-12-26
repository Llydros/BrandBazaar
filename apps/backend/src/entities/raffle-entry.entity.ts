import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Raffle } from './raffle.entity';
import { User } from './user.entity';

@Entity()
export class RaffleEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Raffle, { onDelete: 'CASCADE' })
  raffle: Raffle;

  @Column()
  raffleId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  enteredAt: Date;

  @Column({ default: false })
  isWinner: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  winnerSelectedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  purchasedAt: Date | null;

  @Column({ default: false })
  removedFromPool: boolean;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
