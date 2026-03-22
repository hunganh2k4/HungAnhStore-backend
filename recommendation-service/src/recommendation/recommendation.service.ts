import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecommendationService {
  private readonly productDb: string;
  private readonly orderDb: string;

  constructor(
    @InjectDataSource('productConnection')
    private productDataSource: DataSource,
    @InjectDataSource('orderConnection')
    private orderDataSource: DataSource,
    private configService: ConfigService,
  ) {
    this.productDb = this.configService.get<string>('DB_PRODUCT_NAME') || 'product_db';
    this.orderDb = this.configService.get<string>('DB_ORDER_NAME') || 'order_db';
  }

  async getTrendingProducts() {
    const query = `
      SELECT pl.id as product_line_id, pl.name, SUM(oi.quantity) AS total_sales
      FROM ${this.orderDb}.order_item oi
      JOIN ${this.productDb}.products p ON oi.productId = p.id
      JOIN ${this.productDb}.product_lines pl ON p.productLineId = pl.id
      JOIN ${this.orderDb}.\`order\` o ON oi.orderId = o.id
      WHERE o.createdAt >= NOW() - INTERVAL 7 DAY
      GROUP BY pl.id, pl.name
      ORDER BY total_sales DESC
      LIMIT 10;
    `;
    return this.orderDataSource.query(query);
  }

  async getSimilarProducts(productLineId: number) {
    // Logic: 
    // 1. Tìm cùng Category (Bắt buộc)
    // 2. Ưu tiên cùng Thương hiệu (Brand)
    // 3. Sắp xếp theo giá gần nhất (Price similarity)
    const query = `
      WITH target_pl AS (
        SELECT categoryId, brandId, (SELECT AVG(price) FROM ${this.productDb}.products WHERE productLineId = ?) as avg_price
        FROM ${this.productDb}.product_lines
        WHERE id = ?
      )
      SELECT 
        pl_other.*, 
        MIN(p_other.price) as min_price,
        ABS(MIN(p_other.price) - (SELECT avg_price FROM target_pl)) as price_diff,
        (pl_other.brandId = (SELECT brandId FROM target_pl)) as same_brand
      FROM ${this.productDb}.product_lines pl_other
      JOIN ${this.productDb}.products p_other ON pl_other.id = p_other.productLineId
      CROSS JOIN target_pl
      WHERE pl_other.categoryId = target_pl.categoryId
      AND pl_other.id != ?
      GROUP BY pl_other.id
      ORDER BY same_brand DESC, price_diff ASC
      LIMIT 8;
    `;
    return this.productDataSource.query(query, [productLineId, productLineId, productLineId]);
  }

  async getRecommendedForUser(userId: string) {
    const improvedQuery = `
      SELECT pl_other.id as product_line_id, pl_other.name, COUNT(DISTINCT o_other.userId) AS score
      FROM ${this.productDb}.product_lines pl_my
      JOIN ${this.productDb}.products p_my ON pl_my.id = p_my.productLineId
      JOIN ${this.orderDb}.order_item oi_my ON p_my.id = oi_my.productId
      JOIN ${this.orderDb}.\`order\` o_my ON oi_my.orderId = o_my.id
      
      JOIN ${this.orderDb}.order_item oi_shared ON oi_my.productId = oi_shared.productId
      JOIN ${this.orderDb}.\`order\` o_other ON oi_shared.orderId = o_other.id
      
      JOIN ${this.orderDb}.order_item oi_other_bought ON o_other.id = oi_other_bought.orderId
      JOIN ${this.productDb}.products p_other ON oi_other_bought.productId = p_other.id
      JOIN ${this.productDb}.product_lines pl_other ON p_other.productLineId = pl_other.id
      
      WHERE o_my.userId = ?
      AND o_other.userId != ?
      AND pl_other.id NOT IN (
          SELECT p.productLineId
          FROM ${this.orderDb}.order_item oi
          JOIN ${this.orderDb}.\`order\` o ON oi.orderId = o.id
          JOIN ${this.productDb}.products p ON oi.productId = p.id
          WHERE o.userId = ?
      )
      GROUP BY pl_other.id, pl_other.name
      ORDER BY score DESC
      LIMIT 10;
    `;
    const results = await this.orderDataSource.query(improvedQuery, [userId, userId, userId]);

    // Fallback: Nếu user chưa mua gì, trả về Trending Products
    if (!results || results.length === 0) {
      console.log("Fallback to trending products");
      return this.getTrendingProducts();
    }

    return results;
  }
}
