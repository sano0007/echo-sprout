import { httpAction } from "../convex/_generated/server";
import { internal } from "../convex/_generated/api";
import type {WebhookEvent} from "@clerk/backend";
import { Webhook } from "svix";

export const handleClerkWebhook = httpAction(
    async (ctx, request): Promise<Response> => {
        const event = await validateRequest(request);

        if (!event) {
            return new Response("Invalid webhook request", { status: 400 });
        }

        console.log("💩Received webhook event", event.type);

        switch (event.type) {
            case "user.created": {
                console.log("🩵User created", event.data);
                await ctx.runMutation(internal.users.createUser, {
                    data: event.data,
                });
                break;
            }

            case "user.updated": {
                await ctx.runMutation(internal.users.updateUser, {
                    data: event.data,
                });
                break;
            }

            case "user.deleted": {
                const tokenIdentifier = event.data.id!;
                await ctx.runMutation(internal.users.deleteUser, { tokenIdentifier });
                break;
            }

            default: {
                console.log("Unhandled event type", event.type);
                break;
            }
        }

        return new Response(null, { status: 200 });
    },
);

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
    const payloadString = await req.text();
    const svixHeaders = {
        "svix-id": req.headers.get("svix-id")!,
        "svix-timestamp": req.headers.get("svix-timestamp")!,
        "svix-signature": req.headers.get("svix-signature")!,
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

    try {
        return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
    } catch (error) {
        console.error("Error validating webhook request", error);
        return null;
    }
}
