import Stripe from 'stripe';

export class StripeService {
  private static instance: Stripe | null = null;

  // make Stripe instance follow singleton pattern
  public constructor() {
    if (!StripeService.instance) {
      StripeService.instance = new Stripe(process.env.STRIPE_SECRET_KEY!);
    }
  }

  public static getStripeInstance() {
    if (!StripeService.instance) {
      StripeService.instance = new Stripe(process.env.STRIPE_SECRET_KEY!);
      return StripeService.instance;
    }
    return StripeService.instance;
  }

  public async createCheckoutSession(
    amount: number,
    credits: number,
    projectId?: string
  ) {
    const stripe = StripeService.getStripeInstance();

    if (!stripe) {
      throw new Error('Stripe instance not initialized');
    }

    return await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Carbon Credits',
              description: `Purchase ${credits} carbon credits`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        credits: credits.toString(),
        amount: amount.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace?payment=cancelled`,
    });
  }
}
