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
    const {
      page = 1,
      limit = 10,
      brand,
      category,
      search,
    } = query;

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

    // =============================
    // FILTER BRAND BY SLUG
    // =============================
    if (brand) {
      qb.andWhere('brand.slug = :brandSlug', {
        brandSlug: brand,
      });
    }

    // =============================
    // FILTER CATEGORY BY SLUG
    // =============================
    if (category) {
      qb.andWhere('category.slug = :categorySlug', {
        categorySlug: category,
      });
    }

    // =============================
    // SEARCH BY PRODUCT NAME
    // =============================
    if (search) {
      qb.andWhere('product.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    // =============================
    // PAGINATION
    // =============================
    qb.skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      lastPage: Math.ceil(total / limit),
    };
  }


  // =============================
  // ADD VARIANT
  // =============================
  async addVariant(productId: number, data: any) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Kiểm tra SKU trùng
    const existingSku = await this.variantRepo.findOne({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new BadRequestException('SKU already exists');
    }

    const variant = this.variantRepo.create({
      sku: data.sku,
      color: data.color,
      price: data.price, 
      stock: data.stock ?? 0,
      product,
    });

    return this.variantRepo.save(variant);
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
  async stockIn(variantId: number, quantity: number) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Product in variant not found');
    }

    variant.stock += quantity;
    await this.variantRepo.save(variant);

    return { message: 'Stock added successfully' };
  }

  // =============================
  // STOCK OUT
  // =============================
  async stockOut(variantId: number, quantity: number) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Product in variant not found');
    }

    if (variant.stock < quantity) {
      throw new BadRequestException('Not enough stock');
    }

    variant.stock -= quantity;
    await this.variantRepo.save(variant);

    return { message: 'Stock out successfully' };
  }


}