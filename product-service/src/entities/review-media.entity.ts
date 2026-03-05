import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Review } from './review.entity';

@Entity('review_medias')
export class ReviewMedia {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  type: string; // image | video

  @Column()
  publicId: string;

  @ManyToOne(() => Review, review => review.medias, {
    onDelete: 'CASCADE',
  })
  review: Review;
}