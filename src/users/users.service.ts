import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: this.privateUserSelect(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe(userId: number, dto: UpdateUserDto) {
    await this.findMe(userId);

    try {
      return await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name: dto.name,
        },
        select: this.privateUserSelect(),
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('User with this data already exists');
      }

      throw error;
    }
  }

  async deleteMe(userId: number) {
    await this.findMe(userId);

    return this.prisma.user.delete({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async findPublicProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: this.publicUserSelect(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserProducts(id: number) {
    await this.findPublicProfile(id);

    return this.prisma.product.findMany({
      where: {
        userId: id,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateUserRole(id: number, dto: UpdateUserRoleDto) {
    await this.findPublicProfile(id);

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        role: dto.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  private privateUserSelect() {
    return {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      products: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          imageUrl: true,
          createdAt: true,
          category: true,
        },
        orderBy: {
          createdAt: 'desc' as const,
        },
      },
      cartItems: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              imageUrl: true,
              category: true,
            },
          },
        },
      },
      favorites: {
        select: {
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              imageUrl: true,
              category: true,
            },
          },
        },
      },
    };
  }

  private publicUserSelect() {
    return {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      products: {
        select: {
          id: true,
          title: true,
          price: true,
          imageUrl: true,
          createdAt: true,
          category: true,
        },
        orderBy: {
          createdAt: 'desc' as const,
        },
      },
    };
  }
}