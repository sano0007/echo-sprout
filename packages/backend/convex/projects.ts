import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

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
    requiredDocuments: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Get the user from the database
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Create the project
    const projectId = await ctx.db.insert('projects', {
      creatorId: user._id,
      title: args.title,
      description: args.description,
      projectType: args.projectType,
      location: args.location,
      areaSize: args.areaSize,
      estimatedCO2Reduction: args.estimatedCO2Reduction,
      budget: args.budget,
      startDate: args.startDate,
      expectedCompletionDate: args.expectedCompletionDate,
      status: 'draft',
      verificationStatus: 'pending',
      totalCarbonCredits: args.totalCarbonCredits,
      pricePerCredit: args.pricePerCredit,
      creditsAvailable: args.totalCarbonCredits,
      creditsSold: 0,
      assignedVerifierId: undefined,
      verificationStartedAt: undefined,
      verificationCompletedAt: undefined,
      qualityScore: undefined,
      requiredDocuments: args.requiredDocuments,
      submittedDocuments: [],
      isDocumentationComplete: false,
      actualCompletionDate: undefined,
    });

    return projectId;
  },
});

export const getUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get the user from the database
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user) {
      return [];
    }

    // Get all projects for this user
    const projects = await ctx.db
      .query('projects')
      .filter((q) => q.eq(q.field('creatorId'), user._id))
      .collect();

    // Get the creator information for each project
    const projectsWithCreator = await Promise.all(
      projects.map(async (project) => {
        const creator = await ctx.db.get(project.creatorId);
        return {
          ...project,
          creator: creator
            ? {
                firstName: creator.firstName,
                lastName: creator.lastName,
                email: creator.email,
              }
            : {
                firstName: 'Unknown',
                lastName: 'User',
                email: '',
              },
        };
      })
    );

    return projectsWithCreator;
  },
});

export const updateProjectStatus = mutation({
  args: {
    projectId: v.id('projects'),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Get the project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Update the project status
    await ctx.db.patch(args.projectId, {
      status: args.status,
    });

    return args.projectId;
  },
});
