import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

type ShippingAddress = {
  fullName: string;
  phone: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode: string;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

  async createFromCart(userId: string, shippingAddress: ShippingAddress, notes?: string) {
    const cart = await this.cartService.getOrCreateCart(userId);
    if (!cart.items.length) throw new BadRequestException('Cart is empty');

    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;

      const orderItems = await Promise.all(
        cart.items.map(async (item) => {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found`);
          if (variant.stock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for ${variant.sku}`);
          }
          const price = Number(variant.price);
          subtotal += price * item.quantity;

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });

          return { variantId: item.variantId, quantity: item.quantity, price };
        }),
      );

      const shippingCost = 0;
      const total = subtotal + shippingCost;

      const order = await tx.order.create({
        data: {
          userId,
          subtotal,
          shippingCost,
          total,
          shippingAddress,
          notes,
          items: { create: orderItems },
        },
        include: { items: { include: { variant: true } } },
      });

      await this.cartService.clearCart(userId);

      return order;
    });
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        include: { items: { include: { variant: { include: { product: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { data: orders, total, page, limit };
  }

  async findById(id: string, userId?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, ...(userId && { userId }) },
      include: { items: { include: { variant: { include: { product: { include: { images: { take: 1 } } } } } } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  async updatePayment(id: string, data: { paymentStatus: PaymentStatus; paymentId?: string; snapToken?: string }) {
    return this.prisma.order.update({ where: { id }, data });
  }

  async findAllAdmin(page = 1, limit = 20, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data: orders, total, page, limit };
  }
}
