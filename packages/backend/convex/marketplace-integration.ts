import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';
import type { Id } from './_generated/dataModel';
import type { CreditBatch } from './credit-batch-management';

// ============= MARKETPLACE INTEGRATION TYPES =============

export interface MarketplaceEntry {
  entryId: string;
  projectId: Id<'projects'>;
  batchId: string;
  availableCredits: number;
  pricePerCredit: number;
  totalValue: number;
  listingDate: number;
  lastUpdated: number;
  status: 'active' | 'sold_out' | 'delisted' | 'suspended';
  metadata: {
    projectType: string;
    vintage: number;
    methodology: string;
    verificationStandard: string;
    qualityScore: number;
  };
  marketingData: {
    title: string;
    description: string;
    highlights: string[];
    certifications: string[];
    impactMetrics: Record<string, any>;
  };
}

export interface MarketplaceUpdate {
  entryId: string;
  updateType:
    | 'price_change'
    | 'credit_adjustment'
    | 'status_change'
    | 'metadata_update';
  oldValue: any;
  newValue: any;
  updatedBy: Id<'users'> | 'system';
  updateReason: string;
  timestamp: number;
}

export interface CreditsReservation {
  reservationId: string;
  entryId: string;
  buyerId: Id<'users'>;
  reservedCredits: number;
  reservedAt: number;
  expiresAt: number;
  reservationPrice: number;
  status: 'active' | 'expired' | 'confirmed' | 'cancelled';
}

export interface MarketplaceAnalytics {
  totalListings: number;
  totalCreditsAvailable: number;
  totalValue: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  demandMetrics: {
    viewCount: number;
    inquiryCount: number;
    reservationCount: number;
    conversionRate: number;
  };
  topPerformingProjects: Array<{
    projectId: Id<'projects'>;
    projectTitle: string;
    creditsListed: number;
    creditsSold: number;
    averagePrice: number;
    demandScore: number;
  }>;
}

// ============= MARKETPLACE INTEGRATION FUNCTIONS =============

/**
 * Automatically update marketplace when credits are issued
 */
