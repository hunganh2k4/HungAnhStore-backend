import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductLine } from '../entities/product-line.entity';
import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';
import { ProductImage } from '../entities/product-image.entity';
// import { StockMovement, StockType } from '../entities/stock-movement.entity';
import { Product } from '../entities/product.entity';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductLine)
    private readonly productLineRepo: Repository<ProductLine>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,

    // @InjectRepository(StockMovement)
    // private readonly stockRepo: Repository<StockMovement>,

    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.productLineRepo.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }

  // =============================
  // CREATE PRODUCT LINE
  // =============================
  async createProductLine(data: any) {
    const category = await this.categoryRepo.findOne({
      where: { slug: data.category },
    });

    const brand = await this.brandRepo.findOne({
      where: { slug: data.brand },
    });

    if (!category || !brand) {
      throw new BadRequestException('Invalid category or brand');
    }
    const slug = await this.generateUniqueSlug(data.name);

    const productLine = this.productLineRepo.create({
      name: data.name,
      slug,
      description: data.description,
      category,
      brand,
    });
    
    const savedProductLine = await this.productLineRepo.save(productLine);

    // Tạo images nếu có
    if (data.images?.length) {
      const images = data.images.map(img =>
        this.imageRepo.create({
          imageUrl: img.imageUrl,
          isMain: img.isMain ?? false,
          productLine: savedProductLine,
        }),
      );

      await this.imageRepo.save(images);
    }

    // Load lại full data
    const result = await this.productLineRepo.findOne({
      where: { id: savedProductLine.id },
      relations: ['category', 'brand', 'images'],
    });

    return result;
  }

  // =============================
  // FIND ALL + FILTER + PAGINATION
  // =============================
  async findAllProductLine(query: any) {
    const {
      page = 1,
      limit = 10,
      brand,
      category,
      search,
    } = query;

    const qb = this.productLineRepo
      .createQueryBuilder('product_lines')
      .leftJoinAndSelect('product_lines.category', 'category')
      .leftJoinAndSelect('product_lines.brand', 'brand')
      .leftJoinAndSelect(
        'product_lines.images',
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
  // ADD PRODUCT TO PRODUCT LINE
  // =============================
  async addProduct(productLineId: number, data: any) {
    const productLine = await this.productLineRepo.findOne({
      where: { id: productLineId },
      relations: ['products'],
    });

    if (!productLine) {
      throw new NotFoundException('Product Line not found');
    }

    // Kiểm tra SKU trùng
    const existingSku = await this.productRepo.findOne({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new BadRequestException('SKU already exists');
    }

    const product = this.productRepo.create({
      sku: data.sku,
      color: data.color,
      price: data.price, 
      imageUrl: data.imageUrl,
      productLine,
    });

    return this.productRepo.save(product);
  }

  // =============================
  // FIND ONE PRODUCT LINE
  // =============================
  async findOneProductLine(id: number) {
    const product = await this.productLineRepo.findOne({
      where: { id },
      relations: [
        'category',
        'brand',
        'images',
        'products',
      ],
    });

    if (!product) {
      throw new NotFoundException('Product Line not found');
    }

    return product;
  }

  // =============================
  // UPDATE
  // =============================
  async updateProductLine(id: number, data: any) {
    const product = await this.findOneProductLine(id);

    Object.assign(product, data);

    return this.productRepo.save(product);
  }

  // =============================
  // DELETE
  // =============================
  async removeProductLine(id: number) {
    const product = await this.findOneProductLine(id);
    return this.productLineRepo.remove(product);
  }

  // =============================
  // STOCK IN
  // =============================
  // async stockIn(productId: number, quantity: number) {
  //   const variant = await this.productRepo.findOne({
  //     where: { id: productId },
  //   });

  //   if (!variant) {
  //     throw new NotFoundException('Product in variant not found');
  //   }

  //   variant.stock += quantity;
  //   await this.variantRepo.save(variant);

  //   return { message: 'Stock added successfully' };
  // }

  // // =============================
  // // STOCK OUT
  // // =============================
  // async stockOut(variantId: number, quantity: number) {
  //   const variant = await this.variantRepo.findOne({
  //     where: { id: variantId },
  //   });

  //   if (!variant) {
  //     throw new NotFoundException('Product in variant not found');
  //   }

  //   if (variant.stock < quantity) {
  //     throw new BadRequestException('Not enough stock');
  //   }

  //   variant.stock -= quantity;
  //   await this.variantRepo.save(variant);

  //   return { message: 'Stock out successfully' };
  // }


}