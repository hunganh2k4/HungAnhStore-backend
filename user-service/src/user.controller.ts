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

  // CREATE USER
  @Post()
  create(@Body() body: any) {
    return this.userService.createUser(
      body.email,
      body.password,
    );
  }

  // PUBLIC: KHÔNG trả password
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  // INTERNAL: trả password cho Auth login
  @Get('raw/:email')
  findRawByEmail(@Param('email') email: string) {
    return this.userService.findRawByEmail(email);
  }

  @Put(':id/enable')
  enable(@Param('id') id: string) {
    return this.userService.enableUser(id);
  }
}