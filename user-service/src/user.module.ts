import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { Address } from './entities/address.entity';
import { AddressController } from './controllers/address.controller';
import { AddressService } from './services/address.service';
import { Favorite } from './entities/favorite.entity';
import { FavoriteController } from './controllers/favorite.controller';
import { FavoriteService } from './services/favorite.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Address,
      Favorite,
    ]),
  ],
  controllers: [UserController, AddressController, FavoriteController],
  providers: [UserService, AddressService, FavoriteService],
  exports: [UserService],
})
export class UserModule { }