import { api } from '@packages/backend/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

// Initialize Convex client for file uploads
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Upload a file to Convex storage
 */
export async function uploadFileToConvex(
  file: File | Blob,
  filename: string
): Promise<string> {
  try {
    // Get upload URL from Convex
    const uploadUrl = await convex.mutation(api.files.generateUploadUrl);

    // Upload the file
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!result.ok) {
      throw new Error('Failed to upload file');
    }

    const { storageId } = await result.json();

    // Save file metadata to database
    const fileUrl = await convex.mutation(api.files.saveFile, {
      storageId,
      filename,
      contentType: file.type,
    });

    return fileUrl;
  } catch (error) {
    console.error('Error uploading file to Convex:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Upload certificate PDF to Convex storage
 */
export async function uploadCertificate(
  pdfBlob: Blob,
  certificateId: string
): Promise<string> {
  const filename = `certificate-${certificateId}-${Date.now()}.pdf`;

  // Create a File object from the blob
  const file = new File([pdfBlob], filename, { type: 'application/pdf' });

  return uploadFileToConvex(file, filename);
}

/**
 * Download file from Convex storage
 */
export async function downloadFromConvex(
  fileUrl: string,
  filename: string
): Promise<void> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await response.blob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
}
