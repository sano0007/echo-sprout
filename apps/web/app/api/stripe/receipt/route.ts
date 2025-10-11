import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@packages/backend/services/stripe-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    const stripe = StripeService.getStripeInstance();

    // Get the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json(
        { success: false, error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    console.log('🌞Payment Intent:', paymentIntent);

    // Get the latest charge ID from the payment intent
    const latestChargeId = paymentIntent.latest_charge;

    if (!latestChargeId || typeof latestChargeId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'No charge found for this payment' },
        { status: 404 }
      );
    }

    console.log('🌞Latest Charge ID:', latestChargeId);

    // Retrieve the full charge details to get the receipt URL
    const charge = await stripe.charges.retrieve(latestChargeId);

    console.log('🌞Charge Details:', {
      id: charge.id,
      receipt_url: charge.receipt_url,
      receipt_number: charge.receipt_number,
      status: charge.status,
    });

    if (!charge.receipt_url) {
      return NextResponse.json(
        { success: false, error: 'Receipt not available for this payment' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      receiptUrl: charge.receipt_url,
    });
  } catch (error) {
    console.error('Error fetching Stripe receipt:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch receipt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
