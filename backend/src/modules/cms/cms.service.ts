import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cmsPage.findMany({ orderBy: { title: 'asc' } });
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.cmsPage.findFirst({
      where: { slug, isPublished: true },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async create(data: { title: string; content: string; isPublished?: boolean }) {
    const slug = slugify(data.title, { lower: true, strict: true });
    return this.prisma.cmsPage.create({ data: { ...data, slug } });
  }

  async update(id: string, data: Partial<{ title: string; content: string; isPublished: boolean }>) {
    const page = await this.prisma.cmsPage.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    const slug = data.title ? slugify(data.title, { lower: true, strict: true }) : undefined;
    return this.prisma.cmsPage.update({ where: { id }, data: { ...data, ...(slug && { slug }) } });
  }

  async delete(id: string): Promise<void> {
    const page = await this.prisma.cmsPage.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    await this.prisma.cmsPage.delete({ where: { id } });
  }
}
