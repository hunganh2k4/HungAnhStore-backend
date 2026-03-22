import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  Param,
} from '@nestjs/common';
import { FavoriteService } from '../services/favorite.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly service: FavoriteService) { }

  // =========================
  // ADD FAVORITE
  // =========================
  @Post()
  addFavorite(
    @CurrentUser() user: { userId: string },
    @Body() body: { productId: number },
  ) {
    return this.service.addFavorite(user.userId, body.productId);
  }

  // =========================
  // REMOVE FAVORITE
  // =========================
  @Delete(':productId')
  removeFavorite(
    @CurrentUser() user: { userId: string },
    @Param('productId') productId: number,
  ) {
    return this.service.removeFavorite(user.userId, Number(productId));
  }

  // =========================
  // GET MY FAVORITES
  // =========================
  @Get('my-favorites')
  getMyFavorites(@CurrentUser() user: { userId: string }) {
    return this.service.getMyFavorites(user.userId);
  }
}