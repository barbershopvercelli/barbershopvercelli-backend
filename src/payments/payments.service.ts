import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createCheckoutSession(items: { name: string; amount: number; quantity: number }[]) {
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: item.amount * 100, // Convert dollars to cents
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${this.configService.get<string>('FRONTEND_URL')}/success`,
      cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/cancel`,
      // cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });
    console.log(session)
    return session.url;
  }
}
