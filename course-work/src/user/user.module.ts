import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  providers: [UserService, JwtService, PrismaService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
