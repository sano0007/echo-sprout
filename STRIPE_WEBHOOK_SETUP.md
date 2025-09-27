# Stripe Webhook Setup Guide

## Overview

This document explains how to set up Stripe webhooks to automatically track transactions in the Convex database.

## Environment Variables Required

Add these to your `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook endpoint secret from Stripe
```

## Webhook Endpoint URL

Your webhook endpoint will be available at:

```
https://your-convex-deployment.convex.cloud/stripe-webhook
```

For development, it will be:

```
https://wary-armadillo-281.convex.cloud/stripe-webhook
```

## Stripe Dashboard Configuration

1. Go to your Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-convex-deployment.convex.cloud/stripe-webhook`
4. Select the following events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`
5. Click "Add endpoint"
6. Copy the webhook signing secret (starts with `whsec_`) and add it to your environment variables

## How It Works

1. **Checkout Session Completed**: When a user completes payment, Stripe sends this event
   - Creates a new transaction record in Convex
   - Updates the user's wallet with purchased credits
   - Creates an audit log entry

2. **Payment Intent Succeeded**: Confirms successful payment
   - Updates transaction status to "completed"

3. **Payment Intent Failed**: Handles failed payments
   - Updates transaction status to "failed"

4. **Charge Dispute Created**: Handles payment disputes
   - Updates transaction status to "failed"

## Transaction Data Stored

The webhook stores the following transaction data:

- `buyerId`: User who made the purchase
- `creditAmount`: Number of credits purchased
- `totalAmount`: Total amount paid
- `platformFee`: Platform commission (5%)
- `netAmount`: Amount after platform fee
- `stripeSessionId`: Stripe checkout session ID
- `stripePaymentIntentId`: Stripe payment intent ID
- `transactionReference`: Unique reference number
- `paymentStatus`: Current payment status

## Testing

You can test the webhook using Stripe CLI:

```bash
stripe listen --forward-to https://your-convex-deployment.convex.cloud/stripe-webhook
stripe trigger checkout.session.completed
```

## Security

- Webhook signatures are verified using Stripe's signature verification
- All webhook events are logged for audit purposes
- Invalid signatures are rejected with 400 status code

## Error Handling

- Invalid signatures return 400 status
- Missing required data throws ConvexError
- All errors are logged to console
- Failed webhook processing returns 500 status
