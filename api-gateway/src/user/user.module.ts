import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';

@Module({
  imports: [HttpModule],
  controllers: [UserController, AddressController, FavoriteController],
  providers: [UserService, AddressService, FavoriteService],
})
export class UserModule { }