import { v } from 'convex/values';
import { action, mutation, query } from './_generated/server';
import { WorkflowService } from '../services/workflow-service';
import { VerifierAssignmentService } from '../services/verifier-assignment-service';

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

export const getProject = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    return project;
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

    // Check if status is changing to 'under_review' (submitted for verification)
    const isSubmittingForReview =
      args.status === 'under_review' && project.status === 'draft';

    // Update the project
    await ctx.db.patch(args.projectId, updateData);

    // Trigger verification workflow if project is being submitted for review
    if (isSubmittingForReview) {
      try {
        // Update project status for submission workflow
        await ctx.db.patch(args.projectId, {
          verificationStatus: 'pending',
        });

        // Trigger workflow system for project submission
        await WorkflowService.handleProjectSubmission(ctx, args.projectId);

        // Try automatic verifier assignment if enabled
        const verificationId =
          await VerifierAssignmentService.autoAssignVerifier(
            ctx,
            args.projectId,
            {
              requireSpecialty: true,
              maxWorkload: 8,
              priorityBoost: false,
            },
            undefined, // Use default due date
            'normal' // Default priority
          );

        if (verificationId) {
          // Update project with verification assignment
          await ctx.db.patch(args.projectId, {
            verificationStatus: 'in_progress',
          });
        }
      } catch (error) {
        console.error('Error in verification workflow:', error);
        // Don't fail the entire update, but log the error
        // The project status will still be updated to under_review
        // Manual assignment can be done later by admin
      }
    }

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

// Get project verification status and details
export const getProjectVerificationStatus = query({
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

    // Verify the user owns the project or is the assigned verifier
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const canView =
      project.creatorId === user._id ||
      project.assignedVerifierId === user._id ||
      user.role === 'admin';

    if (!canView) {
      throw new Error('Unauthorized to view this project verification status');
    }

    // Get verification record if exists
    const verification = await ctx.db
      .query('verifications')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .unique();

    // Get assigned verifier details if exists
    let assignedVerifier = null;
    if (project.assignedVerifierId) {
      assignedVerifier = await ctx.db.get(project.assignedVerifierId);
    }

    // Get verification messages if verification exists
    let messages: any[] = [];
    if (verification) {
      messages = await ctx.db
        .query('verificationMessages')
        .withIndex('by_verification', (q) =>
          q.eq('verificationId', verification._id)
        )
        .order('desc')
        .take(10); // Latest 10 messages
    }

    // Get project documents
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_entity', (q) =>
        q.eq('entityId', args.projectId).eq('entityType', 'project')
      )
      .collect();

    return {
      project: {
        ...project,
        verification,
        assignedVerifier: assignedVerifier
          ? {
              _id: assignedVerifier._id,
              firstName: assignedVerifier.firstName,
              lastName: assignedVerifier.lastName,
              email: assignedVerifier.email,
              verifierSpecialty: assignedVerifier.verifierSpecialty,
            }
          : null,
        recentMessages: messages,
        documents,
      },
      canModify: project.creatorId === user._id,
      canVerify: project.assignedVerifierId === user._id,
      isAdmin: user.role === 'admin',
    };
  },
});

// Submit project for verification (alternative to status update)
export const submitProjectForVerification = mutation({
  args: {
    projectId: v.id('projects'),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('normal'),
        v.literal('high'),
        v.literal('urgent')
      )
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

    // Verify the user owns the project
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user || project.creatorId !== user._id) {
      throw new Error('Unauthorized to submit this project');
    }

    // Check if project is in correct status
    if (project.status !== 'draft') {
      throw new Error(
        'Project must be in draft status to submit for verification'
      );
    }

    // Update project status
    await ctx.db.patch(args.projectId, {
      status: 'under_review',
      verificationStatus: 'pending',
    });

    // Trigger verification workflow
    await WorkflowService.handleProjectSubmission(ctx, args.projectId);

    // Try automatic verifier assignment
    const verificationId = await VerifierAssignmentService.autoAssignVerifier(
      ctx,
      args.projectId,
      {
        requireSpecialty: true,
        maxWorkload: 8,
        priorityBoost: args.priority === 'urgent',
      },
      undefined, // Use default due date
      args.priority || 'normal'
    );

    if (verificationId) {
      // Update project with verification assignment
      await ctx.db.patch(args.projectId, {
        verificationStatus: 'in_progress',
      });

      return {
        success: true,
        verificationId,
        message: 'Project submitted and automatically assigned to verifier',
      };
    } else {
      return {
        success: true,
        verificationId: null,
        message: 'Project submitted, pending manual verifier assignment',
      };
    }
  },
});

// Get project timeline and verification events
export const getProjectTimeline = query({
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

    // Verify access
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const canView =
      project.creatorId === user._id ||
      project.assignedVerifierId === user._id ||
      user.role === 'admin';

    if (!canView) {
      throw new Error('Unauthorized to view this project timeline');
    }

    // Get workflow events for this project
    const workflowEvents = await ctx.db
      .query('auditLogs')
      .withIndex('by_entity', (q) =>
        q.eq('entityType', 'workflow').eq('entityId', args.projectId)
      )
      .order('desc')
      .collect();

    // Get verification events if verification exists
    const verification = await ctx.db
      .query('verifications')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .unique();

    let verificationEvents: any[] = [];
    if (verification) {
      verificationEvents = await ctx.db
        .query('auditLogs')
        .withIndex('by_entity', (q) =>
          q.eq('entityType', 'verification').eq('entityId', verification._id)
        )
        .order('desc')
        .collect();
    }

    // Combine and sort all events
    const allEvents = [...workflowEvents, ...verificationEvents].sort(
      (a, b) => (b._creationTime || 0) - (a._creationTime || 0)
    );

    return {
      project,
      verification,
      timeline: allEvents,
    };
  },
});
