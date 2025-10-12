import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { DocumentService } from '../services/document-service';
import { UserService } from '../services/user-service';
import { paginationOptsValidator } from 'convex/server';

// Upload a document
export const uploadDocument = mutation({
  args: {
    entityId: v.string(),
    entityType: v.union(
      v.literal('project'),
      v.literal('verification'),
      v.literal('user_profile'),
      v.literal('educational_content')
    ),
    fileName: v.string(),
    originalName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    fileSizeFormatted: v.string(),
    media: v.object({
      storageId: v.string(),
      fileUrl: v.string(),
    }),
    thumbnailUrl: v.optional(v.string()),
    documentType: v.union(
      v.literal('project_plan'),
      v.literal('environmental_assessment'),
      v.literal('permits'),
      v.literal('photos'),
      v.literal('verification_report'),
      v.literal('identity_doc'),
      v.literal('technical_specs'),
      v.literal('budget_breakdown'),
      v.literal('timeline'),
      v.literal('other')
    ),
    isRequired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Additional permissions check for specific entity types
    if (args.entityType === 'project') {
      // Check if user has access to upload to this project
      const project = await ctx.db.get(args.entityId as any);
      if (
        project &&
        'creatorId' in project &&
        project.creatorId !== currentUser._id &&
        currentUser.role !== 'admin'
      ) {
        throw new Error(
          'Unauthorized: You can only upload documents to your own projects'
        );
      }
    }

    return await DocumentService.uploadDocument(ctx, {
      ...args,
      uploadedBy: currentUser._id,
    });
  },
});

// Get documents by entity
export const getDocumentsByEntity = query({
  args: {
    entityId: v.string(),
    entityType: v.union(
      v.literal('project'),
      v.literal('verification'),
      v.literal('user_profile'),
      v.literal('educational_content')
    ),
  },
  handler: async (ctx, { entityId, entityType }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Check permissions based on entity type
    if (entityType === 'project') {
      const project = await ctx.db.get(entityId as any);
      if (!project) {
        throw new Error('Project not found');
      }

      // Allow access for project creator, assigned verifier, or admin
      const hasAccess =
        currentUser.role === 'admin' ||
        ('creatorId' in project && project.creatorId === currentUser._id) ||
        ('assignedVerifierId' in project &&
          project.assignedVerifierId === currentUser._id);

      // if (!hasAccess) {
      //   throw new Error('Unauthorized');
      // }
    }

    return await DocumentService.getDocumentsByEntity(
      ctx,
      entityId,
      entityType
    );
  },
});

// Get my uploaded documents
export const getMyDocuments = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const allDocuments = await DocumentService.getDocumentsByUploader(
      ctx,
      currentUser._id
    );

    // Manual pagination
    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = allDocuments.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= allDocuments.length,
      continueCursor:
        endIndex < allDocuments.length ? endIndex.toString() : undefined,
    };
  },
});

// Get documents by type
export const getDocumentsByType = query({
  args: {
    documentType: v.union(
      v.literal('project_plan'),
      v.literal('environmental_assessment'),
      v.literal('permits'),
      v.literal('photos'),
      v.literal('verification_report'),
      v.literal('identity_doc'),
      v.literal('technical_specs'),
      v.literal('budget_breakdown'),
      v.literal('timeline'),
      v.literal('other')
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { documentType, paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || !['admin', 'verifier'].includes(currentUser.role)) {
      throw new Error('Unauthorized: Admin or verifier access required');
    }

    const allDocuments = await DocumentService.getDocumentsByType(
      ctx,
      documentType
    );

    // Manual pagination
    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = allDocuments.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= allDocuments.length,
      continueCursor:
        endIndex < allDocuments.length ? endIndex.toString() : undefined,
    };
  },
});

// Get verified documents
export const getVerifiedDocuments = query({
  args: {
    entityId: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { entityId, paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const allDocuments = await DocumentService.getVerifiedDocuments(
      ctx,
      entityId
    );

    // Filter based on user permissions
    let filteredDocs = allDocuments;
    if (currentUser.role !== 'admin') {
      // Users can only see verified documents for projects they're involved in
      const filterPromises = allDocuments.map(async (doc) => {
        if (doc.entityType === 'project') {
          const project = await ctx.db.get(doc.entityId as any);
          const hasAccess =
            project &&
            (('creatorId' in project &&
              project.creatorId === currentUser._id) ||
              ('assignedVerifierId' in project &&
                project.assignedVerifierId === currentUser._id));
          return hasAccess ? doc : null;
        }
        return doc.uploadedBy === currentUser._id ? doc : null;
      });

      const filterResults = await Promise.all(filterPromises);
      filteredDocs = filterResults.filter((doc) => doc !== null);
    }

    // Manual pagination
    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = filteredDocs.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= filteredDocs.length,
      continueCursor:
        endIndex < filteredDocs.length ? endIndex.toString() : undefined,
    };
  },
});

