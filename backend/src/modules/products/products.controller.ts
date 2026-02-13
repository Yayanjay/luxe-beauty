import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProductsService } from './products.service';
import { UploadService } from 'src/modules/upload/upload.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Products')
@Controller()
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly uploadService: UploadService,
  ) {}

  // --- Storefront ---

  @Get('products')
  @ApiOperation({ summary: 'List active products with filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') categorySlug?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.productsService.findAll({
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      categorySlug,
      search,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
    });
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  // --- Admin ---

  @Get('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all products' })
  findAllAdmin(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.productsService.findAllAdmin(page ? +page : 1, limit ? +limit : 20);
  }

  @Post('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create product' })
  create(@Body() body: { name: string; description?: string; categoryId: string; isActive?: boolean }) {
    return this.productsService.create(body);
  }

  @Patch('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update product' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; description: string; categoryId: string; isActive: boolean }>,
  ) {
    return this.productsService.update(id, body);
  }

  @Delete('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Soft-delete product' })
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  // --- Product Images ---

  @Post('admin/products/:id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '[Admin] Upload and attach image to product' })
  async addImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('alt') alt?: string,
  ) {
    const upload = await this.uploadService.uploadImage(file, 'products');
    return this.productsService.addImage(productId, upload.url, upload.key, alt);
  }

  @Delete('admin/products/:id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Remove image from product and delete from S3' })
  async removeImage(@Param('id') productId: string, @Param('imageId') imageId: string) {
    const key = await this.productsService.removeImage(productId, imageId);
    await this.uploadService.deleteImage(key);
  }

  @Patch('admin/products/:id/images/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Reorder product images' })
  reorderImages(
    @Param('id') productId: string,
    @Body() body: { imageIds: string[] },
  ) {
    return this.productsService.reorderImages(productId, body.imageIds);
  }
}
