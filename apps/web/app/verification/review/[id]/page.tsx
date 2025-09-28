'use client';

import { api } from '@packages/backend';
import type { Id } from '@packages/backend/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useRealTimeMessaging } from '@/hooks/useRealTimeMessaging';

import { Annotation } from '@/components/pdf';

import EnhancedCommunicationPanel from '../../../../components/communication/EnhancedCommunicationPanel';
import CollaborativeAnnotations from '../../../../components/pdf/CollaborativeAnnotations';
import PDFViewerWrapper from '../../../../components/pdf/PDFViewerWrapper';
import { CertificateGenerator } from '../../../../components/verification/CertificateGenerator';
import EnhancedChecklist from '../../../../components/verification/EnhancedChecklist';
import { PDFExportService } from '../../../../components/verification/PDFExportService';
import type {
  VerificationCertificate,
  VerificationReport,
} from '../../../../components/verification/types';
import { VerificationReportGenerator } from '../../../../components/verification/VerificationReportGenerator';

export default function ProjectReview() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as Id<'projects'>;

  const [activeSection, setActiveSection] = useState('overview');
  const [documentAnnotations, setDocumentAnnotations] = useState<{
    [documentId: string]: Annotation[];
  }>({});
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [verificationNotes, setVerificationNotes] = useState('');
  const [qualityScore, setQualityScore] = useState<number>(5);
  const [recommendation, setRecommendation] = useState<
    'approved' | 'rejected' | 'revision_required'
  >('approved');
  const [generatedReport, setGeneratedReport] =
    useState<VerificationReport | null>(null);
  const [generatedCertificate, setGeneratedCertificate] =
    useState<VerificationCertificate | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDocumentSelect = useCallback((doc: any) => {
    setSelectedDocumentId(doc._id);
  }, []);

  // Queries
  const verification = useQuery(api.verifications.getVerificationByProjectId, {
    projectId: projectId,
  });
  const project = useQuery(api.projects.getProject, {
    projectId: projectId,
  });
  const documents = useQuery(api.documents.getDocumentsByEntity, {
    entityId: projectId,
    entityType: 'project',
  });
  const permissions = useQuery(api.permissions.getCurrentUserPermissions);
  const currentUser = useQuery(api.users.getCurrentUser);

  // Real-time messaging
  const {
    messages: realtimeMessages,
    unreadCount,
    urgentCount,
  } = useRealTimeMessaging({
    verificationId: verification?._id,
    userId: currentUser?._id || '',
    onNewMessage: (message) => {
      console.log('New message received:', message);
    },
  });

  // Get unique user IDs from messages for user information lookup
  const userIds = Array.from(
    new Set(
      realtimeMessages?.flatMap((msg: any) => [
        msg.senderId,
        msg.recipientId,
      ]) || []
    )
  ).filter(Boolean);

  // Fetch user information for all users involved in messages
  const messageUsers = useQuery(
    api.users.getUsersByIds,
    userIds.length > 0 ? { ids: userIds } : 'skip'
  );

  // Transform messages to include user information
  const transformedMessages =
    realtimeMessages?.map((msg: any) => {
      const sender = messageUsers?.find(
        (user: any) => user._id === msg.senderId
      );
      const recipient = messageUsers?.find(
        (user: any) => user._id === msg.recipientId
      );

      return {
        ...msg,
        senderName: sender
          ? `${sender.firstName} ${sender.lastName}`
          : 'Unknown User',
        senderRole: sender?.role || 'unknown',
        recipientName: recipient
          ? `${recipient.firstName} ${recipient.lastName}`
          : 'Unknown User',
      };
    }) || [];

  const projectDocuments = useQuery(api.documents.getDocumentsByEntity, {
    entityId: projectId,
    entityType: 'project',
  });
  const documentVerificationStatus = useQuery(
    api.documents.getDocumentVerificationStatus,
    {
      projectId: projectId,
    }
  );

  // Get audit trail
  const auditTrail = useQuery(
    api.verifications.getVerificationAuditTrail,
    verification?._id ? { verificationId: verification._id } : 'skip'
  );

  // Mutations
  const acceptVerification = useMutation(api.verifications.acceptVerification);
  const startVerification = useMutation(api.verifications.startVerification);
  const completeVerification = useMutation(
    api.verifications.completeVerification
  );
  const verifyDocument = useMutation(api.documents.verifyDocument);
  const sendMessage = useMutation(api.verificationMessages.sendMessage);
  const saveAnnotations = useMutation(
    api.verifications.saveDocumentAnnotations
  );

  // Debounced save function
  const debouncedSave = useCallback(
    async (documentId: string, annotations: Annotation[]) => {
      if (!verification?._id) {
        console.warn('No verification ID available for saving annotations');
        return;
      }

      try {
        console.log('Saving annotations:', {
          documentId,
          annotationCount: annotations.length,
        });

        // Convert annotations to the format expected by the API
        const apiAnnotations = annotations.map((annotation) => ({
          id: annotation.id,
          type: annotation.type,
          content: annotation.content,
          position: {
            pageNumber: annotation.pageNumber,
            x: annotation.position.x,
            y: annotation.position.y,
            width: annotation.position.width,
            height: annotation.position.height,
          },
        }));

        await saveAnnotations({
          verificationId: verification._id,
          documentId: documentId as Id<'documents'>,
          annotations: apiAnnotations,
        });

        toast.success('Annotations saved successfully');
        console.log('Annotations saved successfully');
      } catch (error) {
        toast.error('Failed to save annotations');
        console.error('Error saving annotations:', error);
      }
    },
    [verification?._id, saveAnnotations]
  );

  // Annotation handling function with debouncing
  const handleAnnotationChange = useCallback(
    (documentId: string, annotations: Annotation[]) => {
      console.log('Annotation change detected:', {
        documentId,
        annotationCount: annotations.length,
      });

      // Update local state immediately for UI responsiveness
      setDocumentAnnotations((prev) => ({
        ...prev,
        [documentId]: annotations,
      }));

      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(async () => {
        await debouncedSave(documentId, annotations);
      }, 1000); // 1 second delay
    },
    [debouncedSave]
  );

  // Manual save function for immediate saving
  const handleManualSave = useCallback(
    async (documentId: string) => {
      const annotations = documentAnnotations[documentId] || [];

      // Clear any pending debounced save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      // Immediately save the current annotations
      await debouncedSave(documentId, annotations);
    },
    [documentAnnotations, debouncedSave]
  );

  // Verification action handlers
  const handleAcceptVerification = useCallback(async () => {
    if (!verification?._id) return;

    try {
      await acceptVerification({ verificationId: verification._id });
      toast.success('Verification accepted successfully');
    } catch (error) {
      toast.error('Failed to accept verification');
      console.error('Error accepting verification:', error);
    }
  }, [verification?._id, acceptVerification]);

  const handleStartVerification = useCallback(async () => {
    if (!verification?._id) return;

    try {
      await startVerification({ verificationId: verification._id });
      toast.success('Verification started successfully');
    } catch (error) {
      toast.error('Failed to start verification');
      console.error('Error starting verification:', error);
    }
  }, [verification?._id, startVerification]);

  const handleCompleteVerification = useCallback(
    async (
      recommendationParam?: 'approved' | 'rejected' | 'revision_required'
    ) => {
      if (!verification?._id) return;

      const finalRecommendation = recommendationParam || recommendation;

      try {
        await completeVerification({
          verificationId: verification._id,
          qualityScore,
          verificationNotes,
          recommendation: finalRecommendation,
        });
        toast.success('Verification completed successfully');
      } catch (error) {
        toast.error('Failed to complete verification');
        console.error('Error completing verification:', error);
      }
    },
    [
      verification?._id,
      completeVerification,
      qualityScore,
      verificationNotes,
      recommendation,
    ]
  );

  const handleDocumentVerify = useCallback(
    async (documentId: string, isVerified: boolean) => {
      try {
        await verifyDocument({
          documentId: documentId as Id<'documents'>,
          isVerified,
        });
        toast.success(
          `Document ${isVerified ? 'verified' : 'unverified'} successfully`
        );
      } catch (error) {
        toast.error('Failed to update document verification status');
        console.error('Error verifying document:', error);
      }
    },
    [verifyDocument]
  );

  // Report and Certificate handlers
  const handleGenerateReport = useCallback((report: VerificationReport) => {
    setGeneratedReport(report);
    toast.success('Verification report generated successfully');
  }, []);

  const handleGenerateCertificate = useCallback(
    (certificate: VerificationCertificate) => {
      setGeneratedCertificate(certificate);
      toast.success('Verification certificate generated successfully');
    },
    []
  );

  const handleExportReport = useCallback(
    async (format: 'pdf' | 'html' | 'json') => {
      if (!generatedReport) return;

      try {
        let blob: Blob;
        let filename: string;

        switch (format) {
          case 'pdf':
            blob = await PDFExportService.generateReportPDF(generatedReport);
            filename = `verification-report-${generatedReport.projectName}-${new Date().toISOString().split('T')[0]}.pdf`;
            break;
          case 'html': {
            const htmlContent =
              PDFExportService.generateReportHTML(generatedReport);
            blob = new Blob([htmlContent], { type: 'text/html' });
            filename = `verification-report-${generatedReport.projectName}-${new Date().toISOString().split('T')[0]}.html`;
            break;
          }
          case 'json':
            blob = PDFExportService.exportToJSON(generatedReport);
            filename = `verification-report-${generatedReport.projectName}-${new Date().toISOString().split('T')[0]}.json`;
            break;
          default:
            return;
        }

        PDFExportService.downloadBlob(blob, filename);
        toast.success(`Report exported as ${format.toUpperCase()}`);
      } catch (error) {
        toast.error('Failed to export report');
        console.error('Export error:', error);
      }
    },
    [generatedReport]
  );

  const handleExportCertificate = useCallback(
    async (format: 'pdf' | 'png' | 'svg') => {
      if (!generatedCertificate) return;

      try {
        let blob: Blob;
        let filename: string;

        switch (format) {
          case 'pdf':
            blob =
              await PDFExportService.generateCertificatePDF(
                generatedCertificate
              );
            filename = `certificate-${generatedCertificate.certificateNumber}.pdf`;
            break;
          case 'png': {
            // For demo purposes, we'll export as HTML
            const htmlContent =
              PDFExportService.generateCertificateHTML(generatedCertificate);
            blob = new Blob([htmlContent], { type: 'text/html' });
            filename = `certificate-${generatedCertificate.certificateNumber}.html`;
            break;
          }
          case 'svg': {
            // For demo purposes, we'll export as HTML
            const svgContent =
              PDFExportService.generateCertificateHTML(generatedCertificate);
            blob = new Blob([svgContent], { type: 'text/html' });
            filename = `certificate-${generatedCertificate.certificateNumber}.html`;
            break;
          }
          default:
            return;
        }

        PDFExportService.downloadBlob(blob, filename);
        toast.success(`Certificate exported as ${format.toUpperCase()}`);
      } catch (error) {
        toast.error('Failed to export certificate');
        console.error('Export error:', error);
      }
    },
    [generatedCertificate]
  );

  // Loading states
  if (
    !verification ||
    !permissions ||
    !projectDocuments ||
    !documentVerificationStatus
  ) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project review...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check permissions
  if (!permissions.canViewVerifierDashboard) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to review this project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Verification Review #{verification._id.slice(-6)}
          </h1>
          <p className="text-gray-600">
            Verification Session - Priority: {verification.priority}
          </p>
          <p className="text-sm text-gray-500">
            Status: {verification.status} | Due:{' '}
            {new Date(verification.dueDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          {verification.status === 'assigned' && (
            <>
              <button
                onClick={handleAcceptVerification}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Accept Verification
              </button>
              <button
                onClick={handleStartVerification}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Accept & Start
              </button>
            </>
          )}
          {verification.status === 'accepted' && (
            <button
              onClick={handleStartVerification}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Start Verification
            </button>
          )}
          {verification.status === 'in_progress' && (
            <>
              <button
                onClick={() => handleCompleteVerification('approved')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Approve Project
              </button>
              <button
                onClick={() => handleCompleteVerification('rejected')}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Reject Project
              </button>
              <button
                onClick={() => handleCompleteVerification('revision_required')}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                Request Revision
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-md sticky top-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full text-left p-3 rounded ${activeSection === 'overview' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                Project Overview
              </button>
              <button
                onClick={() => setActiveSection('documents')}
                className={`w-full text-left p-3 rounded ${activeSection === 'documents' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                Document Review
              </button>
              <button
                onClick={() => setActiveSection('checklist')}
                className={`w-full text-left p-3 rounded ${activeSection === 'checklist' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                Verification Checklist
              </button>
              <button
                onClick={() => setActiveSection('communication')}
                className={`w-full text-left p-3 rounded flex items-center justify-between ${activeSection === 'communication' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                <span>Communication</span>
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
                {urgentCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1 py-1 rounded-full animate-pulse">
                    !
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSection('auditTrail')}
                className={`w-full text-left p-3 rounded ${activeSection === 'auditTrail' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                Audit Trail
              </button>
              <button
                onClick={() => setActiveSection('report')}
                className={`w-full text-left p-3 rounded ${activeSection === 'report' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                Generate Report
              </button>
              <button
                onClick={() => setActiveSection('certificate')}
                className={`w-full text-left p-3 rounded ${activeSection === 'certificate' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                Generate Certificate
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Project Overview */}
          {activeSection === 'overview' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Project Overview</h2>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verification ID</p>
                  <p className="font-medium">#{verification._id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Priority</p>
                  <p className="font-medium capitalize">
                    {verification.priority}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assigned Date</p>
                  <p className="font-medium">
                    {new Date(verification.assignedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Due Date</p>
                  <p className="font-medium">
                    {new Date(verification.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Review Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Verification Notes
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full h-32 p-3 border rounded"
                  placeholder="Add your verification notes here..."
                />
              </div>

              {/* Quality Score */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quality Score (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={qualityScore}
                  onChange={(e) => setQualityScore(Number(e.target.value))}
                  className="w-24 p-2 border rounded"
                />
              </div>
            </div>
          )}

          {/* Document Review */}
          {activeSection === 'documents' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Document Review</h2>
                  {selectedDocumentId && (
                    <button
                      onClick={() => handleManualSave(selectedDocumentId)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Save Annotations
                    </button>
                  )}
                </div>

                {/* Document List */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">
                    Project Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {projectDocuments.map((doc: any) => (
                      <div
                        key={doc._id}
                        onClick={() => handleDocumentSelect(doc)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedDocumentId === doc._id
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1 line-clamp-2">
                              {doc.originalName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {doc.fileSizeFormatted} • {doc.documentType}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  doc.isVerified
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {doc.isVerified ? 'Verified' : 'Pending'}
                              </span>
                              {(() => {
                                const annotations =
                                  documentAnnotations[doc._id];
                                return (
                                  annotations &&
                                  annotations.length > 0 && (
                                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                      {annotations.length} annotation
                                      {annotations.length !== 1 ? 's' : ''}
                                    </span>
                                  )
                                );
                              })()}
                              {permissions.canVerifyDocuments && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleDocumentVerify(
                                      doc._id,
                                      !doc.isVerified
                                    );
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  {doc.isVerified ? 'Unverify' : 'Verify'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced PDF Viewer with Collaborative Annotations */}
              <div className="flex h-[600px]">
                {selectedDocumentId ? (
                  (() => {
                    const selectedDoc = projectDocuments.find(
                      (doc: any) => doc._id === selectedDocumentId
                    );
                    if (!selectedDoc) return null;

                    return (
                      <>
                        {/* PDF Viewer */}
                        <div className="flex-1">
                          <PDFViewerWrapper
                            url={selectedDoc.media.cloudinary_url}
                            fileName={selectedDoc.originalName}
                            annotations={
                              documentAnnotations[selectedDoc._id] || []
                            }
                            onAnnotationChange={(annotations) =>
                              handleAnnotationChange(
                                selectedDoc._id,
                                annotations
                              )
                            }
                            readOnly={verification.status !== 'in_progress'}
                          />
                        </div>

                        {/* Collaborative Annotations Panel */}
                        {verification.status === 'in_progress' && (
                          <CollaborativeAnnotations
                            annotations={
                              documentAnnotations[selectedDoc._id] || []
                            }
                            onAnnotationUpdate={(id, updates) => {
                              const currentAnnotations =
                                documentAnnotations[selectedDoc._id] || [];
                              const updatedAnnotations = currentAnnotations.map(
                                (ann) =>
                                  ann.id === id ? { ...ann, ...updates } : ann
                              );
                              handleAnnotationChange(
                                selectedDoc._id,
                                updatedAnnotations
                              );
                            }}
                            currentUser={
                              currentUser
                                ? {
                                    id: currentUser._id,
                                    name: `${currentUser.firstName} ${currentUser.lastName}`,
                                    role: currentUser.role,
                                  }
                                : { id: '', name: '', role: '' }
                            }
                            readOnly={false}
                          />
                        )}
                      </>
                    );
                  })()
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50 flex-1">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select a Document
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Choose a document from the list above to view and
                        annotate
                      </p>
                      <div className="text-sm text-gray-500">
                        Enhanced PDF viewer with text highlighting, annotations,
                        and collaborative review features
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Verification Checklist */}
          {activeSection === 'checklist' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">
                Enhanced Verification Checklist
              </h2>
              <EnhancedChecklist
                verification={verification}
                isEditable={verification.status === 'in_progress'}
              />
            </div>
          )}

          {/* Enhanced Communication */}
          {activeSection === 'communication' && (
            <EnhancedCommunicationPanel
              verification={verification}
              currentUser={
                currentUser
                  ? {
                      id: currentUser._id,
                      name: `${currentUser.firstName} ${currentUser.lastName}`,
                      role: currentUser.role,
                    }
                  : { id: '', name: '', role: '' }
              }
              onSendMessage={async (messageData) => {
                await sendMessage({
                  verificationId: verification._id,
                  recipientId: messageData.recipientId as Id<'users'>,
                  subject: messageData.subject,
                  message: messageData.message,
                  priority: messageData.priority,
                  threadId: messageData.threadId,
                });
              }}
              messages={transformedMessages}
              isLoading={!verification || !currentUser}
              projectInfo={{
                id: projectId,
                title: 'Project Verification',
                creatorId: verification?.verifierId || '',
                creatorName: 'Project Team',
              }}
            />
          )}

          {/* Audit Trail */}
          {activeSection === 'auditTrail' && (
            <AuditTrailPanel auditTrail={auditTrail} />
          )}

          {/* Generate Report Section */}
          {activeSection === 'report' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">
                Generate Verification Report
              </h2>
              <VerificationReportGenerator
                verificationId={projectId}
                projectData={{
                  id: projectId,
                  name: project?.title || 'Project',
                  description: project?.description || '',
                  submissionDate: project?._creationTime
                    ? new Date(project._creationTime).toISOString()
                    : new Date().toISOString(),
                  projectType: project?.projectType || 'academic',
                  status: verification.status,
                }}
                verificationResults={{
                  verifierId: currentUser?._id || '',
                  verifierName: currentUser
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : '',
                  startDate: verification._creationTime
                    ? new Date(verification._creationTime).toISOString()
                    : new Date().toISOString(),
                  endDate: verification.completedAt
                    ? new Date(verification.completedAt).toISOString()
                    : new Date().toISOString(),
                  status: verification.status,
                  qualityScore: qualityScore,
                  documents:
                    documents?.map((doc: any) => ({
                      id: doc._id,
                      name: doc.originalName,
                      type: doc.documentType,
                      verified:
                        documentVerificationStatus?.checklist?.find(
                          (dvs: any) => dvs.document?._id === doc._id
                        )?.verified || false,
                      annotations: documentAnnotations[doc._id] || [],
                    })) || [],
                }}
                auditData={{
                  timeline: [],
                  events: [],
                }}
                communicationData={{
                  messages: [],
                  decisions: [],
                }}
                onGenerateReport={handleGenerateReport}
                onExportReport={handleExportReport}
              />
            </div>
          )}

          {/* Generate Certificate Section */}
          {activeSection === 'certificate' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">
                Generate Verification Certificate
              </h2>
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Certificate generation is temporarily disabled while we fix
                  type compatibility issues.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Audit Trail Panel Component
function AuditTrailPanel({ auditTrail }: { auditTrail: any[] | undefined }) {
  if (!auditTrail) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'verification_assigned':
        return '📋';
      case 'verification_accepted':
        return '✅';
      case 'verification_started':
        return '🚀';
      case 'checklist_updated':
        return '📝';
      case 'document_annotated':
        return '📄';
      case 'score_calculated':
        return '📊';
      case 'message_sent':
        return '💬';
      case 'verification_completed':
        return '🏁';
      case 'certificate_generated':
        return '🏆';
      default:
        return '📌';
    }
  };

  const formatActionName = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatTimestamp = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestamp));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Verification Audit Trail</h2>

      {auditTrail.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p>No audit trail entries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {auditTrail.map((entry, index) => (
            <div
              key={entry._id || index}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">
                    {getActionIcon(entry.action)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {formatActionName(entry.action)}
                    </h3>
                    <time className="text-xs text-gray-500">
                      {formatTimestamp(entry.timestamp)}
                    </time>
                  </div>

                  {entry.details?.section && (
                    <p className="text-sm text-gray-600 mt-1">
                      Section:{' '}
                      <span className="font-medium">
                        {entry.details.section}
                      </span>
                    </p>
                  )}

                  {entry.details?.score !== undefined && (
                    <p className="text-sm text-gray-600 mt-1">
                      Score:{' '}
                      <span className="font-medium">
                        {entry.details.score}/100
                      </span>
                    </p>
                  )}

                  {entry.details?.notes && (
                    <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                      {entry.details.notes}
                    </p>
                  )}

                  {entry.details?.newValue &&
                    typeof entry.details.newValue === 'object' && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                          View Details
                        </summary>
                        <pre className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                          {JSON.stringify(entry.details.newValue, null, 2)}
                        </pre>
                      </details>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
