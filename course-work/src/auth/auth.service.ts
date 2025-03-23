import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    const refresh_token = await this.createRefreshToken(user.id);

    return {
      access_token,
      refresh_token,
    };
  }

  async createRefreshToken(userId: string): Promise<string> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    const token = uuid();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const tokenData = await this.prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
      include: { user: true },
    });

    if (!tokenData || tokenData.expiresAt < new Date()) {
      if (tokenData) {
        await this.prisma.refreshToken.delete({
          where: { id: tokenData.id },
        });
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({
      where: { id: tokenData.id },
    });

    const payload = { sub: tokenData.user.id, email: tokenData.user.email };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refresh_token = await this.createRefreshToken(tokenData.user.id);

    return {
      access_token,
      refresh_token,
    };
  }

  async logout(refreshToken): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }
}
