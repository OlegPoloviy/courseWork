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
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO } from 'src/user/DTO/user.dto';
import { UserService } from 'src/user/user.service';
import { RefreshJwtGUard } from './guards/jwt.refresh.guard';

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
    console.log('LOGIN REQUEST:', UserDTO);
    return await this.authService.login(UserDTO.email, UserDTO.password);
  }

  @UseGuards(RefreshJwtGUard)
  @Post('refresh')
  async refresh(@Request() req) {
    return await this.authService.refreshToken(req.user);
  }
}
