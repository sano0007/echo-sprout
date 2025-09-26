import { internalMutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';

export const createTransactionFromStripe = internalMutation({
  args: {
    sessionId: v.string(),
    paymentIntentId: v.string(),
    amountTotal: v.number(),
    currency: v.string(),
    paymentStatus: v.string(),
    customerEmail: v.string(),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    const {
      sessionId,
      paymentIntentId,
      amountTotal,
      currency,
      customerEmail,
      metadata,
    } = args;

    const credits = parseFloat(metadata.credits || '0');
    const originalAmount = parseFloat(metadata.amount || '0');
    const projectId = metadata.projectId || null;

    if (!credits || !originalAmount) {
      throw new ConvexError('Missing credits or amount in session metadata');
    }

    const buyer = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', customerEmail))
      .first();

    if (!buyer) {
      throw new ConvexError(`User with email ${customerEmail} not found`);
    }

    const unitPrice = originalAmount / credits;

    // If projectId is provided, validate it exists and update project credits
    if (projectId) {
      const project = await ctx.db
        .query('projects')
        .filter((q) => q.eq(q.field('_id'), projectId))
        .first();

      if (!project) {
        throw new ConvexError(`Project with ID ${projectId} not found`);
      }

      // Check if enough credits are available
      if (project.creditsAvailable < credits) {
        throw new ConvexError(
          `Not enough credits available. Only ${project.creditsAvailable} credits available.`
        );
      }

      // Update project credits
      await ctx.db.patch(project._id, {
        creditsAvailable: project.creditsAvailable - credits,
        creditsSold: project.creditsSold + credits,
      });
    }

    // Generate transaction reference
    const transactionReference = `TXN-${Date.now()}-${sessionId.slice(-8)}`;

    const transactionId = await ctx.db.insert('transactions', {
      buyerId: buyer._id,
      projectId: projectId || undefined,
      creditAmount: credits,
      unitPrice,
      totalAmount: originalAmount,
      paymentStatus: mapStripeStatusToConvex(args.paymentStatus),
      stripePaymentIntentId: paymentIntentId,
      stripeSessionId: sessionId,
      certificateUrl: undefined,
      transactionReference,
    });

    // Update user's wallet
    const existingWallet = await ctx.db
      .query('userWallet')
      .withIndex('by_user', (q) => q.eq('userId', buyer._id))
      .first();

    if (existingWallet) {
      await ctx.db.patch(existingWallet._id, {
        availableCredits: existingWallet.availableCredits + credits,
        totalPurchased: existingWallet.totalPurchased + credits,
        totalSpent: existingWallet.totalSpent,
        lastTransactionAt: Date.now(),
      });
    } else {
      await ctx.db.insert('userWallet', {
        userId: buyer._id,
        availableCredits: credits,
        totalPurchased: credits,
        totalAllocated: 0,
        totalSpent: 0,
        lifetimeImpact: 0,
        lastTransactionAt: Date.now(),
      });
    }

    console.log(
      `✅ Transaction created: ${transactionReference} for ${credits} credits`
    );

    return transactionId;
  },
});

export const updatePaymentStatus = internalMutation({
  args: {
    paymentIntentId: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('refunded'),
      v.literal('expired')
    ),
  },
  handler: async (ctx, args) => {
    const { paymentIntentId, status } = args;

    const transaction = await ctx.db
      .query('transactions')
      .filter((q) => q.eq(q.field('stripePaymentIntentId'), paymentIntentId))
      .first();

    if (!transaction) {
      throw new ConvexError(
        `Transaction with payment intent ${paymentIntentId} not found`
      );
    }

    const oldStatus = transaction.paymentStatus;

    // Update transaction status
    await ctx.db.patch(transaction._id, {
      paymentStatus: status,
    });

    console.log(
      `📊 Transaction ${transaction.transactionReference} status updated: ${oldStatus} → ${status}`
    );

    return transaction._id;
  },
});

export const getUserTransactions = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 10 } = args;

    return await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
      .order('desc')
      .take(limit);
  },
});

export const getTransactionByReference = query({
  args: {
    transactionReference: v.string(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query('transactions')
      .withIndex('by_reference', (q) =>
        q.eq('transactionReference', args.transactionReference)
      )
      .first();

    if (!transaction) {
      throw new ConvexError('Transaction not found');
    }

    return transaction;
  },
});

// Helper function to map Stripe payment status to our Convex enum
function mapStripeStatusToConvex(
  stripeStatus: string
): 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'expired' {
  switch (stripeStatus) {
    case 'paid':
      return 'completed';
    case 'unpaid':
      return 'pending';
    case 'no_payment_required':
      return 'completed';
    default:
      return 'pending';
  }
}
