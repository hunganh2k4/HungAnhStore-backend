import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';

@Controller()
export class CartConsumer {
  constructor(private readonly cartService: CartService) {}

  @EventPattern('cart.clear')
  async handleCartClear(@Payload() data: { userId?: string }) {
    console.log('Cart clear event received in cart-service:', data);
    if (data.userId) {
      await this.cartService.clearCart(data.userId);
      console.log(`Cart cleared for user ${data.userId}`);
    } else {
      console.warn('Cart clear event received without userId, cannot clear cart');
    }
  }
}
