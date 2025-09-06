import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { amount, credits } = await request.json();

    if (!amount || !credits) {
      return NextResponse.json(
        { error: 'Missing required parameters: amount and credits' },
        { status: 400 }
      );
    }

    if (amount <= 0 || credits <= 0) {
      return NextResponse.json(
        { error: 'Amount and credits must be greater than zero' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
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

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
