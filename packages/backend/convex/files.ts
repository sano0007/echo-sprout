import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveFile = mutation({
  args: {
    storageId: v.id('_storage'),
    filename: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const { storageId, filename, contentType } = args;

    // Save file metadata to database
    const fileId = await ctx.db.insert('files', {
      storageId,
      filename,
      contentType,
      uploadedAt: Date.now(),
    });

    // Get the file URL
    const fileUrl = await ctx.storage.getUrl(storageId);

    if (!fileUrl) {
      throw new Error('Failed to get file URL');
    }

    return fileUrl;
  },
});

export const getFileUrl = mutation({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
