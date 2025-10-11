import { v } from 'convex/values';
import { action, mutation, query, internalMutation } from './_generated/server';
import { z, ZodError } from 'zod';
import { Doc, Id } from './_generated/dataModel';
import { WorkflowService } from '../services/workflow-service';
import { VerifierAssignmentService } from '../services/verifier-assignment-service';

// ===============================
// ZOD VALIDATION SCHEMAS
// ===============================

// Project Type Enum
const ProjectTypeSchema = z.enum([
  'reforestation',
  'solar',
  'wind',
  'biogas',
  'waste_management',
  'mangrove_restoration',
]);

// Location Schema
const LocationSchema = z.object({
  lat: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  long: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  name: z
    .string()
    .min(1, 'Location name is required')
    .max(200, 'Location name must not exceed 200 characters')
    .trim(),
  city: z
    .string()
    .max(100, 'City name must not exceed 100 characters')
    .trim()
    .optional(),
  country: z
    .string()
    .max(100, 'Country name must not exceed 100 characters')
    .trim()
    .optional(),
});

// Date validation helper
const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

// Milestone Schema (for creation - strict)
const MilestoneSchema = z.object({
  name: z
    .string()
    .min(1, 'Milestone name is required')
    .max(200, 'Milestone name must not exceed 200 characters')
    .trim(),
  date: DateStringSchema,
});

// Flexible Milestone Schema (for updates - allows empty)
const FlexibleMilestoneSchema = z.object({
  name: z
    .string()
    .max(200, 'Milestone name must not exceed 200 characters')
    .trim(),
  date: z
    .string()
    .refine(
      (val) => val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Date must be empty or in YYYY-MM-DD format'
    ),
});

// Create Project Schema
const CreateProjectSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Project title must be at least 3 characters')
      .max(100, 'Project title must not exceed 100 characters')
      .trim(),
    description: z
      .string()
      .min(50, 'Description must be at least 50 characters')
      .max(2000, 'Description must not exceed 2000 characters')
      .trim(),
    projectType: ProjectTypeSchema,
    location: LocationSchema,
    areaSize: z
      .number()
      .positive('Area size must be greater than 0')
      .max(1000000, 'Area size seems unrealistic'),
    estimatedCO2Reduction: z
      .number()
      .positive('CO2 reduction must be greater than 0')
      .max(10000000, 'CO2 reduction seems unrealistic'),
    budget: z
      .number()
      .positive('Budget must be greater than 0')
      .max(1000000000, 'Budget seems unrealistic'),
    startDate: DateStringSchema,
    expectedCompletionDate: DateStringSchema,
    totalCarbonCredits: z
      .number()
      .int('Carbon credits must be a whole number')
      .positive('Carbon credits must be greater than 0')
      .max(1000000, 'Carbon credits amount seems unrealistic'),
    pricePerCredit: z
      .number()
      .positive('Price per credit must be greater than 0')
      .max(1000, 'Price per credit seems unrealistic'),
    requiredDocuments: z
      .array(z.string())
      .max(20, 'Too many required documents')
      .default([]),
    milestone1: MilestoneSchema.optional(),
    milestone2: MilestoneSchema.optional(),
  })
  .refine(
    (data) => new Date(data.startDate) < new Date(data.expectedCompletionDate),
    {
      message: 'Expected completion date must be after start date',
      path: ['expectedCompletionDate'],
    }
  );

