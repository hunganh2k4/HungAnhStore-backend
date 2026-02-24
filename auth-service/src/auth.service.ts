import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly http: HttpService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(email: string, password: string) {
    try {
      // 1️⃣ Hash password
      const hashed = await bcrypt.hash(password, 10);

      // 2️⃣ Gọi user-service
      const { data: user } = await firstValueFrom(
        this.http.post(
          'http://localhost:4003/internal/users',
          {
            email,
            password: hashed,
          },
        ),
      );

      // 3️⃣ Tạo verify token
      const verifyToken = this.jwtService.sign({
        userId: user.id,
      });

      // 4️⃣ Gửi mail (KHÔNG await để tránh chậm)
      this.mailService
        .sendVerifyEmail(email, verifyToken)
        .catch((err) =>
          console.error('Send mail error:', err),
        );

      // 5️⃣ Trả về ngay
      return {
        message:
          'Register success. Please check email to verify.',
      };
    } catch (err: any) {
      console.error('Register error:', err?.response?.data || err.message);

      throw new BadRequestException(
        err?.response?.data?.message ||
          err.message ||
          'Register failed',
      );
    }
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      await firstValueFrom(
        this.http.put(
          `http://localhost:4003/internal/users/${payload.userId}/enable`,
        ),
      );

      return { message: 'Email verified successfully' };
    } catch (err) {
      throw new BadRequestException(
        'Invalid or expired token',
      );
    }
  }
}