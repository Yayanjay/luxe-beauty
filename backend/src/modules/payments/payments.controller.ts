import { Controller, Post, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('midtrans/charge/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Midtrans Snap token for an order' })
  charge(@Param('orderId') orderId: string) {
    return this.paymentsService.createSnapToken(orderId);
  }

  @Post('midtrans/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Midtrans webhook notification handler' })
  webhook(@Body() notification: Record<string, string>) {
    return this.paymentsService.handleWebhook(notification);
  }
}
