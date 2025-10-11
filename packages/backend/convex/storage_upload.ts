/**
 * CONVEX STORAGE UPLOAD HELPER
 *
 * Provides utilities for uploading files to Convex Storage from actions.
 */

import { ActionCtx } from './_generated/server';

/**
 * Upload PDF content to Convex Storage
 *
 * @param ctx - Convex action context
 * @param content - PDF content as string or Buffer
 * @param filename - Filename for the PDF
 * @returns Storage ID and public URL
 */
export async function uploadPDFToStorage(
  ctx: ActionCtx,
  content: string,
  filename: string
): Promise<{ storageId: string; url: string }> {
  try {
    // Convert content to Blob
    const blob = new Blob([content], { type: 'text/html' });

    // Store the file in Convex storage
    // Note: In Convex, we store the file and get back a storage ID
    const storageId = await ctx.storage.store(blob);

    // Get the public URL for the file
    const url = await ctx.storage.getUrl(storageId);

    if (!url) {
      throw new Error('Failed to get storage URL');
    }

    return {
      storageId,
      url
    };
  } catch (error) {
    console.error('Error uploading PDF to storage:', error);
    throw new Error(`Failed to upload PDF to storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload structured PDF data (HTML + JSON) to storage
 *
 * @param ctx - Convex action context
 * @param pdfData - Object containing HTML and JSON representations
 * @param reportId - Report ID for filename
 * @param reportTitle - Report title for filename
 * @returns Storage information
 */
export async function uploadPDFReport(
  ctx: ActionCtx,
  pdfData: { html: string; json: string; size: number },
  reportId: string,
  reportTitle: string
): Promise<{
  htmlStorageId: string;
  htmlUrl: string;
  jsonStorageId: string;
  jsonUrl: string;
  totalSize: number;
}> {
  try {
    // Generate safe filename
    const safeTitle = reportTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const timestamp = Date.now();

    // Upload HTML version
    const htmlFilename = `reports/${safeTitle}_${timestamp}.html`;
    const htmlBlob = new Blob([pdfData.html], { type: 'text/html' });
    const htmlStorageId = await ctx.storage.store(htmlBlob);
    const htmlUrl = await ctx.storage.getUrl(htmlStorageId);

    // Upload JSON version (for client-side PDF generation if needed)
    const jsonFilename = `reports/${safeTitle}_${timestamp}.json`;
    const jsonBlob = new Blob([pdfData.json], { type: 'application/json' });
    const jsonStorageId = await ctx.storage.store(jsonBlob);
    const jsonUrl = await ctx.storage.getUrl(jsonStorageId);

    if (!htmlUrl || !jsonUrl) {
      throw new Error('Failed to get storage URLs');
    }

    return {
      htmlStorageId,
      htmlUrl,
      jsonStorageId,
      jsonUrl,
      totalSize: pdfData.size
    };
  } catch (error) {
    console.error('Error uploading PDF report to storage:', error);
    throw new Error(`Failed to upload PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete file from Convex Storage
 *
 * @param ctx - Convex action context
 * @param storageId - Storage ID to delete
 */
export async function deleteFromStorage(
  ctx: ActionCtx,
  storageId: string
): Promise<void> {
  try {
    await ctx.storage.delete(storageId);
  } catch (error) {
    console.error('Error deleting from storage:', error);
    throw new Error(`Failed to delete from storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file URL from storage ID
 *
 * @param ctx - Convex action context
 * @param storageId - Storage ID
 * @returns Public URL or null if not found
 */
export async function getStorageUrl(
  ctx: ActionCtx,
  storageId: string
): Promise<string | null> {
  try {
    return await ctx.storage.getUrl(storageId);
  } catch (error) {
    console.error('Error getting storage URL:', error);
    return null;
  }
}

/**
 * Upload any file content to storage
 *
 * @param ctx - Convex action context
 * @param content - File content
 * @param contentType - MIME type
 * @param filename - Optional filename hint
 * @returns Storage information
 */
export async function uploadFile(
  ctx: ActionCtx,
  content: string | Buffer,
  contentType: string,
  filename?: string
): Promise<{ storageId: string; url: string; size: number }> {
  try {
    const blob = new Blob([content], { type: contentType });
    const storageId = await ctx.storage.store(blob);
    const url = await ctx.storage.getUrl(storageId);

    if (!url) {
      throw new Error('Failed to get storage URL');
    }

    return {
      storageId,
      url,
      size: typeof content === 'string' ? content.length : content.length
    };
  } catch (error) {
    console.error('Error uploading file to storage:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
