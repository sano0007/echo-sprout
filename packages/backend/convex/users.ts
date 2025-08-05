import { internalMutation, mutation, query } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";
import { UserService } from "../services/user-service";
import { getAll } from "convex-helpers/server/relationships";
import { paginationOptsValidator } from "convex/server";

export const createUser = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const user = await UserService.getUserByTokenIdentifier(ctx, data.id);
    if (user) {
      await UserService.updateUserHelper(ctx, data);
    } else {
      const userAttributes = {
        token_identifier: data.id,
        username:
          data.username ?? data.email_addresses[0].email_address.split("@")[0],
        last_name: data.last_name!,
        first_name: data.first_name!,
        email: data.email_addresses[0].email_address,
        bio: "Hey there! I’m exploring the world. 🍃",
      };
      await ctx.db.insert("users", userAttributes);
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
      first_name: v.optional(v.string()),
      last_name: v.optional(v.string()),
      username: v.optional(v.string()),
      email: v.optional(v.string()),
      bio: v.optional(v.string()),
      profile_picture: v.optional(v.string()),
      cover_image: v.optional(v.string()),
      profile_image_cloudinary_public_id: v.optional(v.string()),
      cover_image_cloudinary_public_id: v.optional(v.string()),
      country: v.optional(v.string()),
      emergency_contact: v.optional(
        v.object({
          name: v.string(),
          email: v.optional(v.string()),
          phone: v.string(),
        }),
      ),
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

    await ctx.db.patch(userId, updates);
  },
});

export const deleteUser = internalMutation({
  args: { tokenIdentifier: v.string() },
  async handler(ctx, { tokenIdentifier }) {
    const user = await UserService.getUserByTokenIdentifier(
      ctx,
      tokenIdentifier,
    );
    if (!user) {
      throw new Error(`User with tokenIdentifier ${tokenIdentifier} not found`);
    }
    await ctx.db.delete(user._id);
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
    return await ctx.db.query("users").paginate(args.paginationOpts);
  },
});
