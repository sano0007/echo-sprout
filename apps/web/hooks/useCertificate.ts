import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@packages/backend';
import { Id } from '@packages/backend';
import {
  downloadCertificate,
  generateCertificateForUpload,
  viewCertificateInBrowser,
  viewStoredCertificateInBrowser,
} from '../utils/certificateGenerator';
import { uploadCertificate } from '../utils/fileUpload';

export function useCertificate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const generateCertificateMutation = useMutation(
    api.transactions.generateCertificate
  );

  /**
   * Generate and upload certificate to Convex storage
   */
  const generateAndUploadCertificate = async (
    transactionId: Id<'transactions'>
  ) => {
    try {
      setIsGenerating(true);

      // First, get certificate data
      const certificateDataResponse = await fetch('/api/certificate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });

      if (!certificateDataResponse.ok) {
        throw new Error('Failed to get certificate data');
      }

      const certificateData = await certificateDataResponse.json();

      // Generate PDF certificate
      const { blob, filename } =
        await generateCertificateForUpload(certificateData);

      // Upload to Convex storage
      const certificateUrl = await uploadCertificate(
        blob,
        certificateData.certificateId
      );

      // Update transaction with certificate URL
      await generateCertificateMutation({
        transactionId,
        certificateUrl,
      });

      return certificateUrl;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Download certificate directly (without storage)
   */
  const downloadCertificateDirectly = async (
    transactionId: Id<'transactions'>
  ) => {
    try {
      setIsDownloading(true);

      // Get certificate data
      const certificateDataResponse = await fetch('/api/certificate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });

      if (!certificateDataResponse.ok) {
        throw new Error('Failed to get certificate data');
      }

      const certificateData = await certificateDataResponse.json();

      // Generate and download PDF
      await downloadCertificate(
        certificateData,
        `certificate-${certificateData.certificateId}.pdf`
      );
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Download existing certificate from storage
   */
  const downloadFromStorage = async (
    certificateUrl: string,
    certificateId: string
  ) => {
    try {
      setIsDownloading(true);

      const response = await fetch(certificateUrl);
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading from storage:', error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * View certificate in browser without downloading
   */
  const viewCertificateInBrowserDirectly = async (
    transactionId: Id<'transactions'>
  ) => {
    try {
      setIsViewing(true);

      // Get certificate data
      const certificateDataResponse = await fetch('/api/certificate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });

      if (!certificateDataResponse.ok) {
        throw new Error('Failed to get certificate data');
      }

      const certificateData = await certificateDataResponse.json();

      // View certificate in browser
      await viewCertificateInBrowser(certificateData);
    } catch (error) {
      console.error('Error viewing certificate:', error);
      throw error;
    } finally {
      setIsViewing(false);
    }
  };

  /**
   * View existing certificate from storage in browser
   */
  const viewCertificateFromStorage = async (certificateUrl: string) => {
    try {
      setIsViewing(true);
      await viewStoredCertificateInBrowser(certificateUrl);
    } catch (error) {
      console.error('Error viewing certificate from storage:', error);
      throw error;
    } finally {
      setIsViewing(false);
    }
  };

  return {
    generateAndUploadCertificate,
    downloadCertificateDirectly,
    downloadFromStorage,
    viewCertificateInBrowserDirectly,
    viewCertificateFromStorage,
    isGenerating,
    isDownloading,
    isViewing,
  };
}

export function useCertificateData(transactionId: Id<'transactions'> | null) {
  return useQuery(
    api.transactions.getCertificateData,
    transactionId ? { transactionId } : 'skip'
  );
}
