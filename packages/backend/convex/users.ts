import { internalMutation, mutation, query } from './_generated/server';
import { UserJSON } from '@clerk/backend';
import { v, Validator } from 'convex/values';
import { UserService } from '../services/user-service';
import { getAll } from 'convex-helpers/server/relationships';
import { paginationOptsValidator } from 'convex/server';
import { VerifierAssignmentService } from '../services/verifier-assignment-service';
import { NotificationService } from '../services/notification-service';

export const createUser = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const user = await UserService.getUserByClerkId(ctx, data.id);
    if (user) {
      await UserService.updateUserHelper(ctx, data);
    } else {
      await UserService.createUserFromClerk(ctx, data);
    }
  },
});

export const updateUser = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    await UserService.updateUserHelper(ctx, data);
  },
});

export const updateUserDetails = mutation({
  args: {
    userId: v.id('users'),
    updates: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      email: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      country: v.optional(v.string()),
      profileImage: v.optional(v.string()),
      organizationName: v.optional(v.string()),
      organizationType: v.optional(v.string()),
      role: v.optional(
        v.union(
          v.literal('project_creator'),
          v.literal('credit_buyer'),
          v.literal('verifier'),
          v.literal('admin')
        )
      ),
      verifierSpecialty: v.optional(v.array(v.string())),
      website: v.optional(v.string()),
      description: v.optional(v.string()),
    }),
  },
  async handler(ctx, { userId, updates }) {
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('No updates provided');
    }

    // Prevent email changes - this is a security measure
    if (updates.email && updates.email !== user.email) {
      throw new Error(
        'Email cannot be modified through this endpoint for security reasons'
      );
    }

    // Remove email from updates to ensure it cannot be changed
    const { email, ...safeUpdates } = updates;

    // Validate string fields are not empty if provided
    const validatedUpdates: any = {};
    Object.entries(safeUpdates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string' && value.trim() === '') {
          // Convert empty strings to undefined to remove them
          validatedUpdates[key] = undefined;
        } else {
          validatedUpdates[key] = value;
        }
      }
    });

    await ctx.db.patch(userId, validatedUpdates);
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, { clerkId }) {
    const user = await UserService.getUserByClerkId(ctx, clerkId);
    if (!user) {
      throw new Error(`User with clerkId ${clerkId} not found`);
    }

    await ctx.db.patch(user._id, {
      isActive: false,
      lastLoginAt: new Date().toISOString(),
    });
  },
});

export const getUserById = query({
  args: { id: v.id('users') },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await UserService.getCurrentUser(ctx);
  },
});

export const totalUsers = query({
  args: {},
  async handler(ctx) {
    const users = await ctx.db.query('users').collect();
    let count = 0;
    for (const user of users as any[]) {
      if (user.isActive !== false) count += 1;
    }
    return count;
  },
});

export const getUsersByIds = query({
  args: { ids: v.array(v.id('users')) },
  handler: async (ctx, { ids }) => {
    return await getAll(ctx.db, ids);
  },
});

export const getAllUsers = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('isActive'), true))
      .paginate(args.paginationOpts);
  },
});

export const getUsersByRole = query({
  args: {
    role: v.union(
      v.literal('project_creator'),
      v.literal('credit_buyer'),
      v.literal('verifier'),
      v.literal('admin')
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { role, paginationOpts }) => {
    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', role))
      .filter((q) => q.eq(q.field('isActive'), true))
      .paginate(paginationOpts);
  },
});

export const getVerifiers = query({
  args: {
    specialty: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { specialty, paginationOpts }) => {
    const allVerifiers = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'verifier'))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    let filteredVerifiers = allVerifiers;

    if (specialty) {
      filteredVerifiers = allVerifiers.filter((user) =>
        user.verifierSpecialty?.includes(specialty)
      );
    }

    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = filteredVerifiers.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= filteredVerifiers.length,
      continueCursor:
        endIndex < filteredVerifiers.length ? endIndex.toString() : undefined,
    };
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .filter((q) => q.eq(q.field('isActive'), true))
      .unique();
  },
});

