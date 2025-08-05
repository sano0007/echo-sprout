import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";

export default defineSchema({
    users: defineTable({
        bio: v.optional(v.string()),
        email: v.string(),
        username: v.string(),
        first_name: v.string(),
        last_name: v.string(),
        token_identifier: v.string(),
    }).index("by_token", ["token_identifier"])
})