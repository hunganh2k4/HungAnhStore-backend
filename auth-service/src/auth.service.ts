import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from './mail.service';
import { RedisService } from './redis/redis.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly http: HttpService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly redisService: RedisService,

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

  // ===============================
  // LOGIN
  // ===============================
  async login(email: string, password: string) {
    console.log('Login attempt for:', email);
    const { data: user } = await firstValueFrom(
      this.http.get(
        `http://localhost:4003/internal/users/raw/${email}`,
      ),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.enable) {
      throw new UnauthorizedException(
        'Please verify email first',
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Lưu refresh token vào Redis (7 ngày)
    await this.redisService.set(
      `refresh:${user.id}`,
      refreshToken,
      60 * 60 * 24 * 7,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  // ===============================
  // REFRESH TOKEN
  // ===============================
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    try {
      const payload = this.jwtService.verify(
        refreshToken,
        { secret: process.env.JWT_REFRESH_SECRET },
      );

      const storedToken =
        await this.redisService.get(
          `refresh:${payload.userId}`,
        );

      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException(
          'Invalid refresh token',
        );
      }

      const newAccessToken =
        this.generateAccessToken(payload.userId);

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }
  }

  // ===============================
  // LOGOUT
  // ===============================
  async logout(userId: string) {
    await this.redisService.del(`refresh:${userId}`);
    return { message: 'Logged out successfully' };
  }



  // ===============================
  // TOKEN GENERATORS
  // ===============================
  private generateAccessToken(userId: string) {
    return this.jwtService.sign(
      { userId },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' as any,
      },
    );
  }

  private generateRefreshToken(userId: string) {
    return this.jwtService.sign(
      { userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn:
          process.env.REFRESH_TOKEN_EXPIRES || '7d' as any,
      },
    );
  }
}