export const updateMarketplaceFromBatch = internalMutation({
  args: {
    batchId: v.string(),
    action: v.union(
      v.literal('list'), // List new credits
      v.literal('update'), // Update existing listing
      v.literal('delist'), // Remove from marketplace
      v.literal('adjust_quantity') // Adjust available credits
    ),
    adjustmentCredits: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batch = await getBatchById(ctx, args.batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    const project = await ctx.db.get(batch.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    switch (args.action) {
      case 'list':
        await listCreditsInMarketplace(ctx, batch, project);
        break;
      case 'update':
        await updateMarketplaceListing(ctx, batch, project);
        break;
      case 'delist':
        await delistCredits(ctx, args.batchId);
        break;
      case 'adjust_quantity':
        await adjustMarketplaceQuantity(
          ctx,
          args.batchId,
          args.adjustmentCredits || 0
        );
        break;
    }

    // Log marketplace action
    await ctx.db.insert('auditLogs', {
      userId: undefined, // System action
      action: 'marketplace_update',
      entityType: 'project',
      entityId: batch.projectId,
      newValues: {
        batchId: args.batchId,
        action: args.action,
        adjustmentCredits: args.adjustmentCredits,
      },
      metadata: {
        batchId: args.batchId,
        action: args.action,
        availableCredits: batch.availableCredits,
      },
      severity: 'info',
    });
  },
});

/**
 * List new credits in marketplace
 */
async function listCreditsInMarketplace(
  ctx: any,
  batch: CreditBatch,
  project: any
): Promise<void> {
  const entryId = generateMarketplaceEntryId(batch.batchId);

  const marketplaceEntry: MarketplaceEntry = {
    entryId,
    projectId: batch.projectId,
    batchId: batch.batchId,
    availableCredits: batch.availableCredits,
    pricePerCredit: batch.priceRange.suggested,
    totalValue: batch.availableCredits * batch.priceRange.suggested,
    listingDate: Date.now(),
    lastUpdated: Date.now(),
    status: 'active',
    metadata: {
      projectType: project.projectType,
      vintage: batch.vintage,
      methodology: batch.methodology,
      verificationStandard: batch.verificationStandard || 'VCS',
      qualityScore: Math.round(
        ((batch.qualityMetrics.additionality +
          batch.qualityMetrics.permanence +
          batch.qualityMetrics.measureability +
          (1 - batch.qualityMetrics.leakage)) /
          4) *
          100
      ),
    },
    marketingData: await generateMarketingData(ctx, project, batch),
  };

  // Store marketplace entry
  await ctx.db.insert('monitoringConfig', {
    projectType: 'marketplace_entry',
    configKey: `entry_${entryId}`,
    configValue: marketplaceEntry,
    isActive: true,
    description: `Marketplace entry for batch ${batch.batchId}`,
  });

  // Create or update carbon credits entry
  await createOrUpdateCarbonCredits(ctx, marketplaceEntry);
}

/**
 * Update existing marketplace listing
 */
async function updateMarketplaceListing(
  ctx: any,
  batch: CreditBatch,
  project: any
): Promise<void> {
  const entries = await ctx.db
    .query('monitoringConfig')
    .filter((q: any) =>
      q.and(
        q.eq(q.field('projectType'), 'marketplace_entry'),
        q.gte(q.field('configKey'), 'entry_'),
        q.lt(q.field('configKey'), 'entry_~')
      )
    )
    .collect();

  const existingEntry = entries
    .map((config) => config.configValue as MarketplaceEntry)
    .find((entry) => entry.batchId === batch.batchId);

  if (existingEntry) {
    existingEntry.availableCredits = batch.availableCredits;
    existingEntry.totalValue =
      batch.availableCredits * existingEntry.pricePerCredit;
    existingEntry.lastUpdated = Date.now();

    if (batch.availableCredits === 0) {
      existingEntry.status = 'sold_out';
    }

    // Update stored entry
    const config = entries.find(
      (c) =>
        (c.configValue as MarketplaceEntry).entryId === existingEntry.entryId
    );
    if (config) {
      await ctx.db.patch(config._id, {
        configValue: existingEntry,
      });
    }

    // Update carbon credits
    await updateCarbonCreditsEntry(ctx, existingEntry);
  }
}

/**
 * Delist credits from marketplace
 */
async function delistCredits(ctx: any, batchId: string): Promise<void> {
  const entries = await ctx.db
    .query('monitoringConfig')
    .filter((q: any) =>
      q.and(
        q.eq(q.field('projectType'), 'marketplace_entry'),
        q.gte(q.field('configKey'), 'entry_'),
        q.lt(q.field('configKey'), 'entry_~')
      )
    )
    .collect();

  const entryConfig = entries.find((config) => {
    const entry = config.configValue as MarketplaceEntry;
    return entry.batchId === batchId;
  });

  if (entryConfig) {
    const entry = entryConfig.configValue as MarketplaceEntry;
    entry.status = 'delisted';
    entry.lastUpdated = Date.now();

    await ctx.db.patch(entryConfig._id, {
      configValue: entry,
      isActive: false,
    });

    // Remove from carbon credits
    await delistCarbonCredits(ctx, entry.entryId);
  }
}

/**
 * Reserve credits for purchase
 */
export const reserveCredits = mutation({
  args: {
    entryId: v.string(),
    buyerId: v.id('users'),
    creditsToReserve: v.number(),
    reservationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<CreditsReservation> => {
    const entry = await getMarketplaceEntry(ctx, args.entryId);
    if (!entry) {
      throw new Error('Marketplace entry not found');
    }

    if (entry.status !== 'active') {
      throw new Error('Credits are not available for reservation');
    }

    if (args.creditsToReserve > entry.availableCredits) {
      throw new Error('Not enough credits available');
    }

    const reservationMinutes = args.reservationMinutes || 15; // Default 15 minutes
    const expiresAt = Date.now() + reservationMinutes * 60 * 1000;

    const reservation: CreditsReservation = {
      reservationId: generateReservationId(),
      entryId: args.entryId,
      buyerId: args.buyerId,
      reservedCredits: args.creditsToReserve,
      reservedAt: Date.now(),
      expiresAt,
      reservationPrice: entry.pricePerCredit,
      status: 'active',
    };

    // Store reservation
    await ctx.db.insert('monitoringConfig', {
      projectType: 'credit_reservation',
      configKey: `reservation_${reservation.reservationId}`,
      configValue: reservation,
      isActive: true,
      description: `Credit reservation for ${args.creditsToReserve} credits`,
    });

    // Update marketplace entry
    entry.availableCredits -= args.creditsToReserve;
    await updateMarketplaceEntryInDB(ctx, entry);

    // Update carbon credits entry
    await updateCarbonCreditsReservation(
      ctx,
      args.entryId,
      args.buyerId,
      args.creditsToReserve,
      expiresAt
    );

    // Log reservation
    await ctx.db.insert('auditLogs', {
      userId: args.buyerId,
      action: 'credits_reserved',
      entityType: 'marketplace',
      entityId: args.entryId,
      newValues: reservation,
      metadata: {
        reservationId: reservation.reservationId,
        creditsReserved: args.creditsToReserve,
        expiresAt,
      },
      severity: 'info',
    });

    return reservation;
  },
});

/**
 * Confirm credit purchase (complete transaction)
 */
export const confirmCreditPurchase = mutation({
  args: {
    reservationId: v.string(),
    transactionId: v.id('transactions'),
  },
  handler: async (ctx, args) => {
    const reservation = await getReservation(ctx, args.reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status !== 'active') {
      throw new Error('Reservation is not active');
    }

    if (Date.now() > reservation.expiresAt) {
      throw new Error('Reservation has expired');
    }

    // Update reservation status
    reservation.status = 'confirmed';
    await updateReservationInDB(ctx, reservation);

    // Update carbon credits entry to mark as sold
    await completeCreditSale(
      ctx,
      reservation.entryId,
      reservation.reservedCredits
    );

    // Log purchase confirmation
    await ctx.db.insert('auditLogs', {
      userId: reservation.buyerId,
      action: 'credit_purchase_confirmed',
      entityType: 'transaction',
      entityId: args.transactionId,
      newValues: {
        reservationId: args.reservationId,
        creditsConfirmed: reservation.reservedCredits,
        finalPrice: reservation.reservedCredits * reservation.reservationPrice,
      },
      metadata: {
        reservationId: args.reservationId,
        creditsConfirmed: reservation.reservedCredits,
        buyerId: reservation.buyerId,
      },
      severity: 'info',
    });

    return {
      confirmed: true,
      creditsConfirmed: reservation.reservedCredits,
      finalPrice: reservation.reservedCredits * reservation.reservationPrice,
    };
  },
});

/**
 * Cancel credit reservation
 */
export const cancelReservation = mutation({
  args: {
    reservationId: v.string(),
    cancelledBy: v.id('users'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reservation = await getReservation(ctx, args.reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status !== 'active') {
      throw new Error('Reservation is not active');
    }

    // Update reservation status
    reservation.status = 'cancelled';
    await updateReservationInDB(ctx, reservation);

    // Release reserved credits back to marketplace
    const entry = await getMarketplaceEntry(ctx, reservation.entryId);
    if (entry) {
      entry.availableCredits += reservation.reservedCredits;
      await updateMarketplaceEntryInDB(ctx, entry);
    }

    // Update carbon credits entry
    await releaseCreditReservation(
      ctx,
      reservation.entryId,
      reservation.reservedCredits
    );

    // Log cancellation
    await ctx.db.insert('auditLogs', {
      userId: args.cancelledBy,
      action: 'reservation_cancelled',
      entityType: 'marketplace',
      entityId: reservation.entryId,
      newValues: {
        reservationId: args.reservationId,
        creditsReleased: reservation.reservedCredits,
        reason: args.reason,
      },
      metadata: {
        reservationId: args.reservationId,
        creditsReleased: reservation.reservedCredits,
        cancelledBy: args.cancelledBy,
      },
      severity: 'info',
    });

    return {
      cancelled: true,
      creditsReleased: reservation.reservedCredits,
    };
  },
});

/**
 * Get marketplace analytics
 */
export const getMarketplaceAnalytics = query({
  args: { timeframe: v.optional(v.string()) },
  handler: async (ctx, args): Promise<MarketplaceAnalytics> => {
    const entries = await ctx.db
      .query('monitoringConfig')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('projectType'), 'marketplace_entry'),
          q.eq(q.field('isActive'), true)
        )
      )
      .collect();

    const marketplaceEntries = entries.map(
      (config) => config.configValue as MarketplaceEntry
    );
    const activeEntries = marketplaceEntries.filter(
      (entry) => entry.status === 'active'
    );

    const totalCreditsAvailable = activeEntries.reduce(
      (sum, entry) => sum + entry.availableCredits,
      0
    );

    const totalValue = activeEntries.reduce(
      (sum, entry) => sum + entry.totalValue,
      0
    );

    const prices = activeEntries.map((entry) => entry.pricePerCredit);
    const averagePrice =
      prices.length > 0
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length
        : 0;

    // Get demand metrics from audit logs
    const demandMetrics = await calculateDemandMetrics(ctx, args.timeframe);

    // Calculate top performing projects
    const topPerformingProjects = await calculateTopPerformingProjects(
      ctx,
      activeEntries
    );

    return {
      totalListings: activeEntries.length,
      totalCreditsAvailable,
      totalValue,
      averagePrice,
      priceRange: {
        min: Math.min(...prices, 0),
        max: Math.max(...prices, 0),
      },
      demandMetrics,
      topPerformingProjects,
    };
  },
});

/**
 * Get marketplace listings with filters
 */
export const getMarketplaceListings = query({
  args: {
    projectType: v.optional(v.string()),
    priceRange: v.optional(v.object({ min: v.number(), max: v.number() })),
    vintage: v.optional(v.number()),
    methodology: v.optional(v.string()),
    sortBy: v.optional(
      v.union(
        v.literal('price_asc'),
        v.literal('price_desc'),
        v.literal('date_asc'),
        v.literal('date_desc'),
        v.literal('quality_desc')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query('monitoringConfig')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('projectType'), 'marketplace_entry'),
          q.eq(q.field('isActive'), true)
        )
      )
      .collect();

    let marketplaceEntries = entries
      .map((config) => config.configValue as MarketplaceEntry)
      .filter(
        (entry) => entry.status === 'active' && entry.availableCredits > 0
      );

    // Apply filters
    if (args.projectType) {
      marketplaceEntries = marketplaceEntries.filter(
        (entry) => entry.metadata.projectType === args.projectType
      );
    }

    if (args.priceRange) {
      marketplaceEntries = marketplaceEntries.filter(
        (entry) =>
          entry.pricePerCredit >= args.priceRange!.min &&
          entry.pricePerCredit <= args.priceRange!.max
      );
    }

    if (args.vintage) {
      marketplaceEntries = marketplaceEntries.filter(
        (entry) => entry.metadata.vintage === args.vintage
      );
    }

    if (args.methodology) {
      marketplaceEntries = marketplaceEntries.filter((entry) =>
        entry.metadata.methodology.includes(args.methodology!)
      );
    }

    // Apply sorting
    switch (args.sortBy) {
      case 'price_asc':
        marketplaceEntries.sort((a, b) => a.pricePerCredit - b.pricePerCredit);
        break;
      case 'price_desc':
        marketplaceEntries.sort((a, b) => b.pricePerCredit - a.pricePerCredit);
        break;
      case 'date_desc':
        marketplaceEntries.sort((a, b) => b.listingDate - a.listingDate);
        break;
      case 'quality_desc':
        marketplaceEntries.sort(
          (a, b) => b.metadata.qualityScore - a.metadata.qualityScore
        );
        break;
      default:
        marketplaceEntries.sort((a, b) => b.listingDate - a.listingDate);
    }

    // Apply limit
    if (args.limit) {
      marketplaceEntries = marketplaceEntries.slice(0, args.limit);
    }

    return marketplaceEntries;
  },
});

