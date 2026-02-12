import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  @ApiOperation({ summary: 'Create order from cart' })
  create(
    @CurrentUser() user: User,
    @Body() body: {
      shippingAddress: {
        fullName: string;
        phone: string;
        fullAddress: string;
        city: string;
        province: string;
        postalCode: string;
      };
      notes?: string;
    },
  ) {
    return this.ordersService.createFromCart(user.id, body.shippingAddress, body.notes);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get current user orders' })
  findMyOrders(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findByUser(user.id, page ? +page : 1, limit ? +limit : 10);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.ordersService.findById(id, user.id);
  }

  // --- Admin ---

  @Get('admin/orders')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] List all orders' })
  findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAllAdmin(page ? +page : 1, limit ? +limit : 20, status);
  }

  @Patch('admin/orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Update order status' })
  updateStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.ordersService.updateStatus(id, body.status);
  }
}
