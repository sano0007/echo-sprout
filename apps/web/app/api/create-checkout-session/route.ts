import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@packages/backend/services/stripe-service';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const { amount, credits, projectId, projectName } = await request.json();

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

    // Get user details from Clerk to extract email
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    const stripeService = new StripeService();
    const session = await stripeService.createCheckoutSession(
      amount,
      credits,
      userEmail,
      projectId,
      projectName
    );

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
