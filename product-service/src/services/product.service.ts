import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';
import { ProductImage } from '../entities/product-image.entity';
import { StockMovement, StockType } from '../entities/stock-movement.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,

    @InjectRepository(StockMovement)
    private readonly stockRepo: Repository<StockMovement>,

    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,

    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.productRepo.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }

  // =============================
  // CREATE PRODUCT
  // =============================
  async create(data: any) {
    const category = await this.categoryRepo.findOne({
      where: { id: data.categoryId },
    });

    const brand = await this.brandRepo.findOne({
      where: { id: data.brandId },
    });

    if (!category || !brand) {
      throw new BadRequestException('Invalid category or brand');
    }

    const slug = await this.generateUniqueSlug(data.name);

    // Tạo product 
    const product = this.productRepo.create({
      name: data.name,
      slug: slug,
      description: data.description,
      price: data.price,
      category,
      brand,
    });

    const savedProduct = await this.productRepo.save(product);

    // Tạo images nếu có
    if (data.images?.length) {
      const images = data.images.map(img =>
        this.imageRepo.create({
          imageUrl: img.imageUrl,
          isMain: img.isMain ?? false,
          product: savedProduct,
        }),
      );

      await this.imageRepo.save(images);
    }

    // Load lại full data
    const result = await this.productRepo.findOne({
      where: { id: savedProduct.id },
      relations: ['category', 'brand', 'images'],
    });

    return result;
  }

  // =============================
  // FIND ALL + FILTER + PAGINATION
  // =============================
  async findAll(query: any) {
    const { page = 1, limit = 10, categoryId, brandId, search } = query;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect(
        'product.images',
        'images',
        'images.isMain = :isMain',
        { isMain: true },
      );

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }

    if (brandId) {
      qb.andWhere('brand.id = :brandId', { brandId });
    }

    if (search) {
      qb.andWhere('product.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    // qb.addSelect(subQuery => {
    //   return subQuery
    //     .select(`
    //       SUM(
    //         CASE 
    //           WHEN stock.type = 'IN' THEN stock.quantity
    //           WHEN stock.type = 'OUT' THEN -stock.quantity
    //           ELSE 0
    //         END
    //       )
    //     `)
    //     .from(StockMovement, 'stock')
    //     .where('stock.productId = product.id');
    // }, 'totalStock');

    qb.skip((page - 1) * limit).take(limit);

    const { entities, raw } = await qb.getRawAndEntities();

    const data = entities.map((item, index) => ({
      ...item,
      stock: Number(raw[index].totalStock) || 0,
    }));

    const total = await qb.getCount();

    return {
      data,
      total,
      page: Number(page),
      lastPage: Math.ceil(total / limit),
    };
  }

  // =============================
  // FIND ONE
  // =============================
  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: [
        'category',
        'brand',
        'images',
        'variants',
      ],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // =============================
  // UPDATE
  // =============================
  async update(id: number, data: any) {
    const product = await this.findOne(id);

    Object.assign(product, data);

    return this.productRepo.save(product);
  }

  // =============================
  // DELETE
  // =============================
  async remove(id: number) {
    const product = await this.findOne(id);
    return this.productRepo.remove(product);
  }

  // =============================
  // STOCK IN
  // =============================
  async stockIn(productId: number, quantity: number) {
    const product = await this.findOne(productId);

    product.variants?.forEach(v => {
      v.stock += 0; // nếu dùng variant riêng
    });

    await this.stockRepo.save({
      product,
      type: StockType.IN,
      quantity,
    });

    return { message: 'Stock added successfully' };
  }

  // =============================
  // STOCK OUT
  // =============================
  async stockOut(productId: number, quantity: number) {
    const product = await this.findOne(productId);

    const totalStock = product.variants?.reduce(
      (sum, v) => sum + v.stock,
      0,
    ) || 0;

    if (totalStock < quantity) {
      throw new BadRequestException('Not enough stock');
    }

    await this.stockRepo.save({
      product,
      type: StockType.OUT,
      quantity,
    });

    return { message: 'Stock out successfully' };
  }
}