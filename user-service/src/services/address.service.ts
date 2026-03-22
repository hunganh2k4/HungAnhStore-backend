import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/address.entity';
import { User } from '../entities/user.entity';
import { CreateAddressDto } from '../dto/CreateAddressDto';
import { AddressType } from '../entities/address.entity';
import { UpdateAddressDto } from '../dto/UpdateAddressDto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  // ===============================
  // CREATE
  // ===============================
  async createAddress(userId: string, data: CreateAddressDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId, deleted: false },
    });

    if (!user) throw new NotFoundException('User not found');

    const count = await this.addressRepo.count({
      where: { user: { id: userId } },
    });

    const address = this.addressRepo.create({
      address: data.address,
      type: data.type || AddressType.HOME,
      user,
      isDefault: count === 0,
    });

    return this.addressRepo.save(address);
  }

  // ===============================
  // GET ALL
  // ===============================
  async getAddresses(userId: string) {
    return this.addressRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC' },
    });
  }

  // ===============================
  // UPDATE
  // ===============================
  async updateAddress(
    userId: string,
    addressId: string,
    body: UpdateAddressDto,
  ) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (body.address !== undefined) {
      address.address = body.address;
    }

    if (body.type !== undefined) {
      address.type = body.type;
    }

    if (body.isDefault) {
      await this.addressRepo.update(
        { user: { id: userId } },
        { isDefault: false },
      );
      address.isDefault = true;
    }

    return this.addressRepo.save(address);
  }

  // ===============================
  // DELETE
  // ===============================
  async deleteAddress(userId: string, addressId: string) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const wasDefault = address.isDefault;

    await this.addressRepo.remove(address);

    // nếu xoá default → set cái khác làm default
    if (wasDefault) {
      const another = await this.addressRepo.findOne({
        where: { user: { id: userId } },
      });

      if (another) {
        another.isDefault = true;
        await this.addressRepo.save(another);
      }
    }

    return { message: 'Address deleted' };
  }

  // ===============================
  // SET DEFAULT
  // ===============================
  async setDefaultAddress(userId: string, addressId: string) {
    await this.addressRepo.update(
      { user: { id: userId } },
      { isDefault: false },
    );

    const result = await this.addressRepo.update(
      { id: addressId, user: { id: userId } },
      { isDefault: true },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Address not found');
    }

    return { message: 'Default updated' };
  }

  // ===============================
  // GET DEFAULT
  // ===============================
  async getDefaultAddress(userId: string) {
    return this.addressRepo.findOne({
      where: {
        user: { id: userId },
        isDefault: true,
      },
    });
  }
}