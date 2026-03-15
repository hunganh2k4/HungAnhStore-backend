import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Review } from '../entities/review.entity';
import { ReviewMedia } from '../entities/review-media.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import axios from 'axios';

@Injectable()
export class ReviewService {

  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,

    @InjectRepository(ReviewMedia)
    private mediaRepo: Repository<ReviewMedia>,

    private dataSource: DataSource,
  ) { }

  async createReview(dto: CreateReviewDto) {
    // Kiểm tra xem user đã review sản phẩm này chưa (trước khi tạo giao dịch)
    const existingReview = await this.reviewRepo.findOne({
      where: {
        productLineId: dto.productLineId,
        userId: dto.userId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tạo Review
      const review = queryRunner.manager.create(Review, {
        productLineId: dto.productLineId,
        userId: dto.userId,
        userName: dto.userName,
        userAvatar: dto.userAvatar,
        rating: dto.rating,
        comment: dto.comment,
      });

      const savedReview = await queryRunner.manager.save(review);

      // Xử lý Media nếu có
      if (dto.medias && dto.medias.length > 0) {
        const publicIds = dto.medias.map(m => m.publicId);

        // Xác nhận media với media-service
        const res = await axios.post(
          'http://localhost:4006/media/confirm-review',
          { publicIds },
        );

        const medias = res.data.map(m =>
          queryRunner.manager.create(ReviewMedia, {
            url: m.url,
            publicId: m.publicId,
            type: 'image', // Hoặc lấy từ media-service nếu cần
            review: savedReview,
          }),
        );

        await queryRunner.manager.save(medias);
      }

      await queryRunner.commitTransaction();
      return savedReview;

    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error.response) {
        throw new BadRequestException(error.response.data.message || 'Lỗi từ Media Service');
      }

      throw new InternalServerErrorException('Không thể tạo đánh giá lúc này.');

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