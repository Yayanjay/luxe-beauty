import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.banner.findMany({ orderBy: { position: 'asc' } });
  }

  async create(data: { title: string; image: string; link?: string; position?: number; isActive?: boolean }) {
    return this.prisma.banner.create({ data });
  }

  async update(id: string, data: Partial<{ title: string; image: string; link: string; position: number; isActive: boolean }>) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    return this.prisma.banner.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    await this.prisma.banner.delete({ where: { id } });
  }
}
