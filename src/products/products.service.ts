import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ProductQueryDto) {
    return this.prisma.product.findMany({
      where: {
        categoryId: query.categoryId,
        price: {
          gte: query.minPrice,
          lte: query.maxPrice,
        },
        OR: query.search
          ? [
              {
                title: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ]
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  create(userId: number, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        categoryId: dto.categoryId,
        userId,
      },
    });
  }

  async update(
    userId: number,
    userRole: Role,
    id: number,
    dto: UpdateProductDto,
  ) {
    const product = await this.findOne(id);

    if (product.user.id !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Not your product');
    }

    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        categoryId: dto.categoryId,
      },
    });
  }

  async remove(userId: number, userRole: Role, id: number) {
    const product = await this.findOne(id);

    if (product.user.id !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Not your product');
    }

    return this.prisma.product.delete({
      where: {
        id,
      },
    });
  }
}