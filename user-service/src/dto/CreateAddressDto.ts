import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AddressType } from '../entities/address.entity';

export class CreateAddressDto {
  @IsString()
  address: string;

  @IsOptional()
  @IsEnum(AddressType, {
    message: 'type phải là "Nhà" hoặc "Công ty"',
  })
  type?: AddressType;
}