import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// get user by clerk user id
export const getUserByClerkUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

// upsert user based on clerk user id
export const upsertUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, { userId, email, name, imageUrl }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, { userId, email, name, imageUrl });
      return existingUser._id;
    }

    return await ctx.db.insert("users", { userId, email, name, imageUrl });
  },
});

// search for user by name or email
export const searchUsers = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    if (!searchTerm.trim()) return [];

    const normalizedTerm = searchTerm.trim().toLowerCase();

    const allUser = await ctx.db.query("users").collect();

    return allUser
      .filter(
        (user) =>
          user.name.toLowerCase().includes(normalizedTerm) ||
          user.email.toLowerCase().includes(normalizedTerm)
      )
      .slice(0, 20); // limit to 20 results for performance
  },
});
