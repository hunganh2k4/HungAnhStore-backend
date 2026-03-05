import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { ReviewMedia } from '../entities/review-media.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import axios from 'axios';
import { DataSource } from 'typeorm';

@Injectable()
export class ReviewService {

  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,

    @InjectRepository(ReviewMedia)
    private mediaRepo: Repository<ReviewMedia>,

    private dataSource: DataSource,
  ) {}

  async createReview(dto: CreateReviewDto) {
    // Use transaction to ensure data consistency between review and media
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const review = queryRunner.manager.create(
        Review,
        {
          productLineId: dto.productLineId,
          userId: dto.userId,
          rating: dto.rating,
          comment: dto.comment,
        },
      );

      const savedReview =
        await queryRunner.manager.save(review);

      if (dto.medias && dto.medias.length > 0) {

        const publicIds =
          dto.medias.map(m => m.publicId);

        const res = await axios.post(
          'http://localhost:4006/media/confirm-review',
          { publicIds },
        );

        const medias = res.data.map(m =>
          queryRunner.manager.create(ReviewMedia, {
            url: m.url,
            publicId: m.publicId,
            type: 'image',
            review: savedReview,
          }),
        );

        await queryRunner.manager.save(medias);
      }

      await queryRunner.commitTransaction();

      return savedReview;

    } catch (error) {

      await queryRunner.rollbackTransaction();

      if (error.response) {
        throw new BadRequestException(
          error.response.data.message,
        );
      }

      throw new InternalServerErrorException(
        'Media service unavailable',
      );

    } finally {
      await queryRunner.release();
    }
  }

  async getReviews(productLineId: number) {
    return this.reviewRepo.find({
      where: { productLineId },
      relations: ['medias'],
      order: { createdAt: 'DESC' },
    });
  }
}