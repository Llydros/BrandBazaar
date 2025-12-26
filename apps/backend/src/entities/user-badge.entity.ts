import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Badge } from './badge.entity';

export enum BadgeStatus {
  UNLOCKED = 'Unlocked',
  PENDING = 'Pending',
  LOCKED = 'Locked',
}

@Entity()
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  badgeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Badge)
  @JoinColumn({ name: 'badgeId' })
  badge: Badge;

  @Column({ type: 'enum', enum: BadgeStatus, default: BadgeStatus.LOCKED })
  status: BadgeStatus;

  @Column({ type: 'timestamptz', nullable: true })
  unlockedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
