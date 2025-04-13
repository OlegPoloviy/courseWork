import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UserDTO } from './DTO/user.dto';
import { JWTGUard } from 'src/auth/guards/jwt.auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JWTGUard)
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return await this.userService.findUserById(id);
  }

  @Post('update')
  async updateUserInfo(@Body() UserDto: UserDTO) {
    const { email, name, avatar } = UserDto;
    return await this.userService.updateUser(
      email ?? undefined,
      name ?? undefined,
      avatar ?? undefined,
    );
  }

  @Get()
  async getUserByEmail(@Query('email') email: string) {
    console.log(`Received request for email: ${email}`);
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return await this.userService.findUserByEmail(email);
  }

  // @Get()
  // async getUsers() {
  //   return this.userService.findAllUsers();
  // }

  // @Post()
  // async createUser(@Body() UserDTO) {
  //   const { email, name, password } = UserDTO;
  //   return this.userService.createUser(email, name, password);
  // }

  // @Post('find')
  // async findUser(@Body() UserDTO) {
  //   const { email } = UserDTO;
  //   return this.userService.findUserByEmail(email);
  // }

  // @Post('login')
  // async login(@Body() UserDTO) {
  //   const { email, password } = UserDTO;
  //   return this.userService.login(email, password);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // async getUserProfile(@Req() req) {
  //   return this.userService.findUserById(req.user.userId);
  // }
}
