import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';

@Controller('favorites')
export class FavoriteController {
  constructor(private readonly service: FavoriteService) {}

  @Post()
  addFavorite(
    @Body() body: { productId: number },
    @Headers('authorization') authHeader: string,
  ) {
    return this.service.addFavorite(body.productId, authHeader);
  }

  @Delete(':productId')
  removeFavorite(
    @Param('productId') productId: number,
    @Headers('authorization') authHeader: string,
  ) {
    return this.service.removeFavorite(Number(productId), authHeader);
  }

  @Get('my-favorites')
  getMyFavorites(@Headers('authorization') authHeader: string) {
    return this.service.getMyFavorites(authHeader);
  }
}
