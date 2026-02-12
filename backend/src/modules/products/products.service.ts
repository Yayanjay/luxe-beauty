import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    categorySlug?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const { page = 1, limit = 20, categorySlug, search, minPrice, maxPrice } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? { variants: { some: { price: { gte: minPrice, lte: maxPrice }, deletedAt: null } } }
        : {}),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { position: 'asc' }, take: 1 },
          variants: {
            where: { deletedAt: null, isActive: true },
            orderBy: { price: 'asc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: products, total, page, limit };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null, isActive: true },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: {
          where: { deletedAt: null, isActive: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: {
    name: string;
    description?: string;
    categoryId: string;
    isActive?: boolean;
  }) {
    const slug = slugify(data.name, { lower: true, strict: true });
    return this.prisma.product.create({ data: { ...data, slug } });
  }

  async update(id: string, data: Partial<{ name: string; description: string; categoryId: string; isActive: boolean }>) {
    const product = await this.prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!product) throw new NotFoundException('Product not found');

    const slug = data.name ? slugify(data.name, { lower: true, strict: true }) : undefined;
    return this.prisma.product.update({ where: { id }, data: { ...data, ...(slug && { slug }) } });
  }

  async delete(id: string): Promise<void> {
    const product = await this.prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!product) throw new NotFoundException('Product not found');
    await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async findAllAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          images: { take: 1 },
          variants: { where: { deletedAt: null }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where: { deletedAt: null } }),
    ]);
    return { data: products, total, page, limit };
  }
}
