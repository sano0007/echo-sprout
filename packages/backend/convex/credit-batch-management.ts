import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Id } from './_generated/dataModel';
import type {
  CreditBatch,
  CreditCalculationResult,
} from './credit-calculation';

// ============= CREDIT BATCH MANAGEMENT TYPES =============

export interface BatchCreationRequest {
  projectId: Id<'projects'>;
  creditCalculationResult: CreditCalculationResult;
  requestedCredits: number;
  priceRange: {
    minimum: number;
    maximum: number;
    suggested: number;
  };
  vintage: number; // Year
  notes?: string;
}

export interface BatchVerificationResult {
  batchId: string;
  verified: boolean;
  verifierId: Id<'users'>;
  verificationDate: number;
  findings: string[];
  recommendations: string[];
  qualityAssessment: {
    additionality: number;
    permanence: number;
    measureability: number;
    leakage: number;
  };
  adjustedCredits?: number; // If different from requested
  conditions?: string[];
}

export interface BatchRetirement {
  batchId: string;
  retiredCredits: number;
  retiredBy: Id<'users'>;
  retirementReason:
    | 'voluntary'
    | 'compliance'
    | 'offset_claim'
    | 'buffer_release';
  beneficiary?: string;
  retirementNote?: string;
  certificateUrl?: string;
}

export interface BatchTransfer {
  fromBatchId: string;
  toBatchId: string;
  transferredCredits: number;
  transferReason: 'split' | 'merge' | 'correction' | 'reissuance';
  authorizedBy: Id<'users'>;
  notes?: string;
}

// ============= BATCH MANAGEMENT FUNCTIONS =============

/**
 * Create a new credit batch from calculation results
 */
export const createCreditBatch = mutation({
  args: {
    projectId: v.id('projects'),
    creditCalculationResult: v.any(),
    requestedCredits: v.number(),
    priceRange: v.object({
      minimum: v.number(),
      maximum: v.number(),
      suggested: v.number(),
    }),
    vintage: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Generate unique batch ID
    const batchId = generateBatchId(project.projectType, args.vintage);

    // Calculate serial numbers
    const serialNumbers = await generateSerialNumbers(
      ctx,
      batchId,
      args.requestedCredits
    );

    // Determine buffer percentage
    const bufferPercentage = getBufferPercentage(project.projectType);

    // Create batch record
    const batch: CreditBatch = {
      batchId,
      projectId: args.projectId,
      credits: args.requestedCredits,
      vintage: args.vintage,
      issuanceDate: Date.now(),
      methodology: args.creditCalculationResult.methodology,
      verificationStandard: getVerificationStandard(project.projectType),
      status: 'draft',
      serialNumbers,
      qualityMetrics: calculateQualityMetrics(
        args.creditCalculationResult,
        project
      ),
      priceRange: args.priceRange,
      bufferPercentage,
      retiredCredits: 0,
      availableCredits: args.requestedCredits,
    };

    // Store batch in monitoring config (we'll use it as a flexible storage)
    await ctx.db.insert('monitoringConfig', {
      projectType: 'credit_batch',
      configKey: `batch_${batchId}`,
      configValue: batch,
      isActive: true,
      description: `Credit batch ${batchId} for project ${project.title}`,
    });

    // Update project with new batch
    await updateProjectBatches(ctx, args.projectId, batchId);

    // Log batch creation
    await ctx.db.insert('auditLogs', {
      userId: undefined, // System action
      action: 'credit_batch_created',
      entityType: 'project',
      entityId: args.projectId,
      newValues: {
        batchId,
        credits: args.requestedCredits,
        methodology: args.creditCalculationResult.methodology,
      },
      metadata: {
        batchId,
        credits: args.requestedCredits,
        vintage: args.vintage,
        projectType: project.projectType,
      },
      severity: 'info',
    });

    return batchId;
  },
});

/**
 * Submit batch for verification
 */
