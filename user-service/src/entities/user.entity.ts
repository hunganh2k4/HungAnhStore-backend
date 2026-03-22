import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Address } from './address.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'nvarchar' })
  name: string;

  @Column({ type: 'nvarchar', nullable: true })
  avatar: string | null;

  @Column({ default: false })
  enable: boolean;

  @Column({ default: false })
  deleted: boolean;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];
}