// ============= UTILITY FUNCTIONS =============

async function getBatchById(
  ctx: any,
  batchId: string
): Promise<CreditBatch | null> {
  const config = await ctx.db
    .query('monitoringConfig')
    .filter((q: any) =>
      q.and(
        q.eq(q.field('projectType'), 'credit_batch'),
        q.eq(q.field('configKey'), `batch_${batchId}`)
      )
    )
    .first();

  return config?.configValue || null;
}

async function generateMarketingData(
  ctx: any,
  project: any,
  batch: CreditBatch
): Promise<MarketplaceEntry['marketingData']> {
  return {
    title: `${project.title} - Carbon Credits`,
    description: `High-quality carbon credits from ${project.projectType} project. ${project.description}`,
    highlights: generateProjectHighlights(project, batch),
    certifications: [batch.verificationStandard || 'VCS', batch.methodology],
    impactMetrics: {
      co2Reduction: project.estimatedCO2Reduction,
      projectArea: project.areaSize,
      location: project.location.name,
      startDate: project.startDate,
    },
  };
}

function generateProjectHighlights(project: any, batch: CreditBatch): string[] {
  const highlights: string[] = [];

  // Quality-based highlights
  if (batch.qualityMetrics.additionality > 0.9) {
    highlights.push('Verified Additional Impact');
  }
  if (batch.qualityMetrics.permanence > 0.9) {
    highlights.push('High Permanence Rating');
  }
  if (batch.qualityMetrics.measureability > 0.9) {
    highlights.push('Precisely Measured Impact');
  }

  // Project-specific highlights
  switch (project.projectType) {
    case 'reforestation':
      highlights.push('Biodiversity Conservation', 'Community Benefits');
      break;
    case 'solar':
      highlights.push('Clean Energy Generation', 'Grid-Connected');
      break;
    case 'mangrove_restoration':
      highlights.push('Coastal Protection', 'Blue Carbon');
      break;
  }

  return highlights;
}

