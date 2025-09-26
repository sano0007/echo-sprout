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
    email: string,
    projectId?: string,
    projectName?: string
  ) {
    const stripe = StripeService.getStripeInstance();

    if (!stripe) {
      throw new Error('Stripe instance not initialized');
    }

    const productName =
      projectId && projectName
        ? `Carbon Credits - ${projectName}`
        : 'Carbon Credits';

    const productDescription =
      projectId && projectName
        ? `Purchase ${credits} carbon credits from ${projectName}`
        : `Purchase ${credits} carbon credits`;

    const metadata: Record<string, string> = {
      credits: credits.toString(),
      amount: amount.toString(),
    };

    if (projectId) {
      metadata.projectId = projectId;
    }

    const successUrl = projectId
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace/${projectId}?payment=success`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace?payment=success`;

    const cancelUrl = projectId
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace/${projectId}?payment=cancelled`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace?payment=cancelled`;

    return await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }
}
