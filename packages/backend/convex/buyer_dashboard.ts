import { query } from './_generated/server';
import { v } from 'convex/values';

export const getBuyerPurchaseHistory = query({
  args: { buyerClerkId: v.string() },
  handler: async (ctx, args) => {
    // First find the user by Clerk ID
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.buyerClerkId))
      .first();

    if (!user) {
      return { purchases: [], totalImpact: {
        totalCredits: 0,
        totalSpent: 0,
        totalCO2Offset: 0,
        equivalentTrees: 0,
        equivalentCarsOff: 0,
      }};
    }

    // Get all transactions for this buyer
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', user.clerkId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'completed'))
      .collect();

    // Get project details for each transaction
    const purchases = await Promise.all(
      transactions.map(async (transaction) => {
        let project = null;
        if (transaction.projectId) {
          project = await ctx.db.get(transaction.projectId);
        }

        return {
          id: transaction._id,
          project: project?.title || 'Unknown Project',
          certificateId: `CERT-${transaction.transactionReference}`,
          purchaseDate: transaction._creationTime,
          credits: transaction.creditAmount,
          price: transaction.unitPrice,
          status: 'Active',
          impact: {
            co2Offset: transaction.creditAmount * 1.2, // Approximate calculation
          }
        };
      })
    );

    // Calculate total impact
    const totalCredits = transactions.reduce((sum, t) => sum + t.creditAmount, 0);
    const totalSpent = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalCO2Offset = totalCredits * 1.2; // Approximate calculation
    const equivalentTrees = Math.round(totalCO2Offset * 15); // ~15 trees per ton CO2
    const equivalentCarsOff = Math.round(totalCO2Offset / 4.6); // ~4.6 tons CO2 per car per year

    return {
      purchases,
      totalImpact: {
        totalCredits,
        totalSpent,
        totalCO2Offset,
        equivalentTrees,
        equivalentCarsOff,
      }
    };
  },
});

export const getBuyerCertificates = query({
  args: { buyerClerkId: v.string() },
  handler: async (ctx, args) => {
    // First find the user by Clerk ID
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.buyerClerkId))
      .first();

    if (!user) {
      return [];
    }

    // Get all certificates for this buyer
    const certificates = await ctx.db
      .query('certificates')
      .withIndex('by_buyer', (q) => q.eq('buyerId', user.clerkId))
      .collect();

    // Get additional details for each certificate
    const certificatesWithDetails = await Promise.all(
      certificates.map(async (cert) => {
        const project = await ctx.db.get(cert.projectId);
        const transaction = await ctx.db.get(cert.transactionId);

        return {
          ...cert,
          projectTitle: project?.title || 'Unknown Project',
          transactionAmount: transaction?.totalAmount || 0,
        };
      })
    );

    return certificatesWithDetails;
  },
});

export const getBuyerDashboardSummary = query({
  args: { buyerClerkId: v.string() },
  handler: async (ctx, args) => {
    // First find the user by Clerk ID
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.buyerClerkId))
      .first();

    if (!user) {
      return {
        totalTransactions: 0,
        totalCredits: 0,
        totalSpent: 0,
        activeCertificates: 0,
        totalCO2Offset: 0,
      };
    }

    // Get completed transactions count and totals
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', user.clerkId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'completed'))
      .collect();

    // Get certificates count
    const certificates = await ctx.db
      .query('certificates')
      .withIndex('by_buyer', (q) => q.eq('buyerId', user.clerkId))
      .filter((q) => q.eq(q.field('isValid'), true))
      .collect();

    const totalCredits = transactions.reduce((sum, t) => sum + t.creditAmount, 0);
    const totalSpent = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalCO2Offset = totalCredits * 1.2; // Approximate calculation

    return {
      totalTransactions: transactions.length,
      totalCredits,
      totalSpent,
      activeCertificates: certificates.length,
      totalCO2Offset,
    };
  },
});

export const getBuyerProjectTracking = query({
  args: { buyerClerkId: v.string() },
  handler: async (ctx, args) => {
    // First find the user by Clerk ID
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.buyerClerkId))
      .first();

    if (!user) {
      return [];
    }

    // Get all completed transactions for this buyer
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', user.clerkId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'completed'))
      .collect();

    // Get detailed project tracking data for each project
    const projectTrackingData = await Promise.all(
      transactions.map(async (transaction) => {
        if (!transaction.projectId) return null;
        const project = await ctx.db.get(transaction.projectId);
        if (!project) return null;

        const creator = await ctx.db.get(project.creatorId);

        // Get recent progress updates for this project
        const progressUpdates = await ctx.db
          .query('progressUpdates')
          .withIndex('by_project', (q) => q.eq('projectId', project._id))
          .order('desc')
          .take(10);

        // Get milestones for this project
        const milestones = await ctx.db
          .query('projectMilestones')
          .withIndex('by_project', (q) => q.eq('projectId', project._id))
          .order('asc')
          .collect();

        // Get alerts for this project
        const alerts = await ctx.db
          .query('systemAlerts')
          .withIndex('by_project', (q) => q.eq('projectId', project._id))
          .collect();

        return {
          projectId: project._id,
          projectTitle: project.title,
          projectType: project.projectType,
          creatorName: creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown',
          location: {
            region: project.location.name,
            country: 'Sri Lanka', // Default for now
          },
          purchaseInfo: {
            creditsOwned: transaction.creditAmount,
            totalInvestment: transaction.totalAmount,
            purchaseDate: transaction._creationTime,
          },
          currentStatus: {
            overallProgress: project.progressPercentage || 0,
            currentPhase: getProjectPhase(project.status),
            nextMilestone: getNextMilestone(milestones),
            nextMilestoneDate: getNextMilestoneDate(milestones),
          },
          impact: {
            carbonOffset: transaction.creditAmount * 1.2, // Approximate
          },
          alerts: alerts.map(alert => ({
            id: alert._id,
            message: alert.message,
            severity: alert.severity,
            date: alert._creationTime,
            isResolved: alert.isResolved,
          })),
          recentUpdates: progressUpdates.map(update => ({
            id: update._id,
            title: update.title,
            description: update.description,
            date: update.submittedAt || update.reportingDate,
            photos: update.photoUrls || [],
          })),
          milestones: milestones.map(milestone => ({
            id: milestone._id,
            title: milestone.title,
            description: milestone.description,
            status: milestone.status,
            plannedDate: milestone.plannedDate,
            actualDate: milestone.actualDate,
          })),
        };
      })
    );

    // Filter out null results and return
    return projectTrackingData.filter(Boolean);
  },
});

// Helper functions for getBuyerProjectTracking
function getProjectPhase(status: string): string {
  switch (status) {
    case 'active':
      return 'Implementation';
    case 'completed':
      return 'Completed';
    case 'approved':
      return 'Planning';
    case 'under_review':
      return 'Under Review';
    default:
      return 'Planning';
  }
}

function getNextMilestone(milestones: any[]): string {
  const nextMilestone = milestones.find(m => m.status === 'pending' || m.status === 'in_progress');
  return nextMilestone?.title || 'Project Completion';
}

function getNextMilestoneDate(milestones: any[]): number {
  const nextMilestone = milestones.find(m => m.status === 'pending' || m.status === 'in_progress');
  return nextMilestone?.plannedDate || Date.now() + (30 * 24 * 60 * 60 * 1000); // Default to 30 days from now
}