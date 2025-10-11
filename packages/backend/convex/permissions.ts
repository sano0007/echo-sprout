import { query } from './_generated/server';
import { v } from 'convex/values';
import { PermissionsService } from '../services/permissions-service';
import { UserService } from '../services/user-service';

// Get current user permissions
export const getCurrentUserPermissions = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    return await PermissionsService.getUserPermissions(ctx, currentUser);
  },
});

// Check if user can access specific verification
export const canAccessVerification = query({
  args: {
    verificationId: v.id('verifications'),
    action: v.union(v.literal('view'), v.literal('modify')),
  },
  handler: async (ctx, { verificationId, action }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      return false;
    }

    try {
      if (action === 'view') {
        return await PermissionsService.canViewVerification(
          ctx,
          currentUser,
          verificationId
        );
      } else {
        return await PermissionsService.canModifyVerification(
          ctx,
          currentUser,
          verificationId
        );
      }
    } catch {
      return false;
    }
  },
});

// Check if user can access specific project
export const canAccessProject = query({
  args: {
    projectId: v.id('projects'),
    action: v.union(v.literal('view'), v.literal('modify')),
  },
  handler: async (ctx, { projectId, action }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      return false;
    }

    try {
      if (action === 'view') {
        return await PermissionsService.canViewProject(
          ctx,
          currentUser,
          projectId
        );
      } else {
        return await PermissionsService.canModifyProject(
          ctx,
          currentUser,
          projectId
        );
      }
    } catch {
      return false;
    }
  },
});

// Check if user can upload document
export const canUploadDocument = query({
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
      return false;
    }

    try {
      return await PermissionsService.canUploadDocument(
        ctx,
        currentUser,
        entityId,
        entityType
      );
    } catch {
      return false;
    }
  },
});

// Check if verifier has required specialty for project type
export const hasRequiredSpecialty = query({
  args: { projectType: v.string() },
  handler: async (ctx, { projectType }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      return false;
    }

    return PermissionsService.hasRequiredSpecialty(currentUser, projectType);
  },
});

// Get available actions for user on specific resource
export const getAvailableActions = query({
  args: {
    resourceType: v.union(
      v.literal('verification'),
      v.literal('project'),
      v.literal('document')
    ),
    resourceId: v.string(),
  },
  handler: async (ctx, { resourceType, resourceId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      return {
        canView: false,
        canModify: false,
        canDelete: false,
        canApprove: false,
        canReject: false,
      };
    }

    const actions = {
      canView: false,
      canModify: false,
      canDelete: false,
      canApprove: false,
      canReject: false,
    };

    try {
      switch (resourceType) {
        case 'verification':
          const verificationId = resourceId as any;
          actions.canView = await PermissionsService.canViewVerification(
            ctx,
            currentUser,
            verificationId
          );
          actions.canModify = await PermissionsService.canModifyVerification(
            ctx,
            currentUser,
            verificationId
          );
          break;

        case 'project':
          const projectId = resourceId as any;
          actions.canView = await PermissionsService.canViewProject(
            ctx,
            currentUser,
            projectId
          );
          actions.canModify = await PermissionsService.canModifyProject(
            ctx,
            currentUser,
            projectId
          );
          actions.canApprove = await PermissionsService.canApproveRejectProject(
            ctx,
            currentUser,
            projectId
          );
          actions.canReject = await PermissionsService.canApproveRejectProject(
            ctx,
            currentUser,
            projectId
          );
          break;

        case 'document':
          const documentId = resourceId as any;
          actions.canDelete = await PermissionsService.canDeleteDocument(
            ctx,
            currentUser,
            documentId
          );
          actions.canModify = actions.canDelete; // Same permissions for now
          break;
      }
    } catch (error) {
      // Permissions check failed, return false for all actions
    }

    return actions;
  },
});
