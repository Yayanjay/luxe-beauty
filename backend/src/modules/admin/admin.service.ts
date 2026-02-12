import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders,
      paidOrders,
      totalCustomers,
      totalProducts,
      monthlyRevenue,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PAID } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.PAID, createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    return {
      totalOrders,
      paidOrders,
      totalCustomers,
      totalProducts,
      monthlyRevenue: Number(monthlyRevenue._sum.total ?? 0),
      recentOrders,
    };
  }

  async getSettings() {
    const settings = await this.prisma.brandSetting.findMany();
    return Object.fromEntries(settings.map((s) => [s.key, s.value]));
  }

  async updateSettings(data: Record<string, string>): Promise<void> {
    await Promise.all(
      Object.entries(data).map(([key, value]) =>
        this.prisma.brandSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );
  }
}
