import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

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
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        category: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  create(userId: number, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async update(userId: number, id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (product.user.id !== userId) {
      throw new ForbiddenException('Not your product');
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: number, id: number) {
    const product = await this.findOne(id);

    if (product.user.id !== userId) {
      throw new ForbiddenException('Not your product');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}