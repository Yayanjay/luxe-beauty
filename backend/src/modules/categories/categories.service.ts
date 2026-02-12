import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      include: { children: { where: { deletedAt: null } } },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { slug, deletedAt: null },
      include: { children: { where: { deletedAt: null } } },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: { name: string; image?: string; parentId?: string }) {
    const slug = slugify(data.name, { lower: true, strict: true });
    return this.prisma.category.create({ data: { ...data, slug } });
  }

  async update(id: string, data: Partial<{ name: string; image: string; parentId: string }>) {
    const category = await this.prisma.category.findFirst({ where: { id, deletedAt: null } });
    if (!category) throw new NotFoundException('Category not found');

    const slug = data.name ? slugify(data.name, { lower: true, strict: true }) : undefined;
    return this.prisma.category.update({ where: { id }, data: { ...data, ...(slug && { slug }) } });
  }

  async delete(id: string): Promise<void> {
    const category = await this.prisma.category.findFirst({ where: { id, deletedAt: null } });
    if (!category) throw new NotFoundException('Category not found');
    await this.prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