// Update Project Schema (all fields optional except projectId)
const UpdateProjectSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    projectType: ProjectTypeSchema.optional(),
    location: z
      .object({
        lat: z.number().optional(),
        long: z.number().optional(),
        name: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    areaSize: z.number().optional(),
    estimatedCO2Reduction: z.number().optional(),
    budget: z.number().optional(),
    startDate: z.string().optional(),
    expectedCompletionDate: z.string().optional(),
    totalCarbonCredits: z.number().optional(),
    pricePerCredit: z.number().optional(),
    status: z
      .enum([
        'draft',
        'under_review',
        'approved',
        'active',
        'completed',
        'suspended',
        'rejected',
      ])
      .optional(),
    requiredDocuments: z.array(z.string()).optional(),
    milestone1: z
      .object({
        name: z.string().optional(),
        date: z.string().optional(),
      })
      .optional(),
    milestone2: z
      .object({
        name: z.string().optional(),
        date: z.string().optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.expectedCompletionDate) {
        return new Date(data.startDate) < new Date(data.expectedCompletionDate);
      }
      return true;
    },
    {
      message: 'Expected completion date must be after start date',
      path: ['expectedCompletionDate'],
    }
  );

// Document Type Enum
const DocumentTypeSchema = z.enum([
  'project_proposal',
  'environmental_impact',
  'site_photographs',
  'legal_permits',
  'featured_images',
  'site_images',
]);

// Document Upload Schema
const DocumentUploadSchema = z.object({
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name too long'),
  fileType: z
    .string()
    .regex(/^[a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+$/, 'Invalid file type format'),
  storageId: z.string().min(1, 'Storage ID is required'),
  documentType: DocumentTypeSchema,
  description: z.string().max(500, 'Description too long').optional(),
});

// Priority Schema
const PrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

// ===============================
// VALIDATION HELPER FUNCTIONS
// ===============================

/**
 * Validates and sanitizes project creation data
 */
function validateProjectCreation(
  data: unknown
): z.infer<typeof CreateProjectSchema> {
  try {
    // Ensure requiredDocuments defaults to empty array if missing
    const dataWithDefaults = {
      ...(typeof data === 'object' && data !== null ? data : {}),
      requiredDocuments: (data as any)?.requiredDocuments || [],
    };

    return CreateProjectSchema.parse(dataWithDefaults);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(
        (issue) => `${issue.path.join('.') || 'field'}: ${issue.message}`
      );
      throw new Error(`Validation failed: ${messages.join(', ')}`);
    }
    throw error;
  }
}

/**
 * Validates and sanitizes project update data
 */
function validateProjectUpdate(
  data: unknown
): z.infer<typeof UpdateProjectSchema> {
  try {
    return UpdateProjectSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(
        (issue) => `${issue.path.join('.') || 'field'}: ${issue.message}`
      );
      throw new Error(`Validation failed: ${messages.join(', ')}`);
    }
    throw error;
  }
}

/**
 * Validates document upload data
 */
function validateDocumentUpload(
  data: unknown
): z.infer<typeof DocumentUploadSchema> {
  try {
    return DocumentUploadSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(
        (issue) => `${issue.path.join('.') || 'field'}: ${issue.message}`
      );
      throw new Error(`Validation failed: ${messages.join(', ')}`);
    }
    throw error;
  }
}

// ===============================
// TYPE DEFINITIONS
// ===============================

type ProjectCreationData = z.infer<typeof CreateProjectSchema>;
type ProjectUpdateData = z.infer<typeof UpdateProjectSchema>;
type DocumentUploadData = z.infer<typeof DocumentUploadSchema>;
type ProjectPriority = z.infer<typeof PrioritySchema>;

// Interface for user creator information
interface ProjectCreator {
  firstName: string;
  lastName: string;
  email: string;
}

// Interface for project with creator
interface ProjectWithCreator extends Doc<'projects'> {
  creator: ProjectCreator;
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Formats file size in bytes to human readable string
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates user permissions for project operations
 * @param userRole - User's role in the system
 * @param operation - Type of operation being performed
 * @returns boolean indicating if operation is allowed
 */
function validateProjectPermissions(
  userRole: string | undefined,
  operation: 'create' | 'update' | 'delete' | 'view'
): boolean {
  if (!userRole) return false;

  switch (operation) {
    case 'create':
    case 'update':
    case 'delete':
      return ['project_creator', 'admin'].includes(userRole);
    case 'view':
      return ['project_creator', 'credit_buyer', 'verifier', 'admin'].includes(
        userRole
      );
    default:
      return false;
  }
}

/**
 * Checks if a project is in a valid state for specific operations
 * @param status - Current project status
 * @param operation - Operation to be performed
 * @returns boolean indicating if operation is valid
 */
function isValidProjectOperation(
  status: string,
  operation: 'edit' | 'submit' | 'upload' | 'delete'
): boolean {
  switch (operation) {
    case 'edit':
    case 'upload':
    case 'delete':
      return !['completed', 'rejected', 'cancelled'].includes(status);
    case 'submit':
      return status === 'draft';
    default:
      return false;
  }
}

export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});

