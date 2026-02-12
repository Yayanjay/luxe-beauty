import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Banners')
@Controller()
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get('banners')
  @ApiOperation({ summary: 'Get active banners for homepage' })
  findActive() {
    return this.bannersService.findActive();
  }

  @Get('admin/banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  findAll() {
    return this.bannersService.findAll();
  }

  @Post('admin/banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  create(@Body() body: { title: string; image: string; link?: string; position?: number; isActive?: boolean }) {
    return this.bannersService.create(body);
  }

  @Patch('admin/banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: Partial<{ title: string; image: string; link: string; position: number; isActive: boolean }>) {
    return this.bannersService.update(id, body);
  }

  @Delete('admin/banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.bannersService.delete(id);
  }
}
