import type {MutationCtx, QueryCtx} from "../convex/_generated/server";
import type {UserJSON} from "@clerk/backend";

export class UserService {
    public static async getUserByTokenIdentifier(
        ctx: QueryCtx,
        tokenIdentifier: string,
    ) {
        return await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("token_identifier", tokenIdentifier))
            .unique();
    }

    public static async getCurrentUser(ctx: MutationCtx | QueryCtx) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await UserService.getUserByTokenIdentifier(
            ctx,
            identity.subject,
        );
        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    public static async updateUserHelper(ctx: MutationCtx, data: UserJSON) {
        const userAttributes = {
            last_name: data.last_name!,
            first_name: data.first_name!,
        };
        const user = await UserService.getUserByTokenIdentifier(ctx, data.id);
        if (!user) {
            throw new Error(`User with tokenIdentifier ${data.id} not found`);
        }
        await ctx.db.patch(user._id, userAttributes);
    }
}