export const submitBatchForVerification = mutation({
  args: {
    batchId: v.string(),
    submittedBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    const batch = await getBatchById(ctx, args.batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    if (batch.status !== 'draft') {
      throw new Error('Only draft batches can be submitted for verification');
    }

    // Update batch status
    batch.status = 'pending_verification';

    await updateBatch(ctx, args.batchId, batch);

    // Assign to available verifier
    const verifier = await assignVerifier(ctx, batch.projectId);

    if (verifier) {
      batch.verifierId = verifier._id;
      await updateBatch(ctx, args.batchId, batch);
    }

    // Log submission
    await ctx.db.insert('auditLogs', {
      userId: args.submittedBy,
      action: 'batch_submitted_for_verification',
      entityType: 'project',
      entityId: batch.projectId,
      newValues: {
        batchId: args.batchId,
        status: 'pending_verification',
        verifierId: verifier?._id,
      },
      metadata: {
        batchId: args.batchId,
        credits: batch.credits,
        submittedBy: args.submittedBy,
      },
      severity: 'info',
    });

    return {
      submitted: true,
      status: 'pending_verification',
      verifierId: verifier?._id,
    };
  },
});

/**
 * Verify a credit batch
 */
export const verifyCreditBatch = mutation({
  args: {
    batchId: v.string(),
    verifierId: v.id('users'),
    verified: v.boolean(),
    findings: v.array(v.string()),
    recommendations: v.array(v.string()),
    qualityAssessment: v.object({
      additionality: v.number(),
      permanence: v.number(),
      measureability: v.number(),
      leakage: v.number(),
    }),
    adjustedCredits: v.optional(v.number()),
    conditions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<BatchVerificationResult> => {
    const verifier = await ctx.db.get(args.verifierId);
    if (!verifier || verifier.role !== 'verifier') {
      throw new Error('Only verifiers can verify credit batches');
    }

    const batch = await getBatchById(ctx, args.batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    if (batch.status !== 'pending_verification') {
      throw new Error('Batch is not pending verification');
    }

    // Update batch with verification results
    batch.status = args.verified ? 'verified' : 'rejected';
    batch.verifierId = args.verifierId;
    batch.verificationDate = Date.now();
    batch.qualityMetrics = args.qualityAssessment;

    if (args.adjustedCredits) {
      batch.credits = args.adjustedCredits;
      batch.availableCredits = args.adjustedCredits;
    }

    await updateBatch(ctx, args.batchId, batch);

    const verificationResult: BatchVerificationResult = {
      batchId: args.batchId,
      verified: args.verified,
      verifierId: args.verifierId,
      verificationDate: Date.now(),
      findings: args.findings,
      recommendations: args.recommendations,
      qualityAssessment: args.qualityAssessment,
      adjustedCredits: args.adjustedCredits,
      conditions: args.conditions,
    };

    // Log verification
    await ctx.db.insert('auditLogs', {
      userId: args.verifierId,
      action: 'batch_verification_completed',
      entityType: 'project',
      entityId: batch.projectId,
      newValues: verificationResult,
      metadata: {
        batchId: args.batchId,
        verified: args.verified,
        finalCredits: batch.credits,
        verifierEmail: verifier.email,
      },
      severity: args.verified ? 'info' : 'warning',
    });

    return verificationResult;
  },
});

/**
 * Issue verified credits to marketplace
 */
export const issueCreditBatch = mutation({
  args: {
    batchId: v.string(),
    issuedBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    const batch = await getBatchById(ctx, args.batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    if (batch.status !== 'verified') {
      throw new Error('Only verified batches can be issued');
    }

    // Update batch status
    batch.status = 'issued';
    await updateBatch(ctx, args.batchId, batch);

    // Create marketplace entries
    await createMarketplaceEntries(ctx, batch);

    // Log issuance
    await ctx.db.insert('auditLogs', {
      userId: args.issuedBy,
      action: 'batch_issued_to_marketplace',
      entityType: 'project',
      entityId: batch.projectId,
      newValues: {
        batchId: args.batchId,
        credits: batch.credits,
        issuedAt: Date.now(),
      },
      metadata: {
        batchId: args.batchId,
        credits: batch.credits,
        issuedBy: args.issuedBy,
      },
      severity: 'info',
    });

    return {
      issued: true,
      batchId: args.batchId,
      credits: batch.credits,
      issuedAt: Date.now(),
    };
  },
});

/**
 * Retire credits from a batch
 */
export const retireCredits = mutation({
  args: {
    batchId: v.string(),
    creditsToRetire: v.number(),
    retiredBy: v.id('users'),
    retirementReason: v.union(
      v.literal('voluntary'),
      v.literal('compliance'),
      v.literal('offset_claim'),
      v.literal('buffer_release')
    ),
    beneficiary: v.optional(v.string()),
    retirementNote: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<BatchRetirement> => {
    const batch = await getBatchById(ctx, args.batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    if (batch.status !== 'issued') {
      throw new Error('Only issued batches can have credits retired');
    }

    if (args.creditsToRetire > batch.availableCredits) {
      throw new Error('Cannot retire more credits than available');
    }

    // Update batch
    batch.retiredCredits += args.creditsToRetire;
    batch.availableCredits -= args.creditsToRetire;

    if (batch.availableCredits === 0) {
      batch.status = 'retired';
    }

    await updateBatch(ctx, args.batchId, batch);

    // Generate retirement certificate
    const certificateUrl = await generateRetirementCertificate(
      args.batchId,
      args.creditsToRetire,
      args.retirementReason,
      args.beneficiary
    );

    const retirement: BatchRetirement = {
      batchId: args.batchId,
      retiredCredits: args.creditsToRetire,
      retiredBy: args.retiredBy,
      retirementReason: args.retirementReason,
      beneficiary: args.beneficiary,
      retirementNote: args.retirementNote,
      certificateUrl,
    };

    // Log retirement
    await ctx.db.insert('auditLogs', {
      userId: args.retiredBy,
      action: 'credits_retired',
      entityType: 'project',
      entityId: batch.projectId,
      newValues: retirement,
      metadata: {
        batchId: args.batchId,
        retiredCredits: args.creditsToRetire,
        remainingCredits: batch.availableCredits,
        retirementReason: args.retirementReason,
      },
      severity: 'info',
    });

    return retirement;
  },
});

/**
 * Get all batches for a project
 */
export const getProjectBatches = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const batches = await ctx.db
      .query('monitoringConfig')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('projectType'), 'credit_batch'),
          q.gte(q.field('configKey'), 'batch_'),
          q.lt(q.field('configKey'), 'batch_~')
        )
      )
      .collect();

    return batches
      .map((config) => config.configValue as CreditBatch)
      .filter((batch) => batch.projectId === args.projectId)
      .sort((a, b) => b.issuanceDate - a.issuanceDate);
  },
});