export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    role: v.optional(
      v.union(
        v.literal('project_creator'),
        v.literal('credit_buyer'),
        v.literal('verifier'),
        v.literal('admin')
      )
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { searchTerm, role, paginationOpts }) => {
    let allUsers;

    if (role) {
      allUsers = await ctx.db
        .query('users')
        .withIndex('by_role', (q) => q.eq('role', role))
        .filter((q) => q.eq(q.field('isActive'), true))
        .collect();
    } else {
      allUsers = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('isActive'), true))
        .collect();
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filteredUsers = allUsers.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTermLower) ||
        user.lastName.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        (user.organizationName &&
          user.organizationName.toLowerCase().includes(searchTermLower))
    );

    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = filteredUsers.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= filteredUsers.length,
      continueCursor:
        endIndex < filteredUsers.length ? endIndex.toString() : undefined,
    };
  },
});

export const toggleUserVerification = mutation({
  args: {
    userId: v.id('users'),
    isVerified: v.boolean(),
  },
  handler: async (ctx, { userId, isVerified }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    await ctx.db.patch(userId, { isVerified });
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id('users'),
    newRole: v.union(
      v.literal('project_creator'),
      v.literal('credit_buyer'),
      v.literal('verifier'),
      v.literal('admin')
    ),
    verifierSpecialty: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { userId, newRole, verifierSpecialty }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const updates: any = { role: newRole };

    if (newRole === 'verifier' && verifierSpecialty) {
      updates.verifierSpecialty = verifierSpecialty;
    } else if (newRole !== 'verifier') {
      updates.verifierSpecialty = undefined;
    }

    await ctx.db.patch(userId, updates);
  },
});

export const upgradeToProjectCreator = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('User not found');
    }

    if (currentUser.role !== 'credit_buyer') {
      throw new Error('Only credit buyers can upgrade to project creator');
    }

    await ctx.db.patch(currentUser._id, {
      role: 'project_creator',
    });

    return {
      success: true,
      message: 'Successfully upgraded to Project Creator',
    };
  },
});

// ============= ROLE UPGRADE REQUEST SYSTEM =============

export const submitRoleUpgradeRequest = mutation({
  args: {
    reasonForUpgrade: v.string(),
    experienceDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('User not found');
    }

    if (currentUser.role !== 'credit_buyer') {
      throw new Error('Only credit buyers can apply for project creator role');
    }

    // Check for existing pending request
    const existingRequest = await ctx.db
      .query('roleUpgradeRequests')
      .withIndex('by_user', (q) => q.eq('userId', currentUser._id))
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'pending'),
          q.eq(q.field('status'), 'under_review')
        )
      )
      .first();

    if (existingRequest) {
      throw new Error('You already have a pending upgrade request');
    }

    // Create upgrade request with user data
    const requestId = await ctx.db.insert('roleUpgradeRequests', {
      userId: currentUser._id,
      requestedRole: 'project_creator',
      currentRole: 'credit_buyer',
      status: 'pending',
      applicationData: {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        organizationName: currentUser.organizationName,
        organizationType: currentUser.organizationType,
        phoneNumber: currentUser.phoneNumber,
        address: currentUser.address,
        city: currentUser.city,
        country: currentUser.country,
        reasonForUpgrade: args.reasonForUpgrade,
        experienceDescription: args.experienceDescription,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Auto-assign to available verifier (similar to project verification)
    await VerifierAssignmentService.autoAssignUpgradeRequest(ctx, requestId, {
      maxWorkload: 8,
    });

    return {
      success: true,
      requestId,
      message: 'Upgrade request submitted successfully',
    };
  },
});

export const getMyUpgradeRequest = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) return null;

    const request = await ctx.db
      .query('roleUpgradeRequests')
      .withIndex('by_user', (q) => q.eq('userId', currentUser._id))
      .order('desc')
      .first();

    return request;
  },
});

export const getPendingUpgradeRequests = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || !['admin', 'verifier'].includes(currentUser.role)) {
      throw new Error('Unauthorized');
    }

    return await ctx.db
      .query('roleUpgradeRequests')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .order('desc')
      .paginate(args.paginationOpts);
  },
});

export const getMyAssignedUpgradeRequests = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized');
    }

    return await ctx.db
      .query('roleUpgradeRequests')
      .withIndex('by_status_and_verifier', (q) =>
        q.eq('status', 'under_review').eq('verifierId', currentUser._id)
      )
      .order('desc')
      .paginate(args.paginationOpts);
  },
});

