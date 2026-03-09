import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Res,
  Req,
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
      dto.name,
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
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: any,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(email, password);

    // Set HttpOnly cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { accessToken , user };
  }

  // ===============================
  // REFRESH TOKEN
  // ===============================
  @Post('refresh')
  refresh(@Req() req: any) {
    const refreshToken = req.cookies.refreshToken;
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


  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: { userId: string }) {
    console.log('Getting profile for user ID:', user.userId);
    // Gọi user-service lấy thông tin user công khai (không trả password)
    return this.authService.getUserProfile(user.userId);
  }
}