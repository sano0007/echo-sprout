import { httpAction } from '../convex/_generated/server';
import { internal } from '../convex/_generated/api';
import Stripe from 'stripe';
import { StripeService } from '../services/stripe-service';

export const handleStripeWebhook = httpAction(
  async (ctx, request): Promise<Response> => {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    console.log('🥳🥳🥳 Received Stripe webhook request');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    let event: Stripe.Event;
    const stripe = StripeService.getStripeInstance();

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    console.log('📈 Received Stripe webhook event:', event.type);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('✅ Checkout session completed:', session.id);

          await ctx.runMutation(
            internal.transactions.createTransactionFromStripe,
            {
              sessionId: session.id,
              paymentIntentId: session.payment_intent as string,
              amountTotal: session.amount_total || 0,
              currency: session.currency || 'usd',
              paymentStatus: session.payment_status || 'unpaid',
              customerEmail: session.customer_details?.email || '',
              metadata: session.metadata || {},
            }
          );
          break;
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('💰 Payment intent succeeded:', paymentIntent.id);

          await ctx.runMutation(internal.transactions.updatePaymentStatus, {
            paymentIntentId: paymentIntent.id,
            status: 'completed',
          });
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('❌ Payment intent failed:', paymentIntent.id);

          await ctx.runMutation(internal.transactions.updatePaymentStatus, {
            paymentIntentId: paymentIntent.id,
            status: 'failed',
          });
          break;
        }

        case 'charge.dispute.created': {
          const dispute = event.data.object as Stripe.Dispute;
          console.log('⚠️ Charge dispute created:', dispute.id);

          if (dispute.payment_intent) {
            await ctx.runMutation(internal.transactions.updatePaymentStatus, {
              paymentIntentId: dispute.payment_intent as string,
              status: 'failed',
            });
          }
          break;
        }

        default:
          console.log('🤷 Unhandled event type:', event.type);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('Webhook processing failed', { status: 500 });
    }
  }
);
