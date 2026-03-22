import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { Address } from './entities/address.entity';
import { AddressController } from './controllers/address.controller';
import { AddressService } from './services/address.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Address,
    ]),
  ],
  controllers: [UserController, AddressController],
  providers: [UserService, AddressService],
  exports: [UserService],
})
export class UserModule { }