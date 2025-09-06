import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@packages/backend/services/stripe-service';

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

    const stripeService = new StripeService();
    const session = await stripeService.createCheckoutSession(amount, credits);

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
