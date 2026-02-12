import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus } from '@prisma/client';
import { OrdersService } from '../orders/orders.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require('midtrans-client');

@Injectable()
export class PaymentsService {
  private readonly snap: unknown;

  constructor(
    private readonly config: ConfigService,
    private readonly ordersService: OrdersService,
  ) {
    this.snap = new midtransClient.Snap({
      isProduction: this.config.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: this.config.get<string>('MIDTRANS_SERVER_KEY'),
      clientKey: this.config.get<string>('MIDTRANS_CLIENT_KEY'),
    });
  }

  async createSnapToken(orderId: string) {
    const order = await this.ordersService.findById(orderId);
    const snap = this.snap as {
      createTransaction: (params: unknown) => Promise<{ token: string; redirect_url: string }>;
    };

    const shippingAddress = order.shippingAddress as {
      fullName: string;
      phone: string;
      fullAddress: string;
      city: string;
      postalCode: string;
    };

    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: Number(order.total),
      },
      customer_details: {
        first_name: shippingAddress.fullName,
        phone: shippingAddress.phone,
        shipping_address: {
          first_name: shippingAddress.fullName,
          phone: shippingAddress.phone,
          address: shippingAddress.fullAddress,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
        },
      },
      item_details: order.items.map((item) => ({
        id: item.variantId,
        price: Number(item.price),
        quantity: item.quantity,
        name: item.variant?.product?.name ?? item.variantId,
      })),
    };

    const result = await snap.createTransaction(parameter);

    await this.ordersService.updatePayment(orderId, { paymentStatus: PaymentStatus.PENDING, snapToken: result.token });

    return { snapToken: result.token, redirectUrl: result.redirect_url };
  }

  async handleWebhook(notification: Record<string, string>) {
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    let paymentStatus: PaymentStatus;
    let orderStatus: import('@prisma/client').OrderStatus | undefined;

    if (transactionStatus === 'capture') {
      paymentStatus = fraudStatus === 'accept' ? PaymentStatus.PAID : PaymentStatus.FAILED;
    } else if (transactionStatus === 'settlement') {
      paymentStatus = PaymentStatus.PAID;
      orderStatus = 'PAID' as import('@prisma/client').OrderStatus;
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      paymentStatus = transactionStatus === 'expire' ? PaymentStatus.EXPIRED : PaymentStatus.FAILED;
    } else {
      paymentStatus = PaymentStatus.PENDING;
    }

    await this.ordersService.updatePayment(orderId, {
      paymentStatus,
      paymentId: notification.transaction_id,
    });

    if (orderStatus) {
      await this.ordersService.updateStatus(orderId, orderStatus);
    }

    return { received: true };
  }
}
