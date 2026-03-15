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
import axios from 'axios';
import { RedisService } from '../redis/redis.service';

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

    private readonly redisService: RedisService,
  ) { }

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
      videoReviewUrl: data.videoReviewUrl,
      contentHtml: data.contentHtml,
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

    await this.redisService.delByPattern('products:all:*');
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

    const cacheKey = `products:all:${page}:${limit}:${brand || ''}:${category || ''}:${search || ''}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const qb = this.productLineRepo
      .createQueryBuilder('product_lines')
      .leftJoinAndSelect('product_lines.category', 'category')
      .leftJoinAndSelect('product_lines.brand', 'brand')
      .leftJoinAndSelect(
        'product_lines.images',
        'images',
        'images.isMain = :isMain',
        { isMain: true },
      )
      .leftJoinAndSelect('product_lines.products', 'products')

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
      qb.andWhere('product_lines.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    // =============================
    // PAGINATION
    // =============================
    qb.skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    // Lấy tất cả productIds:
    const productIds = data
      .flatMap(pl => pl.products)
      .map(p => p.id);

    const response = await axios.get(
      'http://localhost:4004/inventory/bulk',
      {
        params: {
          ids: productIds.join(','),
        },
      },
    );

    const inventories = response.data;

    const stockMap = new Map(
      inventories.map(inv => [inv.productId, inv.available]),
    );

    type ProductWithStock = Product & { stock: number };

    data.forEach(pl => {
      pl.products = pl.products.map(p => ({
        ...p,
        stock: stockMap.get(p.id) ?? 0,
      })) as ProductWithStock[];
    });

    const result = {
      data,
      total,
      page: Number(page),
      lastPage: Math.ceil(total / limit),
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 60); // 1 minute for list
    return result;
  }

  // =============================
  // CATEGORIES
  // =============================
  async findAllCategories() {
    const cacheKey = 'categories:all';
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const categories = await this.categoryRepo.find();
    await this.redisService.set(cacheKey, JSON.stringify(categories), 1800); // 30 minutes
    return categories;
  }

  // =============================
  // ADD PRODUCT TO PRODUCT LINE
  // =============================
  async addProduct(productLineId: number, data: any) {
    const productLine = await this.productLineRepo.findOne({
      where: { id: productLineId },
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

    const savedProduct = await this.productRepo.save(product);
    await this.redisService.del(`products:id:${productLineId}`);
    await this.redisService.del(`products:slug:${productLine.slug}`);
    await this.redisService.delByPattern('products:all:*');
    return savedProduct;
  }

  // =============================
  // FIND ONE PRODUCT LINE
  // =============================
  async findOneProductLine(id: number) {
    const cacheKey = `products:id:${id}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const productLine = await this.productLineRepo.findOne({
      where: { id },
      relations: ['category', 'brand', 'images', 'products', 'attributes'],
    });

    if (!productLine) {
      throw new NotFoundException('Product Line not found');
    }

    // Lấy productIds
    const productIds = productLine.products.map(p => p.id);

    // Gọi inventory-service
    const response = await axios.get(
      'http://localhost:4004/inventory/bulk',
      {
        params: { ids: productIds.join(',') },
      },
    );

    const inventories = response.data;

    const stockMap = new Map(
      inventories.map(inv => [inv.productId, inv.available]),
    );

    const result = {
      ...productLine,
      products: productLine.products.map(p => ({
        ...p,
        stock: stockMap.get(p.id) ?? 0,
      })),
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 600); // 10 minutes for detail

    return result;
  }

  // =============================
  // UPDATE
  // =============================
  async updateProductLine(id: number, data: any) {
    const product = await this.findOneProductLine(id);

    Object.assign(product, data);

    const saved = await this.productLineRepo.save(product);
    await this.redisService.del(`products:id:${id}`);
    await this.redisService.del(`products:slug:${product.slug}`);
    await this.redisService.delByPattern('products:all:*');
    return saved;
  }

  // =============================
  // DELETE
  // =============================
  async removeProductLine(id: number) {
    const product = await this.findOneProductLine(id);
    const result = await this.productLineRepo.remove(product);
    await this.redisService.del(`products:id:${id}`);
    await this.redisService.del(`products:slug:${product.slug}`);
    await this.redisService.delByPattern('products:all:*');
    return result;
  }

  async findProductLineBySlug(slug: string) {
    const cacheKey = `products:slug:${slug}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const productLine = await this.productLineRepo.findOne({
      where: { slug },
      relations: ['category', 'brand', 'images', 'products', 'attributes'],
    });

    if (!productLine) {
      throw new NotFoundException('Product Line not found');
    }

    const productIds = productLine.products.map(p => p.id);

    // gọi inventory-service
    const response = await axios.get(
      'http://localhost:4004/inventory/bulk',
      {
        params: {
          ids: productIds.join(','),
        },
      },
    );

    const inventories = response.data;

    const stockMap = new Map(
      inventories.map(inv => [inv.productId, inv.available]),
    );

    const result = {
      ...productLine,
      products: productLine.products.map(p => ({
        ...p,
        stock: stockMap.get(p.id) ?? 0,
      })),
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 600); // 10 minutes for detail

    return result;
  }

  // =============================
  // CACHE CONTROL
  // =============================
  async clearCache() {
    await this.redisService.delByPattern('products:*');
    await this.redisService.delByPattern('categories:*');
    return { message: 'Product cache cleared successfully' };
  }

}
