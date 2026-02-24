import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailService } from './mail.service';
import { RedisService } from './redis/redis.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),

    HttpModule,
    PassportModule,

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_ACCESS_SECRET');
        const expires = config.get<string>('ACCESS_TOKEN_EXPIRES') as any;

        if (!secret || !expires) {
          throw new Error('JWT config missing in .env');
        }

        return {
          secret,
          signOptions: {
            expiresIn: expires,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, RedisService, JwtStrategy,JwtAuthGuard],
})
export class AuthModule {}