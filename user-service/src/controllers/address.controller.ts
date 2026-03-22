import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateAddressDto } from '../dto/CreateAddressDto';
import { UpdateAddressDto } from '../dto/UpdateAddressDto';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) { }

  // ===============================
  // CREATE
  // ===============================
  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() body: CreateAddressDto,
  ) {
    return this.addressService.createAddress(user.id, body);
  }
  // ===============================
  // GET ALL
  // ===============================
  @Get()
  getAll(@CurrentUser() user: { id: string }) {
    return this.addressService.getAddresses(user.id);
  }

  // ===============================
  // UPDATE
  // ===============================
  @Put(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') addressId: string,
    @Body() body: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(
      user.id,
      addressId,
      body,
    );
  }

  // ===============================
  // DELETE
  // ===============================
  @Delete(':id')
  delete(
    @CurrentUser() user: { id: string },
    @Param('id') addressId: string,
  ) {
    return this.addressService.deleteAddress(user.id, addressId);
  }

  // ===============================
  // SET DEFAULT
  // ===============================
  @Post(':id/default')
  setDefault(
    @CurrentUser() user: { id: string },
    @Param('id') addressId: string,
  ) {
    return this.addressService.setDefaultAddress(
      user.id,
      addressId,
    );
  }

  // ===============================
  // GET DEFAULT
  // ===============================
  @Get('default')
  getDefault(@CurrentUser() user: { id: string }) {
    return this.addressService.getDefaultAddress(user.id);
  }
}