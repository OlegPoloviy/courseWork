import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { UserDTO } from 'src/user/DTO/user.dto';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  async createUser(@Body() UserDTO) {
    const { email, name, password } = UserDTO;

    const user = await this.userService.createUser(email, name, password);
    return user;
  }

  @Post('login')
  async login(@Body() UserDTO) {
    const { email, password } = UserDTO;

    return await this.authService.login(email, password);
  }

  // @Post('refresh')
  // async refresh(
  //   @Req() request: Request,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   const refreshToken = request.cookies['refresh_token'];

  //   if (!refreshToken) {
  //     throw new UnauthorizedException('No refresh token provided');
  //   }

  //   const { access_token, refresh_token } =
  //     await this.authService.refreshTokens(refreshToken);

  //   response.cookie('refresh_token', refresh_token, {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === 'production',
  //     maxAge: 7 * 24 * 60 * 60 * 1000,
  //     path: '/',
  //   });
  // }

  // @Post('logout')
  // @HttpCode(HttpStatus.OK)
  // async logout(
  //   @Req() request: Request,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   const refreshToken = request.cookies['refresh_token'];
  //   if (refreshToken) {
  //     await this.authService.logout(refreshToken);
  //   }

  //   response.clearCookie('refresh_token', {
  //     path: '/',
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === 'production',
  //   });

  //   return { message: 'Logout successful' };
  // }
}