/**
 * Creates a new carbon credit project with comprehensive validation
 * @param args - Project creation data following CreateProjectSchema
 * @returns Project ID of the created project
 */
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
    // Validate authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }

    // Get the user from the database
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

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
    });

    return projectId;
  },
});

// Get all projects
export const getAllProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('projects').collect();
  },
});

// Delete all projects (for testing/seeding purposes)
export const deleteAllProjects = internalMutation({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query('projects').collect();

    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    return { deleted: projects.length };
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
  handler: async (ctx): Promise<ProjectWithCreator[]> => {
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

    try {
      // Get all projects for this user
      const projects = await ctx.db
        .query('projects')
        .filter((q) => q.eq(q.field('creatorId'), user._id))
        .order('desc') // Most recent first
        .collect();

      // Get the creator information for each project with proper typing
      const projectsWithCreator: ProjectWithCreator[] = await Promise.all(
        projects.map(async (project) => {
          const creator = await ctx.db.get(project.creatorId);

          const projectCreator: ProjectCreator = creator
            ? {
                firstName: creator.firstName || 'Unknown',
                lastName: creator.lastName || 'User',
                email: creator.email || '',
              }
            : {
                firstName: 'Unknown',
                lastName: 'User',
                email: '',
              };

          return {
            ...project,
            creator: projectCreator,
          };
        })
      );

      return projectsWithCreator;
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw new Error('Failed to fetch projects');
    }
  },
});

/**
 * Uploads a document for a specific project with validation
 * @param args - Document upload data including projectId, fileName, fileType, storageId
 * @returns Document metadata including documentId, storageId, and fileUrl
 */
export const uploadProjectDocument = mutation({
  args: {
    projectId: v.id('projects'),
    fileName: v.string(),
    fileType: v.string(),
    storageId: v.string(), // Storage ID from successful upload
    documentType: v.union(
      v.literal('project_proposal'),
      v.literal('environmental_impact'),
      v.literal('site_photographs'),
      v.literal('legal_permits'),
      v.literal('featured_images'),
      v.literal('site_images')
    ),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }

    // Validate document upload data
    const validatedData = validateDocumentUpload({
      fileName: args.fileName,
      fileType: args.fileType,
      storageId: args.storageId,
      documentType: args.documentType,
      description: args.description,
    });

    // Additional validation based on document type
    if (
      ['featured_images', 'site_photographs', 'site_images'].includes(
        validatedData.documentType
      )
    ) {
      if (!validatedData.fileType.startsWith('image/')) {
        throw new Error(
          `${validatedData.documentType.replace('_', ' ')} must be image files`
        );
      }
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

    if (!user) {
      throw new Error('User not found');
    }

    if (project.creatorId !== user._id) {
      throw new Error(
        'Unauthorized: You can only upload documents to your own projects'
      );
    }

    // Check if project allows document uploads (not completed or cancelled)
    if (['completed', 'cancelled', 'rejected'].includes(project.status)) {
      throw new Error('Cannot upload documents to projects in this status');
    }

    try {
      // Generate a public URL for the stored file
      const fileUrl = await ctx.storage.getUrl(validatedData.storageId);
      if (!fileUrl) {
        throw new Error('Failed to generate file URL');
      }

      // Create a document record in the documents table
      const documentId = await ctx.db.insert('documents', {
        entityId: args.projectId,
        entityType: 'project',
        fileName: validatedData.storageId, // Using storageId as filename since it's unique
        originalName: validatedData.fileName,
        fileType: validatedData.fileType,
        fileSize: 0, // Will be updated by client if available
        fileSizeFormatted: '0 Bytes',
        media: {
          storageId: validatedData.storageId,
          fileUrl: fileUrl,
        },
        documentType: validatedData.documentType,
        description: validatedData.description || '',
        uploadedBy: user._id,
        isRequired: [
          'project_proposal',
          'environmental_impact',
          'legal_permits',
        ].includes(validatedData.documentType),
        isVerified: false,
      });

      return {
        documentId,
        storageId: validatedData.storageId,
        fileUrl,
        success: true,
      };
    } catch (error) {
      console.error('Error uploading project document:', error);
      throw new Error('Failed to upload document. Please try again.');
    }
  },
});

