import type {MutationCtx, QueryCtx} from "../convex/_generated/server";
import type {UserJSON} from "@clerk/backend";

export class UserService {
    public static async getUserByClerkId(
        ctx: QueryCtx,
        clerkId: string,
    ) {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .unique();
    }

    public static async getUserByTokenIdentifier(
        ctx: QueryCtx,
        tokenIdentifier: string,
    ) {
        return await UserService.getUserByClerkId(ctx, tokenIdentifier);
    }

    public static async getCurrentUser(ctx: MutationCtx | QueryCtx) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await UserService.getUserByClerkId(
            ctx,
            identity.subject,
        );
        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    public static async createUserFromClerk(ctx: MutationCtx, data: UserJSON) {
        const primaryEmail = data.email_addresses?.find(email => email.email_address)?.email_address;
        if (!primaryEmail) {
            throw new Error("No email address found in Clerk data");
        }

        const userAttributes = {
            clerkId: data.id,
            email: primaryEmail,
            firstName: data.first_name || "Unknown",
            lastName: data.last_name || "User",
            role: "credit_buyer" as const,
            phoneNumber: data.phone_numbers?.[0]?.phone_number || "",
            address: "",
            city: "",
            country: "",
            isVerified: false,
            isActive: true,
            profileImage: data.image_url || undefined,
        };

        return await ctx.db.insert("users", userAttributes);
    }

    public static async updateUserHelper(ctx: MutationCtx, data: UserJSON) {
        const user = await UserService.getUserByClerkId(ctx, data.id);
        if (!user) {
            throw new Error(`User with clerkId ${data.id} not found`);
        }

        const primaryEmail = data.email_addresses?.find(email => email.email_address)?.email_address;

        const updateAttributes: any = {};

        if (data.first_name && data.first_name !== user.firstName) {
            updateAttributes.firstName = data.first_name;
        }

        if (data.last_name && data.last_name !== user.lastName) {
            updateAttributes.lastName = data.last_name;
        }

        if (primaryEmail && primaryEmail !== user.email) {
            updateAttributes.email = primaryEmail;
        }

        if (data.image_url && data.image_url !== user.profileImage) {
            updateAttributes.profileImage = data.image_url;
        }

        if (data.phone_numbers?.[0]?.phone_number && data.phone_numbers[0].phone_number !== user.phoneNumber) {
            updateAttributes.phoneNumber = data.phone_numbers[0].phone_number;
        }

        updateAttributes.lastLoginAt = new Date().toISOString();

        if (Object.keys(updateAttributes).length > 0) {
            await ctx.db.patch(user._id, updateAttributes);
        }
    }

    public static async getUsersByRole(
        ctx: QueryCtx,
        role: "project_creator" | "credit_buyer" | "verifier" | "admin"
    ) {
        return await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", role))
            .collect();
    }

    public static async getVerifiersBySpecialty(
        ctx: QueryCtx,
        specialty: string
    ) {
        return await ctx.db
            .query("users")
            .withIndex("by_verifier_specialty", (q) =>
                q.eq("role", "verifier").eq("verifierSpecialty", [specialty])
            )
            .collect();
    }
}
