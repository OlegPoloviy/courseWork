import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import { UserDTO } from 'src/user/DTO/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{
    user: UserDTO;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    try {
      const existingUser = await this.userService.findUserByEmail(email);
      const payload = {
        username: existingUser.email,
        sub: {
          name: existingUser.name,
        },
      };
      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const valid = await bcrypt.compare(password, existingUser.password);

      if (!valid) {
        throw new UnauthorizedException('Invalid password');
      }

      const { password: userPassword, ...user } = existingUser;

      return {
        user,
        tokens: {
          accessToken: await this.jwtService.signAsync(payload, {
            expiresIn: '1h',
            secret: process.env.JWT_SECRET,
          }),
          refreshToken: await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
            secret: process.env.JWT_REFRESH_SECRET,
          }),
        },
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid password or email');
    }
  }
}
