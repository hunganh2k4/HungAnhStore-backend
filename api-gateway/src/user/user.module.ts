import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [HttpModule],
  controllers: [UserController, AddressController],
  providers: [UserService, AddressService],
})
export class UserModule { }