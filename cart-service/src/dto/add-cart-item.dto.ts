export class AddCartItemDto {
  productId: number;
  quantity: number;

  priceSnapshot: number;
  productNameSnapshot: string;
  imageSnapshot: string;
}