import { internalMutation, mutation, query } from './_generated/server';
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
      buyerId: buyer.clerkId, // Use Clerk ID instead of internal user ID
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
    userId: v.string(), // Using string to match buyerId which is clerkId
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

export const getUserWallet = query({
  args: {
    userId: v.string(), // Using string to match clerkId
  },
  handler: async (ctx, args) => {
    // Get user by clerkId first
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
      .first();

    if (!user) {
      throw new ConvexError('User not found');
    }

    const wallet = await ctx.db
      .query('userWallet')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    if (!wallet) {
      // Return default wallet if none exists
      return {
        userId: user._id,
        availableCredits: 0,
        totalPurchased: 0,
        totalAllocated: 0,
        totalSpent: 0,
        lifetimeImpact: 0,
        lastTransactionAt: undefined,
      };
    }

    return wallet;
  },
});

export const getUserTransactionsWithProjects = query({
  args: {
    userId: v.string(), // Using string to match buyerId which is clerkId
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 10 } = args;

    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
      .order('desc')
      .take(limit);

    // Enrich transactions with project data
    return await Promise.all(
      transactions.map(async (transaction) => {
        let project = null;
        if (transaction.projectId) {
          project = await ctx.db.get(transaction.projectId);
        }
        return {
          ...transaction,
          project,
        };
      })
    );
  },
});

export const getBuyerDashboardMetrics = query({
  args: {
    userId: v.string(), // Using string to match buyerId which is clerkId
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Get user by clerkId first
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', userId))
      .first();

    if (!user) {
      throw new ConvexError('User not found');
    }

    // Get user wallet
    const wallet = await ctx.db
      .query('userWallet')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    console.log('🫨 wallet details', wallet);

    // Get all user transactions
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'completed'))
      .collect();

    console.log('🫨 transactions', transactions);

    // Get projects for transactions
    const projectIds = transactions
      .map((t) => t.projectId)
      .filter((id): id is NonNullable<typeof id> => Boolean(id));

    console.log('🫨 projectsIds', projectIds);

    const projects = await Promise.all(
      projectIds.map(async (projectId) => {
        return await ctx.db.get(projectId);
      })
    );

    // Calculate metrics
    const totalCredits = transactions.reduce(
      (sum, t) => sum + t.creditAmount,
      0
    );
    const totalSpent = transactions.reduce((sum, t) => sum + t.totalAmount, 0);

    // Calculate CO2 offset (assuming 1.5 tons CO2 per credit on average)
    const totalCO2Offset = totalCredits * 1.5;

    // Calculate equivalents
    const equivalentTrees = Math.round(totalCO2Offset * 40); // ~40 trees per ton CO2
    const equivalentCarsOff = Math.round(totalCO2Offset / 4.6); // ~4.6 tons CO2 per car per year

    const validProjects = projects.filter(
      (proj): proj is NonNullable<typeof proj> => {
        return proj !== null && 'projectType' in proj;
      }
    );

    const projectTypes = validProjects.reduce(
      (acc, project) => {
        if ('projectType' in project) {
          const projectType = (project as any).projectType as string;
          acc[projectType] = (acc[projectType] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      wallet: wallet || {
        userId: user._id,
        availableCredits: 0,
        totalPurchased: 0,
        totalAllocated: 0,
        totalSpent: 0,
        lifetimeImpact: 0,
        lastTransactionAt: undefined,
      },
      totalCredits,
      totalSpent,
      totalCO2Offset,
      equivalentTrees,
      equivalentCarsOff,
      projectTypes,
      transactionCount: transactions.length,
      activeProjects: validProjects.filter(
        (p) => 'status' in p && (p as any).status === 'active'
      ).length,
    };
  },
});

export const getUserCertificates = query({
  args: {
    userId: v.string(), // Using string to match buyerId which is clerkId
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 20 } = args;

    // Get completed transactions with certificates
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'completed'))
      .order('desc')
      .take(limit);

    // Enrich with project data and certificate info
    return await Promise.all(
      transactions.map(async (transaction) => {
        let project = null;
        if (transaction.projectId) {
          project = await ctx.db.get(transaction.projectId);
        }

        return {
          id: transaction._id,
          transactionReference: transaction.transactionReference,
          certificateId: `CERT-${transaction.transactionReference}`,
          project: project?.title || 'General Carbon Credits',
          projectType: project?.projectType || 'general',
          credits: transaction.creditAmount,
          purchaseDate: transaction._creationTime,
          co2Offset: transaction.creditAmount * 1.5, // Assuming 1.5 tons per credit
          status: 'Active',
          certificateUrl: transaction.certificateUrl,
          projectDetails: project,
        };
      })
    );
  },
});

