import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './services/user.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ===============================
  // PUBLIC ROUTE
  // ===============================
  // Check email tồn tại hay không
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  // ===============================
  // PRIVATE ROUTES (Admin hoặc System)
  // ===============================

  // Tạo user mới (Admin hoặc System)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SYSTEM')
  @Post()
  create(@Body() body: any) {
    console.log('Create user with name:', body.name);
    return this.userService.createUser(
      body.email,
      body.password,
      body.name,
    );
  }

  // Lấy raw user (dùng login)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM')
  @Get('raw/:email')
  findRawByEmail(@Param('email') email: string) {
    return this.userService.findRawByEmail(email);
  }

  // Lấy user theo id (Admin hoặc System)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SYSTEM')
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  // Enable user (verify email) (System token hoặc Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM', 'ADMIN')
  @Put(':id/enable')
  enable(@Param('id') id: string) {
    return this.userService.enableUser(id);
  }

  // ===============================
  // ME - lấy thông tin user hiện tại
  // ===============================
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: { id: string }) {
    return this.userService.findById(user.id); 
  }
}