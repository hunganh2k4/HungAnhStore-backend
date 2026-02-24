import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.email,
      dto.password,
    );
  }

  @Get('verify')
  verify(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ===============================
  // LOGIN
  // ===============================
  @Post('login')
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }

  // ===============================
  // REFRESH TOKEN
  // ===============================
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  // ===============================
  // LOGOUT
  // ===============================
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: { userId: string }) {
    return this.authService.logout(user.userId);
  }
}