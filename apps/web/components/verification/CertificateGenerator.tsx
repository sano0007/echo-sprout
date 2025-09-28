'use client';

import { format } from 'date-fns';
import {
  AlertTriangle,
  Award,
  Copy,
  Download,
  Lock,
  QrCode,
  Share2,
  Shield,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';

import type { CertificateTemplate, VerificationCertificate } from './types';

interface CertificateGeneratorProps {
  projectData: any;
  verificationData: any;
  onCertificateGenerated: (certificate: VerificationCertificate) => void;
  onExportCertificate: (format: 'pdf' | 'png' | 'svg') => void;
  existingCertificate?: VerificationCertificate | null;
  className?: string;
}

export function CertificateGenerator({
  projectData,
  verificationData,
  onCertificateGenerated,
  onExportCertificate,
  existingCertificate,
  className = '',
}: CertificateGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [certificateType, setCertificateType] = useState<
    'compliance' | 'quality' | 'security' | 'full_verification'
  >('full_verification');
  const [includeQrCode, setIncludeQrCode] = useState(true);
  const [includeDigitalSignature, setIncludeDigitalSignature] = useState(true);
  const [includeBlockchain, setIncludeBlockchain] = useState(false);
  const [expiryMonths, setExpiryMonths] = useState(12);
  const [isGenerating, setIsGenerating] = useState(false);
  // Use existingCertificate prop instead of local state
  const certificateRef = useRef<HTMLDivElement>(null);

  const templates: CertificateTemplate[] = [
    {
      id: 'standard',
      name: 'Standard Certificate',
      description: 'Professional certificate with clean design',
      type: 'standard',
      layout: {
        orientation: 'landscape',
        size: 'A4',
        margins: { top: 20, bottom: 20, left: 30, right: 30 },
      },
      design: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: { style: 'solid', width: 3, color: '#2563eb' },
        logo: { url: '/logo.png', position: 'top-center', size: 60 },
      },
      fields: [],
      security: { qrCode: true, digitalSignature: true, blockchain: false },
    },
    {
      id: 'premium',
      name: 'Premium Certificate',
      description: 'Elegant design with premium features',
      type: 'premium',
      layout: {
        orientation: 'landscape',
        size: 'A4',
        margins: { top: 15, bottom: 15, left: 25, right: 25 },
      },
      design: {
        background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
        border: { style: 'double', width: 5, color: '#dc2626' },
        watermark: 'VERIFIED',
        logo: { url: '/logo-premium.png', position: 'top-left', size: 80 },
      },
      fields: [],
      security: {
        qrCode: true,
        digitalSignature: true,
        blockchain: true,
        hologram: true,
      },
    },
    {
      id: 'blockchain',
      name: 'Blockchain Certificate',
      description: 'Blockchain-verified with immutable proof',
      type: 'blockchain',
      layout: {
        orientation: 'portrait',
        size: 'A4',
        margins: { top: 25, bottom: 25, left: 20, right: 20 },
      },
      design: {
        background: 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)',
        border: { style: 'solid', width: 2, color: '#0891b2' },
        logo: { url: '/logo-blockchain.png', position: 'top-center', size: 70 },
      },
      fields: [],
      security: { qrCode: true, digitalSignature: true, blockchain: true },
    },
    {
      id: 'academic',
      name: 'Academic Certificate',
      description: 'Traditional academic style with formal design',
      type: 'academic',
      layout: {
        orientation: 'landscape',
        size: 'A3',
        margins: { top: 30, bottom: 30, left: 40, right: 40 },
      },
      design: {
        background: '#ffffff',
        border: { style: 'solid', width: 8, color: '#854d0e' },
        watermark: 'AUTHENTICATED',
        logo: { url: '/logo-academic.png', position: 'top-center', size: 100 },
      },
      fields: [],
      security: { qrCode: true, digitalSignature: true, blockchain: false },
    },
  ];

  const certificateData = useMemo(() => {
    if (!projectData || !verificationData) return null;

    return {
      projectName: projectData.name || 'Project',
      projectCreator:
        projectData.studentName || projectData.creatorName || 'Unknown Student',
      organization:
        projectData.institutionName || projectData.organization || 'Individual',
      verifier: verificationData.verifierName || 'Unknown Verifier',
      verifierOrg:
        verificationData.organization || 'Independent Verification Authority',
      score: verificationData.qualityScore || 0,
      status: verificationData.recommendation || 'pending',
      verifiedAt: verificationData.completionDate || Date.now(),
      expiresAt: Date.now() + expiryMonths * 30 * 24 * 60 * 60 * 1000,
    };
  }, [projectData, verificationData, expiryMonths]);

  const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `CERT-${year}${month}-${random}`;
  };

  const generateSecurityHash = (data: string) => {
    // In a real implementation, this would use a proper cryptographic hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase();
  };

  const generateCertificate = async () => {
    if (!certificateData) return;

    setIsGenerating(true);

    try {
      const certificateNumber = generateCertificateNumber();
      const securityData = `${certificateNumber}${certificateData.projectName}${certificateData.verifiedAt}`;
      const securityHash = generateSecurityHash(securityData);

      const certificate: VerificationCertificate = {
        id: `cert_${Date.now()}`,
        certificateNumber,
        verificationReportId: `report_${projectData.id}`,
        projectId: projectData.id,
        projectName: certificateData.projectName,
        projectCreator: {
          name: certificateData.projectCreator,
          organization: certificateData.organization,
        },
        verifier: {
          name: certificateData.verifier,
          organization: certificateData.verifierOrg,
          credentials: verificationData.credentials || [
            'Certified Project Auditor',
          ],
        },
        issuedAt: Date.now(),
        expiresAt: certificateData.expiresAt,
        status: 'valid',
        certificateType,
        scope: getScope(),
        overallScore: certificateData.score,
        securityHash,
        digitalSignature: includeDigitalSignature
          ? {
              algorithm: 'RSA-SHA256',
              signature: generateSecurityHash(securityData + 'signature'),
              publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...',
            }
          : undefined,
        metadata: {
          version: '2.0',
          template: selectedTemplate,
          blockchain: includeBlockchain
            ? {
                txHash:
                  '0x' + generateSecurityHash(securityData + 'blockchain'),
                blockNumber: 12345678,
                network: 'ethereum',
              }
            : undefined,
        },
      };

      onCertificateGenerated(certificate);
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getScope = () => {
    const scope = [];
    if (
      certificateType === 'full_verification' ||
      certificateType === 'compliance'
    ) {
      scope.push('Code Quality Assessment');
    }
    if (
      certificateType === 'full_verification' ||
      certificateType === 'security'
    ) {
      scope.push('Security Review');
    }
    if (
      certificateType === 'full_verification' ||
      certificateType === 'quality'
    ) {
      scope.push('Documentation Review');
    }
    scope.push('Project Verification');
    return scope;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'revision_required':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Certificate Generator
            </h3>
            <p className="text-sm text-gray-500">
              Generate official verification certificates
            </p>
          </div>
          {existingCertificate && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onExportCertificate('pdf')}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              <button
                onClick={() => onExportCertificate('png')}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                PNG
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Configuration */}
      <div className="border-b border-gray-200 p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Certificate Configuration
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent  bg-white text-gray-900"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {templates.find((t) => t.id === selectedTemplate)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Type
            </label>
            <select
              value={certificateType}
              onChange={(e) => setCertificateType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent  bg-white text-gray-900"
            >
              <option value="full_verification">Full Verification</option>
              <option value="compliance">Compliance Only</option>
              <option value="quality">Quality Assessment</option>
              <option value="security">Security Review</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validity Period (Months)
            </label>
            <select
              value={expiryMonths}
              onChange={(e) => setExpiryMonths(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent  bg-white text-gray-900"
            >
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
              <option value={24}>24 Months</option>
              <option value={36}>36 Months</option>
              <option value={0}>No Expiry</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Security Features
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeQrCode}
                  onChange={(e) => setIncludeQrCode(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  QR Code Verification
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeDigitalSignature}
                  onChange={(e) => setIncludeDigitalSignature(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Digital Signature
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Preview */}
      {certificateData && (
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Certificate Preview
            </h4>
            <button
              onClick={generateCertificate}
              disabled={isGenerating || certificateData.status !== 'approved'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Award className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Certificate'}
            </button>
          </div>

          {certificateData.status !== 'approved' && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Certificate generation is only available for approved
                  verifications
                </span>
              </div>
            </div>
          )}

          <div
            ref={certificateRef}
            className="bg-gradient-to-br from-blue-50 to-indigo-100 border-4 border-blue-200 rounded-lg p-8 text-center"
            style={{ minHeight: '400px' }}
          >
            <div className="mb-6">
              <Award className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Certificate of Verification
              </h1>
              <p className="text-lg text-gray-600">This certifies that</p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">
                {certificateData.projectName}
              </h2>
              <p className="text-lg text-gray-700">
                Created by <strong>{certificateData.projectCreator}</strong>
                {certificateData.organization !== 'Individual' && (
                  <span>
                    {' '}
                    from <strong>{certificateData.organization}</strong>
                  </span>
                )}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-lg text-gray-700 mb-2">
                has successfully completed verification with a score of
              </p>
              <div
                className={`text-4xl font-bold ${getScoreColor(certificateData.score)} mb-2`}
              >
                {certificateData.score}/100
              </div>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(certificateData.status)}`}
              >
                {certificateData.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Verified by</p>
              <p className="text-lg font-semibold text-gray-800">
                {certificateData.verifier}
              </p>
              <p className="text-sm text-gray-600">
                {certificateData.verifierOrg}
              </p>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                <p>
                  Issued: {format(new Date(certificateData.verifiedAt), 'PPP')}
                </p>
                {expiryMonths > 0 && (
                  <p>
                    Expires:{' '}
                    {format(new Date(certificateData.expiresAt), 'PPP')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {includeQrCode && <QrCode className="h-4 w-4" />}
                  {includeDigitalSignature && <Lock className="h-4 w-4" />}
                  {includeBlockchain && <Shield className="h-4 w-4" />}
                </div>
                <p className="text-xs">Security Features</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Certificate Details */}
      {existingCertificate && (
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Generated Certificate
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Certificate Number
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-900 font-mono">
                    {existingCertificate.certificateNumber}
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(existingCertificate.certificateNumber)
                    }
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Security Hash
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-900 font-mono truncate">
                    {existingCertificate.securityHash}
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(existingCertificate.securityHash)
                    }
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Issued At
                </label>
                <p className="text-sm text-gray-900">
                  {format(new Date(existingCertificate.issuedAt), 'PPpp')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(existingCertificate.status)}`}
                >
                  {existingCertificate.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Scope
              </label>
              <div className="flex flex-wrap gap-2">
                {existingCertificate.scope.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {existingCertificate.metadata.blockchain && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blockchain Verification
                </label>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Immutable Proof
                    </span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>
                      Network: {existingCertificate.metadata.blockchain.network}
                    </p>
                    <p>
                      Block: #
                      {existingCertificate.metadata.blockchain.blockNumber}
                    </p>
                    <p className="font-mono break-all">
                      TX: {existingCertificate.metadata.blockchain.txHash}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => onExportCertificate('pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                onClick={() => onExportCertificate('png')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>
              <button
                onClick={() =>
                  copyToClipboard(
                    window.location.href +
                      '/certificate/' +
                      existingCertificate.id
                  )
                }
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4" />
                Share Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
