import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('CMS')
@Controller()
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get published CMS page by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.cmsService.findBySlug(slug);
  }

  @Get('admin/cms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all CMS pages' })
  findAll() {
    return this.cmsService.findAll();
  }

  @Post('admin/cms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create CMS page' })
  create(@Body() body: { title: string; content: string; isPublished?: boolean }) {
    return this.cmsService.create(body);
  }

  @Patch('admin/cms/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update CMS page' })
  update(@Param('id') id: string, @Body() body: Partial<{ title: string; content: string; isPublished: boolean }>) {
    return this.cmsService.update(id, body);
  }

  @Delete('admin/cms/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Delete CMS page' })
  delete(@Param('id') id: string) {
    return this.cmsService.delete(id);
  }
}