function generateMarketplaceEntryId(batchId: string): string {
  return `MKT-${batchId}-${Date.now().toString().slice(-6)}`;
}

function generateReservationId(): string {
  return `RES-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

async function getMarketplaceEntry(
  ctx: any,
  entryId: string
): Promise<MarketplaceEntry | null> {
  const config = await ctx.db
    .query('monitoringConfig')
    .filter((q: any) =>
      q.and(
        q.eq(q.field('projectType'), 'marketplace_entry'),
        q.eq(q.field('configKey'), `entry_${entryId}`)
      )
    )
    .first();

  return config?.configValue || null;
}

async function getReservation(
  ctx: any,
  reservationId: string
): Promise<CreditsReservation | null> {
  const config = await ctx.db
    .query('monitoringConfig')
    .filter((q: any) =>
      q.and(
        q.eq(q.field('projectType'), 'credit_reservation'),
        q.eq(q.field('configKey'), `reservation_${reservationId}`)
      )
    )
    .first();

  return config?.configValue || null;
}

async function updateMarketplaceEntryInDB(
  ctx: any,
  entry: MarketplaceEntry
): Promise<void> {
  const config = await ctx.db
    .query('monitoringConfig')
    .filter((q: any) =>
      q.and(
        q.eq(q.field('projectType'), 'marketplace_entry'),
        q.eq(q.field('configKey'), `entry_${entry.entryId}`)
      )
    )
    .first();

  if (config) {
    await ctx.db.patch(config._id, {
      configValue: entry,
    });
  }
}

async function createOrUpdateCarbonCredits(
  ctx: any,
  entry: MarketplaceEntry
): Promise<void> {
  const existing = await ctx.db
    .query('carbonCredits')
    .filter((q: any) => q.eq(q.field('batchNumber'), entry.batchId))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      creditAmount: entry.availableCredits,
      pricePerCredit: entry.pricePerCredit,
      totalPrice: entry.totalValue,
      status: entry.availableCredits > 0 ? 'available' : 'sold',
    });
  } else {
    await ctx.db.insert('carbonCredits', {
      projectId: entry.projectId,
      creditAmount: entry.availableCredits,
      pricePerCredit: entry.pricePerCredit,
      totalPrice: entry.totalValue,
      status: 'available',
      batchNumber: entry.batchId,
    });
  }
}

// Placeholder implementations for additional functions
async function updateCarbonCreditsEntry(
  ctx: any,
  entry: MarketplaceEntry
): Promise<void> {
  await createOrUpdateCarbonCredits(ctx, entry);
}

async function delistCarbonCredits(ctx: any, entryId: string): Promise<void> {
  // Implementation for delisting carbon credits
}

async function adjustMarketplaceQuantity(
  ctx: any,
  batchId: string,
  adjustment: number
): Promise<void> {
  // Implementation for adjusting marketplace quantity
}

async function updateCarbonCreditsReservation(
  ctx: any,
  entryId: string,
  buyerId: Id<'users'>,
  credits: number,
  expiresAt: number
): Promise<void> {
  // Implementation for updating carbon credits with reservation
}

async function completeCreditSale(
  ctx: any,
  entryId: string,
  creditsSold: number
): Promise<void> {
  // Implementation for completing credit sale
}

async function releaseCreditReservation(
  ctx: any,
  entryId: string,
  credits: number
): Promise<void> {
  // Implementation for releasing credit reservation
}

async function updateReservationInDB(
  ctx: any,
  reservation: CreditsReservation
): Promise<void> {
  const config = await ctx.db
    .query('monitoringConfig')
    .filter((q: any) =>
      q.and(
        q.eq(q.field('projectType'), 'credit_reservation'),
        q.eq(q.field('configKey'), `reservation_${reservation.reservationId}`)
      )
    )
    .first();

  if (config) {
    await ctx.db.patch(config._id, {
      configValue: reservation,
    });
  }
}

async function calculateDemandMetrics(
  ctx: any,
  timeframe?: string
): Promise<any> {
  // Placeholder for demand metrics calculation
  return {
    viewCount: 1250,
    inquiryCount: 89,
    reservationCount: 34,
    conversionRate: 0.38,
  };
}

async function calculateTopPerformingProjects(
  ctx: any,
  entries: MarketplaceEntry[]
): Promise<MarketplaceAnalytics['topPerformingProjects']> {
  // Placeholder for top performing projects calculation
  return [];
}