/**
 * Get batch details by ID
 */
export const getBatchDetails = query({
  args: { batchId: v.string() },
  handler: async (ctx, args) => {
    return await getBatchById(ctx, args.batchId);
  },
});

/**
 * Get verification queue
 */
export const getVerificationQueue = query({
  args: { verifierId: v.optional(v.id('users')) },
  handler: async (ctx, args) => {
    const batches = await ctx.db
      .query('monitoringConfig')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('projectType'), 'credit_batch'),
          q.gte(q.field('configKey'), 'batch_'),
          q.lt(q.field('configKey'), 'batch_~')
        )
      )
      .collect();

    const pendingBatches = batches
      .map((config) => config.configValue as CreditBatch)
      .filter((batch) => batch.status === 'pending_verification');

    if (args.verifierId) {
      return pendingBatches.filter(
        (batch) => batch.verifierId === args.verifierId
      );
    }

    return pendingBatches.sort((a, b) => a.issuanceDate - b.issuanceDate);
  },
});

// ============= UTILITY FUNCTIONS =============

function generateBatchId(projectType: string, vintage: number): string {
  const typeCode = projectType.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${typeCode}-${vintage}-${timestamp}-${random}`;
}

async function generateSerialNumbers(
  ctx: any,
  batchId: string,
  creditCount: number
): Promise<{ start: string; end: string }> {
  // Get last serial number used
  const lastBatch = await ctx.db
    .query('monitoringConfig')
    .filter((q: any) =>
      q.and(
        q.eq(q.field('projectType'), 'credit_batch'),
        q.gte(q.field('configKey'), 'batch_'),
        q.lt(q.field('configKey'), 'batch_~')
      )
    )
    .order('desc')
    .first();

  let startNumber = 1000000; // Start from 1 million

  if (lastBatch) {
    const lastBatchData = lastBatch.configValue as CreditBatch;
    const lastEnd = parseInt(
      lastBatchData.serialNumbers.end.split('-').pop() || '0'
    );
    startNumber = lastEnd + 1;
  }

  const endNumber = startNumber + creditCount - 1;

  return {
    start: `${batchId}-${startNumber.toString().padStart(8, '0')}`,
    end: `${batchId}-${endNumber.toString().padStart(8, '0')}`,
  };
}

function getVerificationStandard(projectType: string): string {
  const standards: Record<string, string> = {
    reforestation: 'VCS',
    mangrove_restoration: 'VCS',
    solar: 'VCS',
    wind: 'VCS',
    biogas: 'VCS',
    waste_management: 'VCS',
  };
  return standards[projectType] || 'VCS';
}

function calculateQualityMetrics(
  calculationResult: CreditCalculationResult,
  project: any
): CreditBatch['qualityMetrics'] {
  // Base quality on calculation confidence and project characteristics
  const baseQuality = calculationResult.qualityScore / 100;

  return {
    additionality: Math.min(baseQuality + 0.1, 1.0), // Assume good additionality
    permanence: getProjectPermanence(project.projectType),
    measureability: baseQuality,
    leakage: Math.max(0.1, 1 - baseQuality), // Lower is better for leakage
  };
}

function getProjectPermanence(projectType: string): number {
  const permanence: Record<string, number> = {
    reforestation: 0.8, // High permanence risk
    mangrove_restoration: 0.75, // Climate risk
    solar: 0.95, // Very permanent
    wind: 0.95,
    biogas: 0.9,
    waste_management: 0.9,
  };
  return permanence[projectType] || 0.85;
}

function getBufferPercentage(projectType: string): number {
  const buffers: Record<string, number> = {
    reforestation: 0.15,
    mangrove_restoration: 0.2,
    solar: 0.05,
    wind: 0.05,
    biogas: 0.1,
    waste_management: 0.1,
  };
  return buffers[projectType] || 0.1;
}

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

async function updateBatch(
  ctx: any,
  batchId: string,
  batch: CreditBatch
): Promise<void> {
  const config = await ctx.db
    .query('monitoringConfig')
    .filter((q: any) =>
      q.and(
        q.eq(q.field('projectType'), 'credit_batch'),
        q.eq(q.field('configKey'), `batch_${batchId}`)
      )
    )
    .first();

  if (config) {
    await ctx.db.patch(config._id, {
      configValue: batch,
    });
  }
}

async function updateProjectBatches(
  ctx: any,
  projectId: Id<'projects'>,
  newBatchId: string
): Promise<void> {
  // Update project with new batch reference
  const project = await ctx.db.get(projectId);
  if (!project) return;

  // Note: In a real implementation, you might want to add a batches field to the project schema
  // For now, we'll track this through audit logs
  await ctx.db.insert('auditLogs', {
    userId: undefined,
    action: 'project_batch_association',
    entityType: 'project',
    entityId: projectId,
    newValues: {
      batchId: newBatchId,
      associatedAt: Date.now(),
    },
    metadata: {
      projectId,
      batchId: newBatchId,
    },
    severity: 'info',
  });
}

async function assignVerifier(
  ctx: any,
  projectId: Id<'projects'>
): Promise<any> {
  const project = await ctx.db.get(projectId);
  if (!project) return null;

  // Find available verifier with matching specialty
  const verifiers = await ctx.db
    .query('users')
    .withIndex('by_role', (q: any) => q.eq('role', 'verifier'))
    .filter((q: any) => q.eq(q.field('isActive'), true))
    .collect();

  // Find verifier with matching specialty or general verifier
  const suitableVerifier = verifiers.find(
    (v) =>
      v.verifierSpecialty?.includes(project.projectType) ||
      v.verifierSpecialty?.includes('general')
  );

  return suitableVerifier || verifiers[0]; // Return first available if no specialty match
}

async function createMarketplaceEntries(
  ctx: any,
  batch: CreditBatch
): Promise<void> {
  // Create carbon credit entries in the marketplace
  await ctx.db.insert('carbonCredits', {
    projectId: batch.projectId,
    creditAmount: batch.availableCredits,
    pricePerCredit: batch.priceRange.suggested,
    totalPrice: batch.availableCredits * batch.priceRange.suggested,
    status: 'available',
    batchNumber: batch.batchId,
  });
}

async function generateRetirementCertificate(
  batchId: string,
  retiredCredits: number,
  reason: string,
  beneficiary?: string
): Promise<string> {
  // In a real implementation, this would generate a PDF certificate
  // For now, return a placeholder URL
  const certificateId = `CERT-${batchId}-${Date.now()}`;
  return `https://certificates.echosprout.com/${certificateId}.pdf`;
}
