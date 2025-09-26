import { v } from 'convex/values';
import { action, mutation, query } from './_generated/server';

export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});

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

export const uploadProjectDocument = mutation({
  args: {
    projectId: v.id('projects'),
    fileName: v.string(),
    fileType: v.string(),
    storageId: v.string(), // Storage ID from successful upload
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Get the project to verify ownership
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Verify the user owns the project
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user || project.creatorId !== user._id) {
      throw new Error('Unauthorized to upload documents for this project');
    }

    // Generate a public URL for the stored file
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) {
      throw new Error('Failed to generate file URL');
    }

    // Get file size from storage metadata
    const fileSize = 0; // We'll need to get this from the client
    const fileSizeFormatted = formatFileSize(fileSize);

    // Create a document record in the documents table
    const documentId = await ctx.db.insert('documents', {
      entityId: args.projectId,
      entityType: 'project',
      fileName: args.storageId, // Using storageId as filename since it's unique
      originalName: args.fileName,
      fileType: args.fileType,
      fileSize: fileSize,
      fileSizeFormatted: fileSizeFormatted,
      media: {
        cloudinary_public_id: args.storageId, // Using storageId as public_id
        cloudinary_url: fileUrl,
      },
      documentType: 'other', // Default type, can be updated later
      uploadedBy: user._id,
      isRequired: false,
      isVerified: false,
    });

    return { documentId, storageId: args.storageId, fileUrl };
  },
});

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const updateProject = mutation({
  args: {
    projectId: v.id('projects'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    projectType: v.optional(
      v.union(
        v.literal('reforestation'),
        v.literal('solar'),
        v.literal('wind'),
        v.literal('biogas'),
        v.literal('waste_management'),
        v.literal('mangrove_restoration')
      )
    ),
    location: v.optional(
      v.object({
        lat: v.float64(),
        long: v.float64(),
        name: v.string(),
      })
    ),
    areaSize: v.optional(v.number()),
    estimatedCO2Reduction: v.optional(v.number()),
    budget: v.optional(v.number()),
    startDate: v.optional(v.string()),
    expectedCompletionDate: v.optional(v.string()),
    totalCarbonCredits: v.optional(v.number()),
    pricePerCredit: v.optional(v.number()),
    status: v.optional(v.string()),
    requiredDocuments: v.optional(v.array(v.string())),
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

    // Verify the user owns the project
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user || project.creatorId !== user._id) {
      throw new Error('Unauthorized to edit this project');
    }

    // Build the update object with only provided fields
    const updateData: any = {};
    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined)
      updateData.description = args.description;
    if (args.projectType !== undefined)
      updateData.projectType = args.projectType;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.areaSize !== undefined) updateData.areaSize = args.areaSize;
    if (args.estimatedCO2Reduction !== undefined)
      updateData.estimatedCO2Reduction = args.estimatedCO2Reduction;
    if (args.budget !== undefined) updateData.budget = args.budget;
    if (args.startDate !== undefined) updateData.startDate = args.startDate;
    if (args.expectedCompletionDate !== undefined)
      updateData.expectedCompletionDate = args.expectedCompletionDate;
    if (args.totalCarbonCredits !== undefined)
      updateData.totalCarbonCredits = args.totalCarbonCredits;
    if (args.pricePerCredit !== undefined)
      updateData.pricePerCredit = args.pricePerCredit;
    if (args.status !== undefined) updateData.status = args.status;
    if (args.requiredDocuments !== undefined)
      updateData.requiredDocuments = args.requiredDocuments;

    // Update the project
    await ctx.db.patch(args.projectId, updateData);

    return args.projectId;
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id('projects'),
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

    // Verify the user owns the project
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user || project.creatorId !== user._id) {
      throw new Error('Unauthorized to delete this project');
    }

    // Delete the project
    await ctx.db.delete(args.projectId);

    return args.projectId;
  },
});
