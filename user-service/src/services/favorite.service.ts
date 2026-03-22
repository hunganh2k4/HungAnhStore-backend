import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import axios from 'axios';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly repo: Repository<Favorite>,
  ) { }

  // =========================
  // ADD FAVORITE
  // =========================
  async addFavorite(userId: string, productId: number) {
    const exists = await this.repo.findOne({
      where: { userId, productId },
    });

    if (exists) {
      throw new BadRequestException('Product already in favorites');
    }

    return this.repo.save({
      userId,
      productId,
    });
  }

  // =========================
  // REMOVE FAVORITE
  // =========================
  async removeFavorite(userId: string, productId: number) {
    return this.repo.delete({
      userId,
      productId,
    });
  }

  // =========================
  // GET MY FAVORITES (raw)
  // =========================
  async getMyFavorites(userId: string) {
    const favorites = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const productIds = favorites.map(f => f.productId);

    if (productIds.length === 0) {
      return [];
    }

    const response = await axios.get(
      'http://localhost:4002/product-lines/bulk',
      {
        params: {
          ids: productIds.join(','),
        },
      },
    );

    const products = response.data;

    const productMap = new Map(
      products.map((p: any) => [p.id, p]),
    );

    return favorites.map(f => ({
      id: f.id,
      createdAt: f.createdAt,
      product: productMap.get(f.productId) || null,
    }));
  }

  // =========================
  async getFavoriteProductIds(userId: string) {
    const list = await this.repo.find({
      where: { userId },
    });

    return list.map((item) => item.productId);
  }
}