// Verify document (verifier only)
export const verifyDocument = mutation({
  args: {
    documentId: v.id('documents'),
    isVerified: v.boolean(),
  },
  handler: async (ctx, { documentId, isVerified }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized: Verifier access required');
    }

    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check if verifier has access to this document's project
    if (document.entityType === 'project') {
      const project = await ctx.db.get(document.entityId as any);
      if (
        !project ||
        !('assignedVerifierId' in project) ||
        project.assignedVerifierId !== currentUser._id
      ) {
        throw new Error(
          'Unauthorized: You can only verify documents for your assigned projects'
        );
      }
    }

    return await DocumentService.verifyDocument(
      ctx,
      documentId,
      currentUser._id,
      isVerified
    );
  },
});

// Delete document
export const deleteDocument = mutation({
  args: { documentId: v.id('documents') },
  handler: async (ctx, { documentId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    return await DocumentService.deleteDocument(
      ctx,
      documentId,
      currentUser._id
    );
  },
});

// Update document metadata
export const updateDocument = mutation({
  args: {
    documentId: v.id('documents'),
    updates: v.object({
      fileName: v.optional(v.string()),
      originalName: v.optional(v.string()),
      documentType: v.optional(
        v.union(
          v.literal('project_plan'),
          v.literal('environmental_assessment'),
          v.literal('permits'),
          v.literal('photos'),
          v.literal('verification_report'),
          v.literal('identity_doc'),
          v.literal('technical_specs'),
          v.literal('budget_breakdown'),
          v.literal('timeline'),
          v.literal('other')
        )
      ),
      isRequired: v.optional(v.boolean()),
      thumbnailUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { documentId, updates }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    return await DocumentService.updateDocument(
      ctx,
      documentId,
      updates,
      currentUser._id
    );
  },
});

// Get project verification documents
export const getProjectVerificationDocuments = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, { projectId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Check access permissions
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const hasAccess =
      currentUser.role === 'admin' ||
      ('creatorId' in project && project.creatorId === currentUser._id) ||
      ('assignedVerifierId' in project &&
        project.assignedVerifierId === currentUser._id);

    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    return await DocumentService.getProjectVerificationDocuments(
      ctx,
      projectId
    );
  },
});

// Get document verification status for a project
export const getDocumentVerificationStatus = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, { projectId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Check access permissions
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const hasAccess =
      currentUser.role === 'admin' ||
      ('creatorId' in project && project.creatorId === currentUser._id) ||
      ('assignedVerifierId' in project &&
        project.assignedVerifierId === currentUser._id);

    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    return await DocumentService.getDocumentVerificationStatus(ctx, projectId);
  },
});

// Search documents
export const searchDocuments = query({
  args: {
    searchTerm: v.string(),
    filters: v.optional(
      v.object({
        entityType: v.optional(
          v.union(
            v.literal('project'),
            v.literal('verification'),
            v.literal('user_profile'),
            v.literal('educational_content')
          )
        ),
        documentType: v.optional(v.string()),
        uploadedBy: v.optional(v.id('users')),
        isVerified: v.optional(v.boolean()),
      })
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { searchTerm, filters, paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Only admins and verifiers can search all documents
    if (currentUser.role !== 'admin' && currentUser.role !== 'verifier') {
      // Regular users can only search their own documents
      const enhancedFilters = {
        ...filters,
        uploadedBy: currentUser._id,
      };
      filters = enhancedFilters;
    }

    const allResults = await DocumentService.searchDocuments(
      ctx,
      searchTerm,
      filters
    );

    // Manual pagination
    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = allResults.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= allResults.length,
      continueCursor:
        endIndex < allResults.length ? endIndex.toString() : undefined,
    };
  },
});

// Get document statistics
export const getDocumentStats = query({
  args: {
    entityId: v.optional(v.string()),
    entityType: v.optional(
      v.union(
        v.literal('project'),
        v.literal('verification'),
        v.literal('user_profile'),
        v.literal('educational_content')
      )
    ),
  },
  handler: async (ctx, { entityId, entityType }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Check permissions for specific entity
    if (entityId && entityType === 'project') {
      const project = await ctx.db.get(entityId as any);
      if (!project) {
        throw new Error('Project not found');
      }

      const hasAccess =
        currentUser.role === 'admin' ||
        ('creatorId' in project && project.creatorId === currentUser._id) ||
        ('assignedVerifierId' in project &&
          project.assignedVerifierId === currentUser._id);

      if (!hasAccess) {
        throw new Error('Unauthorized');
      }
    }

    return await DocumentService.getDocumentStats(ctx, entityId, entityType);
  },
});
