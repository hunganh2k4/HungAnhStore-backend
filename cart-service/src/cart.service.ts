import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private itemRepo: Repository<CartItem>,
  ) {}

  async getCart(userId: string) {
    return this.cartRepo.findOne({
      where: { userId },
      relations: ['items'],
    });
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    let cart = await this.cartRepo.findOne({ where: { userId } });

    if (!cart) {
      cart = await this.cartRepo.save({ userId });
    }

    let item = await this.itemRepo.findOne({
      where: {
        cart: { id: cart.id },
        productId: dto.productId,
      },
      relations: ['cart'],
    });

    if (item) {
      item.quantity += dto.quantity;
      return this.itemRepo.save(item);
    }

    item = this.itemRepo.create({
      cart,
      productId: dto.productId,
      quantity: dto.quantity,
      priceSnapshot: dto.priceSnapshot,
      productNameSnapshot: dto.productNameSnapshot,
      imageSnapshot: dto.imageSnapshot,
    });

    return this.itemRepo.save(item);
  }

  async removeItem(itemId: number) {
    return this.itemRepo.delete(itemId);
  }
}