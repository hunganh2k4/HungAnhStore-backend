import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  // ===============================
  // CREATE USER (internal)
  // ===============================
  async createUser(email: string, password: string, name: string) {
    const existing = await this.repo.findOne({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const user = this.repo.create({
      email,
      password,
      name,
      avatar: null,
      enable: false,
      deleted: false,
    });

    const saved = await this.repo.save(user);

    return this.removePassword(saved);
  }

  // ===============================
  // FIND BY EMAIL
  // ===============================
  async findByEmail(email: string) {
    const user = await this.repo.findOne({
      where: { email, deleted: false },
    });

    if (!user) return null;

    return this.removePassword(user);
  }

  // ===============================
  // INTERNAL: GET RAW USER (for auth)
  // ===============================
  async findRawByEmail(email: string) {
    const user = await this.repo.findOne({
      where: { email, deleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ===============================
  // ENABLE USER (verify email)
  // ===============================
  async enableUser(id: string) {
    const user = await this.repo.findOne({
      where: { id, deleted: false },
    });

    if (!user) throw new NotFoundException('User not found');

    user.enable = true;

    await this.repo.save(user);

    return { message: 'User enabled' };
  }
  private removePassword(user: User) {
    const { password, ...result } = user;
    return result;
  }
}