export const getMonthlyOffsetProgress = query({
  args: {
    userId: v.string(), // Using string to match buyerId which is clerkId
    months: v.optional(v.number()), // Number of months to look back, default 12
  },
  handler: async (ctx, args) => {
    const { userId, months = 12 } = args;

    // Get all completed transactions for the user
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'completed'))
      .collect();

    // Sort transactions by creation time
    const sortedTransactions = transactions.sort(
      (a, b) => a._creationTime - b._creationTime
    );

    // Create monthly aggregation
    const monthlyData: Record<
      string,
      { credits: number; co2Offset: number; cumulativeCO2: number }
    > = {};
    let cumulativeCO2 = 0;

    // Calculate the date range (last N months from now)
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - months + 1,
      1
    );

    // Initialize all months with zero values
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = { credits: 0, co2Offset: 0, cumulativeCO2: 0 };
    }

    // Process each transaction
    for (const transaction of sortedTransactions) {
      const transactionDate = new Date(transaction._creationTime);

      // Only include transactions within our date range
      if (transactionDate >= startDate) {
        const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;

        const co2FromTransaction = transaction.creditAmount * 1.5; // 1.5 tons CO2 per credit
        cumulativeCO2 += co2FromTransaction;

        if (monthlyData[monthKey]) {
          monthlyData[monthKey].credits += transaction.creditAmount;
          monthlyData[monthKey].co2Offset += co2FromTransaction;
        }
      } else {
        // For transactions before our range, just add to cumulative
        cumulativeCO2 += transaction.creditAmount * 1.5;
      }
    }

    // Set cumulative values for each month
    let runningCumulative = cumulativeCO2;
    const sortedMonths = Object.keys(monthlyData).sort();

    for (const monthKey of sortedMonths) {
      const monthData = monthlyData[monthKey];
      if (monthData) {
        monthData.cumulativeCO2 = runningCumulative;
        runningCumulative -= monthData.co2Offset;
      }
    }

    // Convert to array format for charting
    const monthlyProgress = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => {
        const [year, monthNum] = month.split('-');
        const date = new Date(
          parseInt(year || '0'),
          parseInt(monthNum || '0') - 1
        );

        return {
          month,
          monthLabel: date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          credits: data.credits,
          co2Offset: data.co2Offset,
          cumulativeCO2: data.cumulativeCO2,
        };
      });

    return {
      monthlyProgress,
      totalCO2Offset: cumulativeCO2,
      totalCredits: transactions.reduce((sum, t) => sum + t.creditAmount, 0),
      transactionCount: transactions.length,
    };
  },
});

export const generateCertificate = mutation({
  args: {
    transactionId: v.id('transactions'),
    certificateUrl: v.string(), // URL from Convex storage
  },
  handler: async (ctx, args) => {
    const { transactionId, certificateUrl } = args;

    // Get the transaction
    const transaction = await ctx.db.get(transactionId);
    if (!transaction) {
      throw new ConvexError('Transaction not found');
    }

    // Verify the transaction is completed
    if (transaction.paymentStatus !== 'completed') {
      throw new ConvexError(
        'Cannot generate certificate for incomplete transaction'
      );
    }

    // Update transaction with certificate URL
    await ctx.db.patch(transactionId, {
      certificateUrl,
    });

    console.log(
      `✅ Certificate generated for transaction: ${transaction.transactionReference}`
    );

    return { success: true, certificateUrl };
  },
});

