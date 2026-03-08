import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'nvarchar'})
  name: string;
  
  @Column({ type: 'nvarchar', nullable: true })
  avatar: string | null;

  @Column({ default: false })
  enable: boolean;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}