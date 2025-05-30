import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDTO } from './DTO/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAllUsers(): Promise<UserDTO[]> {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return users;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createUser(
    email: string,
    name: string,
    password: string,
  ): Promise<UserDTO> {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findUserByEmail(email: string): Promise<UserDTO> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
          avatar: true,
          password: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log(user);

      if (user === null) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      console.error('Error fetching user:', err);
      throw new HttpException(
        'Error with finding user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(email: string, password: string): Promise<UserDTO> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          password: true,
        },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
      }

      return user;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findUserById(userId: string): Promise<UserDTO> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          password: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const { password, ...userWithoutPassword } = user;

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (err) {
      throw new HttpException('Error with finding user', HttpStatus.NOT_FOUND);
    }
  }

  async updateUser(
    email?: string,
    name?: string,
    avatar?: string,
  ): Promise<UserDTO> {
    try {
      const user = await this.prisma.user.update({
        where: {
          email,
        },
        data: {
          name,
          avatar,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (err) {
      throw new HttpException('Error with updating user', HttpStatus.NOT_FOUND);
    }
  }
}