/**
 * Updates an existing project with comprehensive validation
 * @param args - Project update data following UpdateProjectSchema
 * @returns Updated project ID
 */
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
        city: v.optional(v.string()),
        country: v.optional(v.string()),
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
    milestone1: v.optional(
      v.object({
        name: v.string(),
        date: v.string(),
      })
    ),
    milestone2: v.optional(
      v.object({
        name: v.string(),
        date: v.string(),
      })
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
      throw new Error('Unauthorized to edit this project');
    }

    // Validate and sanitize the update data using Zod
    const validatedData = validateProjectUpdate({
      title: args.title,
      description: args.description,
      projectType: args.projectType,
      location: args.location,
      areaSize: args.areaSize,
      estimatedCO2Reduction: args.estimatedCO2Reduction,
      budget: args.budget,
      startDate: args.startDate,
      expectedCompletionDate: args.expectedCompletionDate,
      totalCarbonCredits: args.totalCarbonCredits,
      pricePerCredit: args.pricePerCredit,
      status: args.status,
      requiredDocuments: args.requiredDocuments,
      milestone1: args.milestone1,
      milestone2: args.milestone2,
    });

    // Build the update object with only provided fields
    const updateData: any = {};
    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.projectType !== undefined)
      updateData.projectType = validatedData.projectType;
    if (validatedData.location !== undefined)
      updateData.location = validatedData.location;
    if (validatedData.areaSize !== undefined)
      updateData.areaSize = validatedData.areaSize;
    if (validatedData.estimatedCO2Reduction !== undefined)
      updateData.estimatedCO2Reduction = validatedData.estimatedCO2Reduction;
    if (validatedData.budget !== undefined)
      updateData.budget = validatedData.budget;
    if (validatedData.startDate !== undefined)
      updateData.startDate = validatedData.startDate;
    if (validatedData.expectedCompletionDate !== undefined)
      updateData.expectedCompletionDate = validatedData.expectedCompletionDate;
    if (validatedData.totalCarbonCredits !== undefined)
      updateData.totalCarbonCredits = validatedData.totalCarbonCredits;
    if (validatedData.pricePerCredit !== undefined)
      updateData.pricePerCredit = validatedData.pricePerCredit;
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;
    if (validatedData.requiredDocuments !== undefined)
      updateData.requiredDocuments = validatedData.requiredDocuments;
    if (validatedData.milestone1 !== undefined)
      updateData.milestone1 = validatedData.milestone1;
    if (validatedData.milestone2 !== undefined)
      updateData.milestone2 = validatedData.milestone2;

    // Additional business logic validation
    if (
      validatedData.status &&
      ['completed', 'rejected'].includes(project.status)
    ) {
      throw new Error('Cannot modify projects that are completed or rejected');
    }

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
    let messages: Array<Record<string, unknown>> = [];
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

/**
 * Get project documents by type for a specific project
 * @param args - Contains projectId and optional documentType filter
 * @returns Project documents grouped by type
 */
