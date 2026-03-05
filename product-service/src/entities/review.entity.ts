import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ReviewMedia } from './review-media.entity';

@Entity('reviews')
export class Review {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productLineId: number;

  @Column()
  userId: String;

  @Column()
  rating: number; // 1-5 sao

  @Column('text', { nullable: true })
  comment: string;

  @OneToMany(() => ReviewMedia, media => media.review, {
    cascade: true,
  })
  medias: ReviewMedia[];

  @CreateDateColumn()
  createdAt: Date;
}