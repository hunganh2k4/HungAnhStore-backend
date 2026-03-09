import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.serivce';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(
    @Body() body: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const response = await this.authService.login(body);

    if (response?.cookies) {
      res.setHeader('Set-Cookie', response.cookies);
    }

    return response?.data;
  }

  @Post('refresh')
  refresh(@Req() req: any) {
    // console.log('Received refresh request with cookies:', req.headers.cookie);
    return this.authService.refresh(req.headers.cookie);
  }

  @Post('logout')
  logout(@Headers('authorization') token: string) {
    return this.authService.logout(token);
  }

  @Get('verify')
  verify(@Query('token') token: string) {
    return this.authService.verify(token);
  }

  @Get('me')
  async me(@Headers('authorization') authHeader: string) {
    // Chuyển token lên Auth Service
    return this.authService.getProfile(authHeader);
  }

}