export const getProjectDocuments = query({
  args: {
    projectId: v.id('projects'),
    documentType: v.optional(
      v.union(
        v.literal('project_proposal'),
        v.literal('environmental_impact'),
        v.literal('site_photographs'),
        v.literal('legal_permits'),
        v.literal('featured_images'),
        v.literal('site_images')
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }

    // Get the project to verify access
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get the user
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    const canView =
      project.creatorId === user._id ||
      project.assignedVerifierId === user._id ||
      user.role === 'admin';

    if (!canView) {
      throw new Error('Unauthorized to view project documents');
    }

    try {
      // Get documents
      let documentsQuery = ctx.db
        .query('documents')
        .withIndex('by_entity', (q) =>
          q.eq('entityId', args.projectId).eq('entityType', 'project')
        );

      // Filter by document type if specified
      let documents = await documentsQuery.collect();

      if (args.documentType) {
        documents = documents.filter(
          (doc) => doc.documentType === args.documentType
        );
      }

      // Group documents by type
      const documentsByType = documents.reduce(
        (acc, doc) => {
          const type = doc.documentType || 'other';
          if (!acc[type]) {
            acc[type] = [];
          }
          acc[type].push(doc);
          return acc;
        },
        {} as Record<string, any[]>
      );

      return {
        documents: documentsByType,
        total: documents.length,
        projectId: args.projectId,
      };
    } catch (error) {
      console.error('Error fetching project documents:', error);
      throw new Error('Failed to fetch project documents');
    }
  },
});

/**
 * Delete a project document
 * @param args - Contains documentId
 * @returns Success status
 */
export const deleteProjectDocument = mutation({
  args: {
    documentId: v.id('documents'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }

    // Get the document
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Get the user
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Get the project to verify ownership
    const project = await ctx.db.get(document.entityId as Id<'projects'>);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check permissions
    const canDelete = project.creatorId === user._id || user.role === 'admin';

    if (!canDelete) {
      throw new Error('Unauthorized to delete this document');
    }

    try {
      // Delete the file from storage if it exists
      if (document.media?.storageId) {
        try {
          await ctx.storage.delete(document.media.storageId);
        } catch (error) {
          console.warn('Failed to delete file from storage:', error);
          // Continue with document deletion even if file deletion fails
        }
      }

      // Delete the document record
      await ctx.db.delete(args.documentId);

      return { success: true };
    } catch (error) {
      console.error('Error deleting project document:', error);
      throw new Error('Failed to delete document. Please try again.');
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
      ('creatorId' in project && project.creatorId === user._id) ||
      ('assignedVerifierId' in project &&
        project.assignedVerifierId === user._id) ||
      user.role === 'admin';

    if (!canView) {
      throw new Error('Unauthorized to view this project timeline');
    }

    // Get workflow events for this project
    const workflowEvents = await ctx.db
      .query('auditLogs')
      .filter((q) =>
        q.and(
          q.eq(q.field('entityType'), 'workflow'),
          q.eq(q.field('entityId'), args.projectId)
        )
      )
      .order('desc')
      .collect();

    // Get verification events if verification exists
    const verification = await ctx.db
      .query('verifications')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .unique();

    let verificationEvents: Array<Record<string, unknown>> = [];
    if (verification) {
      verificationEvents = await ctx.db
        .query('auditLogs')
        .filter((q) =>
          q.and(
            q.eq(q.field('entityType'), 'verification'),
            q.eq(q.field('entityId'), verification._id)
          )
        )
        .order('desc')
        .collect();
    }

    // Combine and sort all events
    const allEvents = [...workflowEvents, ...verificationEvents].sort(
      (a, b) => {
        const timeA = typeof a._creationTime === 'number' ? a._creationTime : 0;
        const timeB = typeof b._creationTime === 'number' ? b._creationTime : 0;
        return timeB - timeA;
      }
    );

    return {
      project,
      verification,
      timeline: allEvents,
    };
  },
});
