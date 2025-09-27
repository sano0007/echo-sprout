import { internalMutation, mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';

// Create a new project
export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    projectType: v.union(
      v.literal('reforestation'),
      v.literal('solar'),
      v.literal('wind'),
      v.literal('biogas'),
      v.literal('waste_management'),
      v.literal('mangrove_restoration')
    ),
    location: v.object({
      lat: v.float64(),
      long: v.float64(),
      name: v.string(),
    }),
    areaSize: v.number(),
    estimatedCO2Reduction: v.number(),
    budget: v.number(),
    startDate: v.string(),
    expectedCompletionDate: v.string(),
    totalCarbonCredits: v.number(),
    pricePerCredit: v.number(),
    creditsAvailable: v.number(),
    creditsSold: v.number(),
    requiredDocuments: v.array(v.string()),
    submittedDocuments: v.array(v.string()),
    isDocumentationComplete: v.boolean(),
  },
  handler: async (ctx, args) => {
    // For now, create a dummy user ID - in production this would come from auth
    const dummyUserId = await ctx.db
      .query('users')
      .first()
      .then((user) => user?._id);

    if (!dummyUserId) {
      throw new ConvexError(
        'No users found in database. Please create users first.'
      );
    }

    const projectId = await ctx.db.insert('projects', {
      creatorId: dummyUserId,
      title: args.title,
      description: args.description,
      projectType: args.projectType,
      location: args.location,
      areaSize: args.areaSize,
      estimatedCO2Reduction: args.estimatedCO2Reduction,
      budget: args.budget,
      startDate: args.startDate,
      expectedCompletionDate: args.expectedCompletionDate,
      actualCompletionDate: undefined,
      status: 'active' as const,
      verificationStatus: 'verified' as const,
      totalCarbonCredits: args.totalCarbonCredits,
      pricePerCredit: args.pricePerCredit,
      creditsAvailable: args.creditsAvailable,
      creditsSold: args.creditsSold,
      assignedVerifierId: undefined,
      verificationStartedAt: undefined,
      verificationCompletedAt: undefined,
      qualityScore: undefined,
      requiredDocuments: args.requiredDocuments,
      submittedDocuments: args.submittedDocuments,
      isDocumentationComplete: args.isDocumentationComplete,
    });

    return projectId;
  },
});

// Internal mutation for seeding (bypasses auth)
export const createProjectForSeeding = internalMutation({
  args: {
    creatorId: v.id('users'),
    title: v.string(),
    description: v.string(),
    projectType: v.union(
      v.literal('reforestation'),
      v.literal('solar'),
      v.literal('wind'),
      v.literal('biogas'),
      v.literal('waste_management'),
      v.literal('mangrove_restoration')
    ),
    location: v.object({
      lat: v.float64(),
      long: v.float64(),
      name: v.string(),
    }),
    areaSize: v.number(),
    estimatedCO2Reduction: v.number(),
    budget: v.number(),
    startDate: v.string(),
    expectedCompletionDate: v.string(),
    status: v.union(
      v.literal('draft'),
      v.literal('submitted'),
      v.literal('under_review'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('active'),
      v.literal('completed'),
      v.literal('suspended')
    ),
    verificationStatus: v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('verified'),
      v.literal('rejected'),
      v.literal('revision_required')
    ),
    totalCarbonCredits: v.number(),
    pricePerCredit: v.number(),
    creditsAvailable: v.number(),
    creditsSold: v.number(),
    requiredDocuments: v.array(v.string()),
    submittedDocuments: v.array(v.string()),
    isDocumentationComplete: v.boolean(),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert('projects', {
      creatorId: args.creatorId,
      title: args.title,
      description: args.description,
      projectType: args.projectType,
      location: args.location,
      areaSize: args.areaSize,
      estimatedCO2Reduction: args.estimatedCO2Reduction,
      budget: args.budget,
      startDate: args.startDate,
      expectedCompletionDate: args.expectedCompletionDate,
      actualCompletionDate: undefined,
      status: args.status,
      verificationStatus: args.verificationStatus,
      totalCarbonCredits: args.totalCarbonCredits,
      pricePerCredit: args.pricePerCredit,
      creditsAvailable: args.creditsAvailable,
      creditsSold: args.creditsSold,
      assignedVerifierId: undefined,
      verificationStartedAt: undefined,
      verificationCompletedAt: undefined,
      qualityScore: undefined,
      requiredDocuments: args.requiredDocuments,
      submittedDocuments: args.submittedDocuments,
      isDocumentationComplete: args.isDocumentationComplete,
      images: args.images,
    });

    return projectId;
  },
});

// Get all projects
export const getAllProjects = query({
  handler: async (ctx) => {
    return await ctx.db.query('projects').collect();
  },
});

// Delete all projects (for testing/seeding purposes)
export const deleteAllProjects = internalMutation({
  handler: async (ctx) => {
    const projects = await ctx.db.query('projects').collect();

    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    return { deleted: projects.length };
  },
});
