import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  findMyCart(userId: number) {
    return this.prisma.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async addItem(userId: number, dto: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: dto.productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.userId === userId) {
      throw new BadRequestException('You cannot add your own product to cart');
    }

    return this.prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
      update: {
        quantity: {
          increment: dto.quantity,
        },
      },
      create: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });
  }

  async updateItem(userId: number, productId: number, dto: UpdateCartItemDto) {
    await this.findCartItem(userId, productId);

    return this.prisma.cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: {
        quantity: dto.quantity,
      },
    });
  }

  async removeItem(userId: number, productId: number) {
    await this.findCartItem(userId, productId);

    return this.prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  clearCart(userId: number) {
    return this.prisma.cartItem.deleteMany({
      where: {
        userId,
      },
    });
  }

  private async findCartItem(userId: number, productId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return cartItem;
  }
}