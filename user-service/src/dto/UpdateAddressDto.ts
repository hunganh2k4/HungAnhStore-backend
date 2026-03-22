import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { AddressType } from '../entities/address.entity';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(AddressType, {
    message: 'type phải là "Nhà" hoặc "Công ty"',
  })
  type?: AddressType;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}