export const getCertificateData = query({
  args: {
    transactionId: v.id('transactions'),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new ConvexError('Transaction not found');
    }

    // Get buyer information
    const buyer = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', transaction.buyerId))
      .first();

    if (!buyer) {
      throw new ConvexError('Buyer not found');
    }

    // Get project information if available
    let project = null;
    if (transaction.projectId) {
      project = await ctx.db.get(transaction.projectId);
    }

    // Generate certificate ID
    const certificateId = `CERT-${transaction.transactionReference}`;

    // Calculate CO2 offset (1.5 tons per credit)
    const co2Offset = transaction.creditAmount * 1.5;

    return {
      certificateId,
      buyerName: buyer.email || 'Carbon Credit Buyer',
      projectName: project?.title || 'General Carbon Credit Project',
      projectType: project?.projectType || 'general',
      projectLocation: project?.location || 'Global',
      credits: transaction.creditAmount,
      co2Offset,
      purchaseDate: new Date(transaction._creationTime).toISOString(),
      transactionReference: transaction.transactionReference,
      verificationStandard: 'Verified Carbon Standard (VCS)',
      existingCertificateUrl: transaction.certificateUrl,
    };
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

// Admin query to get all transactions with pagination
export const getAllTransactionsAdmin = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('processing'),
        v.literal('completed'),
        v.literal('failed'),
        v.literal('refunded'),
        v.literal('expired')
      )
    ),
  },
  handler: async (ctx, args) => {
    const { limit = 50, status } = args;

    const transactions = status
      ? await ctx.db
          .query('transactions')
          .withIndex('by_payment_status', (q) => q.eq('paymentStatus', status))
          .order('desc')
          .take(limit)
      : await ctx.db.query('transactions').order('desc').take(limit);

    // Enrich transactions with project and buyer data
    return await Promise.all(
      transactions.map(async (transaction) => {
        let project = null;
        let buyer = null;

        if (transaction.projectId) {
          project = await ctx.db.get(transaction.projectId);
        }

        // Get buyer details from users table using clerkId
        const users = await ctx.db
          .query('users')
          .withIndex('by_clerk_id', (q) => q.eq('clerkId', transaction.buyerId))
          .first();

        if (users) {
          buyer = {
            name: users.name || 'Unknown User',
            email: users.email || '',
            clerkId: users.clerkId,
          };
        }

        return {
          ...transaction,
          project,
          buyer,
        };
      })
    );
  },
});

// Admin mutation to update transaction status
export const updateTransactionStatus = mutation({
  args: {
    transactionId: v.id('transactions'),
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
    const { transactionId, status } = args;

    await ctx.db.patch(transactionId, {
      paymentStatus: status,
    });

    return { success: true };
  },
});

// Admin mutation to add certificate URL
export const addCertificateUrl = mutation({
  args: {
    transactionId: v.id('transactions'),
    certificateUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { transactionId, certificateUrl } = args;

    await ctx.db.patch(transactionId, {
      certificateUrl,
    });

    return { success: true };
  },
});

// Admin mutation to process refund with details
export const processRefund = mutation({
  args: {
    transactionId: v.id('transactions'),
    refundReason: v.string(),
    refundAmount: v.number(),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { transactionId, refundReason, refundAmount, adminNotes } = args;

    // Get the transaction to validate
    const transaction = await ctx.db.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Validate refund amount
    if (refundAmount > transaction.totalAmount) {
      throw new Error('Refund amount cannot exceed transaction amount');
    }

    if (refundAmount <= 0) {
      throw new Error('Refund amount must be greater than 0');
    }

    // Update transaction status and add refund details
    await ctx.db.patch(transactionId, {
      paymentStatus: 'refunded',
      refundDetails: {
        refundReason,
        refundAmount,
        adminNotes: adminNotes || '',
        processedAt: Date.now(),
      },
    });

    return {
      success: true,
      message: `Refund of $${refundAmount} processed successfully`,
    };
  },
});