export const approveRoleUpgradeRequest = mutation({
  args: {
    requestId: v.id('roleUpgradeRequests'),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized: Verifier access required');
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.verifierId !== currentUser._id) {
      throw new Error('You are not assigned to this request');
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: 'approved',
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
      updatedAt: Date.now(),
    });

    // Upgrade user role
    await ctx.db.patch(request.userId, {
      role: 'project_creator',
    });

    // Send notification to user
    await NotificationService.notifyRoleUpgradeApproved(ctx, request.userId);

    return { success: true, message: 'Request approved and user upgraded' };
  },
});

export const rejectRoleUpgradeRequest = mutation({
  args: {
    requestId: v.id('roleUpgradeRequests'),
    rejectionReason: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized: Verifier access required');
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.verifierId !== currentUser._id) {
      throw new Error('You are not assigned to this request');
    }

    await ctx.db.patch(args.requestId, {
      status: 'rejected',
      reviewedAt: Date.now(),
      rejectionReason: args.rejectionReason,
      updatedAt: Date.now(),
    });

    // Send notification to user
    await NotificationService.notifyRoleUpgradeRejected(
      ctx,
      request.userId,
      args.rejectionReason
    );

    return { success: true, message: 'Request rejected' };
  },
});

// ============= ADMIN QUERIES =============

export const getAllUsersForAdmin = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
    roleFilter: v.optional(
      v.union(
        v.literal('project_creator'),
        v.literal('credit_buyer'),
        v.literal('verifier'),
        v.literal('admin')
      )
    ),
    statusFilter: v.optional(
      v.union(v.literal('active'), v.literal('inactive'))
    ),
  },
  handler: async (
    ctx,
    { paginationOpts, searchTerm, roleFilter, statusFilter }
  ) => {
    // const currentUser = await UserService.getCurrentUser(ctx);
    // if (!currentUser || currentUser.role !== 'admin') {
    //   throw new Error('Unauthorized: Admin access required');
    // }

    let allUsers = await ctx.db.query('users').collect();

    // Apply filters
    let filteredUsers = allUsers;

    // Role filter
    if (roleFilter) {
      filteredUsers = filteredUsers.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter) {
      const isActive = statusFilter === 'active';
      filteredUsers = filteredUsers.filter(
        (user) => user.isActive === isActive
      );
    }

    // Search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTermLower) ||
          user.lastName.toLowerCase().includes(searchTermLower) ||
          user.email.toLowerCase().includes(searchTermLower) ||
          (user.organizationName &&
            user.organizationName.toLowerCase().includes(searchTermLower))
      );
    }

    // Manual pagination
    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = filteredUsers.slice(startIndex, endIndex);

    // Add computed fields for admin view
    const enrichedUsers = paginatedResults.map((user) => ({
      ...user,
      name: `${user.firstName} ${user.lastName}`,
      status: user.isActive ? 'active' : 'inactive',
      registrationDate: user._creationTime,
      lastActive: user.lastLoginAt
        ? new Date(user.lastLoginAt).getTime()
        : user._creationTime,
    }));

    return {
      page: enrichedUsers,
      isDone: endIndex >= filteredUsers.length,
      continueCursor:
        endIndex < filteredUsers.length ? endIndex.toString() : undefined,
    };
  },
});

export const getUserStatsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    // const currentUser = await UserService.getCurrentUser(ctx);
    // if (!currentUser || currentUser.role !== 'admin') {
    //   throw new Error('Unauthorized: Admin access required');
    // }

    const allUsers = await ctx.db.query('users').collect();

    const stats = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter((user) => user.isActive !== false).length,
      pendingVerification: allUsers.filter((user) => !user.isVerified).length,
      verifiers: allUsers.filter(
        (user) => user.role === 'verifier' && user.isActive !== false
      ).length,
      projectCreators: allUsers.filter(
        (user) => user.role === 'project_creator' && user.isActive !== false
      ).length,
      creditBuyers: allUsers.filter(
        (user) => user.role === 'credit_buyer' && user.isActive !== false
      ).length,
      inactiveUsers: allUsers.filter((user) => user.isActive === false).length,
    };

    return stats;
  },
});

export const toggleUserStatus = mutation({
  args: {
    userId: v.id('users'),
    isActive: v.boolean(),
  },
  handler: async (ctx, { userId, isActive }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    await ctx.db.patch(userId, {
      isActive,
      lastLoginAt: new Date().toISOString(),
    });
  },
});
