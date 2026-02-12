import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CartModule } from '../cart/cart.module';
import { CartService } from '../cart/cart.service';

@Module({
  imports: [CartModule],
  controllers: [OrdersController],
  providers: [OrdersService, CartService],
  exports: [OrdersService],
})
export class OrdersModule {}
