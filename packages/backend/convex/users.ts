import {internalMutation, mutation, query} from "./_generated/server";
import {UserJSON} from "@clerk/backend";
import {v, Validator} from "convex/values";
import {UserService} from "../services/user-service";
import {getAll} from "convex-helpers/server/relationships";
import {paginationOptsValidator} from "convex/server";

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
    userId: v.id("users"),
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
        role: v.optional(v.union(
            v.literal("project_creator"),
            v.literal("credit_buyer"),
            v.literal("verifier"),
            v.literal("admin")
        )),
        verifierSpecialty: v.optional(v.array(v.string())),
    }),
  },
  async handler(ctx, { userId, updates }) {
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No updates provided");
    }

      if (updates.email && updates.email !== user.email) {
          const existingUser = await ctx.db
              .query("users")
              .withIndex("by_email", (q) => q.eq("email", updates.email!))
              .unique();

          if (existingUser && existingUser._id !== userId) {
              throw new Error("Email already in use");
          }
      }

    await ctx.db.patch(userId, updates);
  },
});

export const deleteUser = internalMutation({
    args: {clerkId: v.string()},
    async handler(ctx, {clerkId}) {
        const user = await UserService.getUserByClerkId(ctx, clerkId);
    if (!user) {
        throw new Error(`User with clerkId ${clerkId} not found`);
    }

        await ctx.db.patch(user._id, {
            isActive: false,
            lastLoginAt: new Date().toISOString()
        });
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("User not found");
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

export const getUsersByIds = query({
  args: { ids: v.array(v.id("users")) },
  handler: async (ctx, { ids }) => {
    return await getAll(ctx.db, ids);
  },
});

export const getAllUsers = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
      return await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("isActive"), true))
          .paginate(args.paginationOpts);
  },
});

export const getUsersByRole = query({
    args: {
        role: v.union(
            v.literal("project_creator"),
            v.literal("credit_buyer"),
            v.literal("verifier"),
            v.literal("admin")
        ),
        paginationOpts: paginationOptsValidator
    },
    handler: async (ctx, {role, paginationOpts}) => {
        return await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", role))
            .filter((q) => q.eq(q.field("isActive"), true))
            .paginate(paginationOpts);
    },
});

export const getVerifiers = query({
    args: {
        specialty: v.optional(v.string()),
        paginationOpts: paginationOptsValidator
    },
    handler: async (ctx, {specialty, paginationOpts}) => {
        const allVerifiers = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "verifier"))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        let filteredVerifiers = allVerifiers;

        if (specialty) {
            filteredVerifiers = allVerifiers.filter(user =>
                user.verifierSpecialty?.includes(specialty)
            );
        }

        const startIndex = paginationOpts.numItems * (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
        const endIndex = startIndex + paginationOpts.numItems;
        const paginatedResults = filteredVerifiers.slice(startIndex, endIndex);

        return {
            page: paginatedResults,
            isDone: endIndex >= filteredVerifiers.length,
            continueCursor: endIndex < filteredVerifiers.length ? endIndex.toString() : undefined
        };
    },
});

export const getUserByEmail = query({
    args: {email: v.string()},
    handler: async (ctx, {email}) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .filter((q) => q.eq(q.field("isActive"), true))
            .unique();
    },
});

export const searchUsers = query({
    args: {
        searchTerm: v.string(),
        role: v.optional(v.union(
            v.literal("project_creator"),
            v.literal("credit_buyer"),
            v.literal("verifier"),
            v.literal("admin")
        )),
        paginationOpts: paginationOptsValidator
    },
    handler: async (ctx, {searchTerm, role, paginationOpts}) => {
        let allUsers;

        if (role) {
            allUsers = await ctx.db
                .query("users")
                .withIndex("by_role", (q) => q.eq("role", role))
                .filter((q) => q.eq(q.field("isActive"), true))
                .collect();
        } else {
            allUsers = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("isActive"), true))
                .collect();
        }

        const searchTermLower = searchTerm.toLowerCase();
        const filteredUsers = allUsers.filter(user =>
            user.firstName.toLowerCase().includes(searchTermLower) ||
            user.lastName.toLowerCase().includes(searchTermLower) ||
            user.email.toLowerCase().includes(searchTermLower) ||
            (user.organizationName && user.organizationName.toLowerCase().includes(searchTermLower))
        );

        const startIndex = paginationOpts.numItems * (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
        const endIndex = startIndex + paginationOpts.numItems;
        const paginatedResults = filteredUsers.slice(startIndex, endIndex);

        return {
            page: paginatedResults,
            isDone: endIndex >= filteredUsers.length,
            continueCursor: endIndex < filteredUsers.length ? endIndex.toString() : undefined
        };
    },
});

export const toggleUserVerification = mutation({
    args: {
        userId: v.id("users"),
        isVerified: v.boolean()
    },
    handler: async (ctx, {userId, isVerified}) => {
        const currentUser = await UserService.getCurrentUser(ctx);
        if (!currentUser || currentUser.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
        }

        await ctx.db.patch(userId, {isVerified});
    },
});

export const updateUserRole = mutation({
    args: {
        userId: v.id("users"),
        newRole: v.union(
            v.literal("project_creator"),
            v.literal("credit_buyer"),
            v.literal("verifier"),
            v.literal("admin")
        ),
        verifierSpecialty: v.optional(v.array(v.string()))
    },
    handler: async (ctx, {userId, newRole, verifierSpecialty}) => {
        const currentUser = await UserService.getCurrentUser(ctx);
        if (!currentUser || currentUser.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
        }

        const updates: any = {role: newRole};

        if (newRole === "verifier" && verifierSpecialty) {
            updates.verifierSpecialty = verifierSpecialty;
        } else if (newRole !== "verifier") {
            updates.verifierSpecialty = undefined;
        }

        await ctx.db.patch(userId, updates);
  },
});
