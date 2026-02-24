import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('internal/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ===============================
  // CREATE USER (Auth service gọi)
  // ===============================
  @Post()
  create(@Body() body: any) {
    return this.userService.createUser(
      body.email,
      body.password,
    );
  }

  // ===============================
  // FIND USER BY EMAIL
  // ===============================
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  // ===============================
  // ENABLE USER
  // ===============================
  @Put(':id/enable')
  enable(@Param('id') id: string) {
    return this.userService.enableUser(id);
  }
}