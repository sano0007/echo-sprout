'use client';

import { format } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Key,
  Lock,
  RefreshCw,
  Shield,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

import type { VerificationCertificate, VerificationReport } from './types';

interface DigitalSignature {
  id: string;
  algorithm: string;
  signature: string;
  publicKey: string;
  timestamp: number;
  signerInfo: {
    name: string;
    email: string;
    organization: string;
    role: string;
  };
  documentHash: string;
  status: 'valid' | 'invalid' | 'expired' | 'revoked';
  metadata: {
    version: string;
    keySize: number;
    certificateChain?: string[];
    trustLevel: 'high' | 'medium' | 'low';
  };
}

interface DigitalSignatureServiceProps {
  document: VerificationReport | VerificationCertificate;
  onSignDocument: (signature: DigitalSignature) => void;
  onVerifySignature: (signature: DigitalSignature) => boolean;
  className?: string;
}

export function DigitalSignatureService({
  document,
  onSignDocument,
  onVerifySignature,
  className = '',
}: DigitalSignatureServiceProps) {
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [keyPair, setKeyPair] = useState<{
    publicKey: string;
    privateKey: string;
  } | null>(null);
  const [signature, setSignature] = useState<DigitalSignature | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    details: string;
  } | null>(null);

  // Generate RSA key pair
  const generateKeyPair = async () => {
    setIsGeneratingKeys(true);

    try {
      // In a real implementation, this would use Web Crypto API
      // For demonstration, we'll generate mock keys
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate key generation

      const mockKeyPair = {
        publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2rQ7YzPcwU4xK3VgD8Pk
7Z1vF4GX8mQ9Tz3RnV6wE2pA5hL9mN4gH7jK8sL1oP6dM2tY8vW9rE3nF5xK7bQ
9cH6gS4wY2jD9vL3rF1nW8gQ7hM4pT6sE8dK3vR9wN5mL2tY8fG1nP6wK9vT3hM
4pS6wE1nK7bQ5cH2gY4jL9mP6dT8vW3rF5xN1nP9wK7bQ3cH6gS8wY2jL9mP4dT
8vW1rF5xK7bQ9cH6gS4wY2jD9vL3rF1nW8gQ7hM4pT6sE8dK3vR9wN5mL2tY8fG
1nP6wK9vT3hM4pS6wE1nK7bQ5cH2gY4jL9mP6dT8vW3rF5xN1nP9wK7bQ3cH6gS
QIDAQAB
-----END PUBLIC KEY-----`,
        privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDatDtjM9zBTjEr
dWAPw+TtnW8XgZfyZD1PPdGdXrATakDmEv2Y3iAfuMrywvWg/p0za1jy9b2sTecX
nErttD1wfqBLjBjaMPy8vesXWdbyBDuEzilPqwTx0re9H3A3mYva1jx8bWc/rAr
29PeEzilLrATWcrtdDlwfaBjiMv2Y/p1Py9besXnE3Wc/3Art9Ddw/qBLzBjaMP
28vesXWdbyBDuEzilPqwTx0re9H3A3mYva1jx8bWc/rAr29PeEzilLrATWcrtdD
lwfaBjiMv2Y/p1Py9besXnE3Wc/3Art9Ddw/qBLwBjaMPy8vesXWdbyBDuEzilP
qwTx0re9H3A3mYva1jx8bWc/rAr29PeEzilLrATWcrtdDlwfaBjiMv2Y/p1Py9b
esXnE3Wc/3Art9Ddw/qBLwBjaMPy8vesXWdbyBDuEzilPqwTx0re9H3A3mYva1j
x8bWc/rAr29PeEzilLrATWcrtdDlwfaBjiMv2Y/p1Py9besXnE3Wc/3ArtdDdw/
AgMBAAECggEBALKzF1nQ8sP2wK7bQ3cH6gS8wY2jL9mP4dT8vW1rF5xK7bQ9cH6g
S4wY2jD9vL3rF1nW8gQ7hM4pT6sE8dK3vR9wN5mL2tY8fG1nP6wK9vT3hM4pS6w
E1nK7bQ5cH2gY4jL9mP6dT8vW3rF5xN1nP9wK7bQ3cH6gSwY2jL9mP4dT8vW1rF
5xK7bQ9cH6gS4wY2jD9vL3rF1nW8gQ7hM4pT6sE8dK3vR9wN5mL2tY8fG1nP6wK
9vT3hM4pS6wE1nK7bQ5cH2gY4jL9mP6dT8vW3rF5xN1nP9wK7bQ3cH6gSwY2jL9
mP4dT8vW1rF5xK7bQ9cH6gS4wY2jD9vL3rF1nW8gQ7hM4pT6sE8dK3vR9wN5mL2
tY8fG1nP6wK9vT3hM4pS6wE1nK7bQ5cH2gY4jL9mP6dT8vW3rF5xN1nP9wK7bQ3
cH6gSwY2jL9mP4dT8vW1rF5xK7bQ9cH6gECgYEA8rHg1wF5xK7bQ9cH6gS4wY2j
D9vL3rF1nW8gQ7hM4pT6sE8dK3vR9wN5mL2tY8fG1nP6wK9vT3hM4pS6wE1nK7b
Q5cH2gY4jL9mP6dT8vW3rF5xN1nP9wK7bQ3cH6gSwY2jL9mP4dT8vW1rF5xK7bQ
9cH6gS4wY2jD9vL3rF1nW8gQ7hM4pT6sE8dK3vR9wN5mL2tY8fG1nP6wK9vT3hM
4pS6wE1nK7bQ5cH2gY4jL9mP6dT8vW3rF5xN1nP9wK7bQ3cH6gSwY2jL9mP4dT8
ECgYEA5qJ7bQ9cH6gS4wY2jD9vL3rF1nW8gQ7hM4pT6sE8dK3vR9wN5mL2tY8f
G1nP6wK9vT3hM4pS6wE1nK7bQ5cH2gY4jL9mP6dT8vW3rF5xN1nP9wK7bQ3cH6g
SwY2jL9mP4dT8vW1rF5xK7bQ9cH6gS4wY2jD9vL3rF1nW8gQ7hM4pT6sE8dK3vR
9wN5mL2tY8fG1nP6wK9vT3hM4pS6wE1nK7bQ5cH2gY4jL9mP6dT8vW3rF5xN1nP
9wK7bQ3cH6gSwY2jL9mP4dT8vW1rF5xK7bQ9cH6gECgYEAyF7bQ9cH6gS4wY2jD
ECgYEAwK7bQ3cH6gSwY2jL9mP4dT8vW1rF5xK7bQ9cH6gS4wY2jD9vL3rF1nW8g
Q7hM4pT6sE8dK3vR9wN5mL2tY8fG1nP6wK9vT3hM4pS6wE1nK7bQ5cH2gY4jL9m
P6dT8vW3rF5xN1nP9wK7bQ3cH6gSwY2jL9mP4dT8vW1rF5xK7bQ9cH6gS4wY2jD
9vL3rF1nW8gQ7hM4pT6sE8dK3vR9wN5mL2tY8fG1nP6wK9vT3hM4pS6wE1nK7bQ
5cH2gY4jL9mP6dT8vW3rF5xN1nP9wK7bQ3cH6gSwY2jL9mP4dT8vW1rF5xK7bQ9
cH6gECgYBL7bQ9cH6gS4wY2jD9vL3rF1nW8gQ7hM4pT6sE8dK3vR9wN5mL2tY8
fG1nP6wK9vT3hM4pS6wE1nK7bQ5cH2gY4jL9mP6dT8vW3rF5xN1nP9wK7bQ3cH
6gSwY2jL9mP4dT8vW1rF5xK7bQ9cH6gS4wY2jD9vL3rF1nW8gQ7hM4pT6sE8dK
3vR9wN5mL2tY8fG1nP6wK9vT3hM4pS6wE1nK7bQ5cH2gY4jL9mP6dT8vW3rF5x
N1nP9wK7bQ3cH6gSwY2jL9mP4dT8vW1rF5xK7bQ9cH6gECgYEAwK7bQ3cH6gSw
Y2jL9mP4dT8vW1rF5xK7bQ9cH6gS4wY2jD9vL3rF1nW8gQ7hM4pT6sE8dK3vR9
wN5mL2tY8fG1nP6wK9vT3hM4pS6wE1nK7bQ5cH2gY4jL9mP6dT8vW3rF5xN1nP
9wK7bQ3cH6gSwY2jL9mP4dT8vW1rF5xK7bQ9cH6gS4wY2jD9vL3rF1nW8gQ7hM
4pT6sE8dK3vR9wN5mL2tY8fG1nP6wK9vT3hM4pS6wE1nK7bQ5cH2gY4jL9mP6d
T8vW3rF5xN1nP9wK7bQ3cH6gSwY2jL9mP4dT8vW1rF5xK7bQ9cH6g==
-----END PRIVATE KEY-----`,
      };

      setKeyPair(mockKeyPair);
    } catch (error) {
      console.error('Error generating key pair:', error);
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  // Generate document hash
  const generateDocumentHash = (doc: any): string => {
    const docString = JSON.stringify(doc);
    let hash = 0;
    for (let i = 0; i < docString.length; i++) {
      const char = docString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  };

  // Sign document
  const signDocument = async () => {
    if (!keyPair) return;

    setIsSigning(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate signing

      const documentHash = generateDocumentHash(document);
      const signatureData = `${documentHash}${Date.now()}${keyPair.publicKey}`;

      // In a real implementation, this would use the private key to sign the hash
      const mockSignature: DigitalSignature = {
        id: `sig_${Date.now()}`,
        algorithm: 'RSA-SHA256',
        signature: generateDocumentHash(signatureData),
        publicKey: keyPair.publicKey,
        timestamp: Date.now(),
        signerInfo: {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@verification.org',
          organization: 'Independent Verification Authority',
          role: 'Senior Verification Specialist',
        },
        documentHash,
        status: 'valid',
        metadata: {
          version: '1.0',
          keySize: 2048,
          certificateChain: ['ROOT-CA-2024', 'INTERMEDIATE-CA-2024'],
          trustLevel: 'high',
        },
      };

      setSignature(mockSignature);
      onSignDocument(mockSignature);
    } catch (error) {
      console.error('Error signing document:', error);
    } finally {
      setIsSigning(false);
    }
  };

  // Verify signature
  const verifySignature = async (sig: DigitalSignature) => {
    setIsVerifying(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate verification

      const currentDocHash = generateDocumentHash(document);
      const isValid =
        sig.documentHash === currentDocHash && sig.status === 'valid';

      const result = {
        valid: isValid,
        details: isValid
          ? 'Signature is valid and document has not been modified'
          : 'Signature verification failed - document may have been modified',
      };

      setVerificationResult(result);
      return isValid;
    } catch (error) {
      console.error('Error verifying signature:', error);
      setVerificationResult({
        valid: false,
        details: 'Verification failed due to technical error',
      });
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadKey = (key: string, filename: string) => {
    if (typeof window === 'undefined') return; // Prevent SSR issues

    const blob = new Blob([key], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = globalThis.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'revoked':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'invalid':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'expired':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'revoked':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getTrustColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Digital Signature Service
            </h3>
            <p className="text-sm text-gray-500">
              Secure document signing and verification
            </p>
          </div>
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Key Generation */}
      <div className="border-b border-gray-200 p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Key Management
        </h4>

        {!keyPair ? (
          <div className="text-center py-8">
            <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h5 className="text-lg font-medium text-gray-900 mb-2">
              Generate Signing Keys
            </h5>
            <p className="text-sm text-gray-600 mb-4">
              Generate a new RSA key pair for digital signatures
            </p>
            <button
              onClick={generateKeyPair}
              disabled={isGeneratingKeys}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 mx-auto"
            >
              {isGeneratingKeys ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              {isGeneratingKeys ? 'Generating Keys...' : 'Generate Key Pair'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">Public Key</h5>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(keyPair.publicKey)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        downloadKey(keyPair.publicKey, 'public_key.pem')
                      }
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={keyPair.publicKey}
                  readOnly
                  className="w-full h-32 text-xs font-mono bg-white border border-gray-300 rounded-md p-2 resize-none"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">Private Key</h5>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPrivateKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(keyPair.privateKey)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        downloadKey(keyPair.privateKey, 'private_key.pem')
                      }
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={
                    showPrivateKey
                      ? keyPair.privateKey
                      : '•••••••••••••••••••••••••••••••••••••••••••••••'
                  }
                  readOnly
                  className="w-full h-32 text-xs font-mono bg-white border border-gray-300 rounded-md p-2 resize-none"
                />
                {!showPrivateKey && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Private key is hidden for security. Keep it safe and
                    never share it.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={generateKeyPair}
                disabled={isGeneratingKeys}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate Keys
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document Signing */}
      {keyPair && (
        <div className="border-b border-gray-200 p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Document Signing
          </h4>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Document Information
                </span>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  <strong>Type:</strong>{' '}
                  {'projectName' in document
                    ? 'Verification Certificate'
                    : 'Verification Report'}
                </p>
                <p>
                  <strong>Name:</strong> {document.projectName}
                </p>
                <p>
                  <strong>ID:</strong> {document.id}
                </p>
                <p>
                  <strong>Hash:</strong> {generateDocumentHash(document)}
                </p>
              </div>
            </div>

            {!signature ? (
              <div className="text-center">
                <button
                  onClick={signDocument}
                  disabled={isSigning}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 mx-auto"
                >
                  {isSigning ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {isSigning ? 'Signing Document...' : 'Sign Document'}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    Document Signed Successfully
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>Signature ID:</strong> {signature.id}
                    </p>
                    <p>
                      <strong>Algorithm:</strong> {signature.algorithm}
                    </p>
                    <p>
                      <strong>Signed At:</strong>{' '}
                      {format(new Date(signature.timestamp), 'PPpp')}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Signer:</strong> {signature.signerInfo.name}
                    </p>
                    <p>
                      <strong>Organization:</strong>{' '}
                      {signature.signerInfo.organization}
                    </p>
                    <p>
                      <strong>Trust Level:</strong>{' '}
                      <span
                        className={getTrustColor(signature.metadata.trustLevel)}
                      >
                        {signature.metadata.trustLevel.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signature Verification */}
      {signature && (
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Signature Verification
          </h4>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    Signature Details
                  </h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span>Status:</span>
                      {getStatusIcon(signature.status)}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(signature.status)}`}
                      >
                        {signature.status.toUpperCase()}
                      </span>
                    </div>
                    <p>
                      <strong>Algorithm:</strong> {signature.algorithm}
                    </p>
                    <p>
                      <strong>Key Size:</strong> {signature.metadata.keySize}{' '}
                      bits
                    </p>
                    <p>
                      <strong>Version:</strong> {signature.metadata.version}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    Certificate Chain
                  </h5>
                  <div className="text-sm text-gray-600">
                    {signature.metadata.certificateChain?.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2 py-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => verifySignature(signature)}
                disabled={isVerifying}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isVerifying ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                {isVerifying ? 'Verifying...' : 'Verify Signature'}
              </button>

              <button
                onClick={() => copyToClipboard(signature.signature)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
                Copy Signature
              </button>
            </div>

            {verificationResult && (
              <div
                className={`p-4 rounded-lg border ${
                  verificationResult.valid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {verificationResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${
                      verificationResult.valid
                        ? 'text-green-900'
                        : 'text-red-900'
                    }`}
                  >
                    {verificationResult.valid
                      ? 'Signature Valid'
                      : 'Signature Invalid'}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    verificationResult.valid ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {verificationResult.details}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
