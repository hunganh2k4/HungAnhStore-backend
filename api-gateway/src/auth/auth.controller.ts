import {
  Controller,
  Post,
  Body,
  Headers,
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
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('refresh')
  refresh(@Body() body: any) {
    return this.authService.refresh(body);
  }

  @Post('logout')
  logout(@Headers('authorization') token: string) {
    return this.authService.logout(token);
  }
}