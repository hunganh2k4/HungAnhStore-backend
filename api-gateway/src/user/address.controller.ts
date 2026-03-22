import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Headers,
} from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) { }

  // CREATE
  @Post()
  create(
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.addressService.createAddress(authHeader, body);
  }

  // GET ALL
  @Get()
  getAll(
    @Headers('authorization') authHeader: string,
  ) {
    return this.addressService.getAddresses(authHeader);
  }

  // UPDATE
  @Put(':id')
  update(
    @Param('id') addressId: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.addressService.updateAddress(authHeader, addressId, body);
  }

  // DELETE
  @Delete(':id')
  delete(
    @Param('id') addressId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.addressService.deleteAddress(authHeader, addressId);
  }

  // SET DEFAULT
  @Post(':id/default')
  setDefault(
    @Param('id') addressId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.addressService.setDefaultAddress(authHeader, addressId);
  }

  // GET DEFAULT
  @Get('default')
  getDefault(
    @Headers('authorization') authHeader: string,
  ) {
    return this.addressService.getDefaultAddress(authHeader);
  }
}