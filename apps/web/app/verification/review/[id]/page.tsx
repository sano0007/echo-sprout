'use client';

import { api } from '@packages/backend';
import type { Id } from '@packages/backend/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
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
  const [qualityScore, setQualityScore] = useState<number>(8);
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

  const userIds = Array.from(
    new Set(
      realtimeMessages?.flatMap((msg: any) => [
        msg.senderId,
        msg.recipientId,
      ]) || []
    )
  ).filter(Boolean);

  const messageUsers = useQuery(
    api.users.getUsersByIds,
    userIds.length > 0 ? { ids: userIds } : 'skip'
  );

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

  const auditTrail = useQuery(
    api.verifications.getVerificationAuditTrail,
    verification?._id ? { verificationId: verification._id } : 'skip'
  );

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

  const handleAnnotationChange = useCallback(
    (documentId: string, annotations: Annotation[]) => {
      console.log('Annotation change detected:', {
        documentId,
        annotationCount: annotations.length,
      });

      setDocumentAnnotations((prev) => ({
        ...prev,
        [documentId]: annotations,
      }));

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        await debouncedSave(documentId, annotations);
      }, 1000);
    },
    [debouncedSave]
  );

  const handleManualSave = useCallback(
    async (documentId: string) => {
      const annotations = documentAnnotations[documentId] || [];

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      await debouncedSave(documentId, annotations);
    },
    [documentAnnotations, debouncedSave]
  );

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

  const validateVerificationForm = useCallback(() => {
    const errors: string[] = [];

    if (!verificationNotes.trim()) {
      errors.push('Verification notes are required');
    } else if (verificationNotes.trim().length < 20) {
      errors.push('Verification notes must be at least 20 characters long');
    }

    if (qualityScore < 1 || qualityScore > 10 || isNaN(qualityScore)) {
      errors.push('Quality score must be between 1 and 10');
    }

    if (!recommendation) {
      errors.push('Recommendation must be selected');
    }

    return errors;
  }, [verificationNotes, qualityScore, recommendation]);

  const isFormValid = useMemo(() => {
    return validateVerificationForm().length === 0;
  }, [validateVerificationForm]);

  const handleCompleteVerification = useCallback(
    async (
      recommendationParam?: 'approved' | 'rejected' | 'revision_required'
    ) => {
      if (!verification?._id) return;

      const validationErrors = validateVerificationForm();
      if (validationErrors.length > 0) {
        toast.error(
          `Please fix the following issues:\n\n${validationErrors.join('\n')}`
        );
        return;
      }

      const finalRecommendation = recommendationParam || recommendation;

      if (finalRecommendation === 'approved' && qualityScore < 6) {
        const confirmLowScore = confirm(
          `You're approving a project with a quality score of ${qualityScore}/10. Are you sure you want to proceed?`
        );
        if (!confirmLowScore) return;
      }

      if (finalRecommendation === 'rejected' && qualityScore >= 8) {
        const confirmHighScore = confirm(
          `You're rejecting a project with a quality score of ${qualityScore}/10. Are you sure you want to proceed?`
        );
        if (!confirmHighScore) return;
      }

      const verifiedDocuments =
        documents?.filter((doc) => {
          if (doc.isVerified === true) return true;

          const checklistVerified = documentVerificationStatus?.checklist?.find(
            (status) => status.document?._id === doc._id && status.verified
          );
          if (checklistVerified) return true;

          const statusVerified = documentVerificationStatus?.checklist?.some(
            (status) => status.document?._id === doc._id && status.verified
          );
          if (statusVerified) return true;

          return false;
        }).length || 0;

      console.log('Document verification debug:', {
        totalDocuments: documents?.length || 0,
        verifiedDocuments,
        documents: documents?.map((doc) => ({
          id: doc._id,
          name: doc.originalName,
          isVerified: doc.isVerified,
        })),
        documentVerificationStatus,
      });

      if (verifiedDocuments === 0 && finalRecommendation === 'approved') {
        const totalDocs = documents?.length || 0;
        const confirmNoDocuments = confirm(
          `Document verification check:\n\nTotal documents: ${totalDocs}\nVerified documents: ${verifiedDocuments}\n\nNo documents have been verified yet. Are you sure you want to approve this project?`
        );
        if (!confirmNoDocuments) return;
      }

      try {
        await completeVerification({
          verificationId: verification._id,
          qualityScore,
          verificationNotes,
          recommendation: finalRecommendation,
        });
        toast.success(
          `Verification completed successfully! Project has been ${finalRecommendation}.`
        );

        setTimeout(() => {
          window.location.reload();
        }, 1500);
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
      validateVerificationForm,
      documents,
      documentVerificationStatus,
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

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        toast.error('Failed to update document verification status');
        console.error('Error verifying document:', error);
      }
    },
    [verifyDocument]
  );

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
            const htmlContent =
              PDFExportService.generateCertificateHTML(generatedCertificate);
            blob = new Blob([htmlContent], { type: 'text/html' });
            filename = `certificate-${generatedCertificate.certificateNumber}.html`;
            break;
          }
          case 'svg': {
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

  const scaledQualityScore = useMemo(() => qualityScore * 10, [qualityScore]);

  const memoizedProjectData = useMemo(
    () => ({
      id: projectId,
      name: project?.title || 'Project',
      description: project?.description || '',
      submissionDate: project?._creationTime
        ? new Date(project._creationTime).toISOString()
        : new Date().toISOString(),
      projectType: project?.projectType || 'academic',
      status: verification?.status,
      creatorId: project?.creatorId || '',
      creatorName:
        currentUser?.firstName && currentUser?.lastName
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : 'Unknown Creator',
      creatorEmail: currentUser?.email || '',
      organization: currentUser?.organizationName || '',
      tags: [],
      compliance: [],
      metadata: {
        totalDocuments: documents?.length || 0,
        verifiedDocuments:
          documents?.filter(
            (doc) =>
              documentVerificationStatus?.checklist?.find(
                (dvs: any) => dvs.document?._id === doc._id
              )?.verified
          ).length || 0,
        totalAnnotations: Object.values(documentAnnotations).flat().length || 0,
        lastUpdated: verification?._creationTime,
        complexity:
          (documents?.length || 0) > 10
            ? 'high'
            : (documents?.length || 0) > 5
              ? 'medium'
              : 'low',
        riskLevel:
          scaledQualityScore < 60
            ? 'high'
            : scaledQualityScore < 80
              ? 'medium'
              : 'low',
      },
    }),
    [
      project,
      verification,
      documents,
      documentVerificationStatus,
      documentAnnotations,
      scaledQualityScore,
      projectId,
    ]
  );

  const memoizedVerificationResults = useMemo(
    () => ({
      verifierId: currentUser?._id || '',
      verifierName: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : '',
      verifierEmail: currentUser?.email || '',

      verifierRole:
        currentUser?.role === 'admin'
          ? 'Senior Verification Specialist'
          : 'Verification Specialist',
      verifierCredentials: [
        currentUser?.role === 'admin'
          ? 'Senior Verification Specialist'
          : 'Verification Specialist',
        'Certified Project Auditor',
        'Academic Assessment Expert',
        'Quality Assurance Specialist',
        ...(currentUser?.role === 'admin'
          ? ['Administrative Authority', '10+ years experience']
          : ['5+ years experience']),
      ],
      verifierOrganization: 'Independent Verification Authority',
      startDate: verification?._creationTime
        ? new Date(verification._creationTime).toISOString()
        : new Date().toISOString(),
      endDate: verification?.completedAt
        ? new Date(verification.completedAt).toISOString()
        : new Date().toISOString(),
      status: verification?.status,
      qualityScore: scaledQualityScore,
      recommendation: recommendation,
      categories: [
        {
          name: 'Documentation Quality',
          score: Math.min(
            100,
            Math.max(0, scaledQualityScore + Math.random() * 20 - 10)
          ),
          maxScore: 100,
          weight: 30,
          status: scaledQualityScore >= 70 ? 'passed' : 'needs_improvement',
          comments:
            scaledQualityScore >= 70
              ? 'Well documented project'
              : 'Documentation needs improvement',
        },
        {
          name: 'Technical Implementation',
          score: Math.min(
            100,
            Math.max(0, scaledQualityScore + Math.random() * 15 - 7.5)
          ),
          maxScore: 100,
          weight: 40,
          status: scaledQualityScore >= 75 ? 'passed' : 'needs_improvement',
          comments:
            scaledQualityScore >= 75
              ? 'Strong technical implementation'
              : 'Technical aspects need review',
        },
        {
          name: 'Project Completeness',
          score: Math.min(
            100,
            Math.max(0, scaledQualityScore + Math.random() * 10 - 5)
          ),
          maxScore: 100,
          weight: 30,
          status: scaledQualityScore >= 80 ? 'passed' : 'needs_improvement',
          comments:
            scaledQualityScore >= 80
              ? 'Complete project submission'
              : 'Some components may be missing',
        },
      ],
      strengths:
        scaledQualityScore >= 80
          ? [
              'High quality implementation',
              'Comprehensive documentation',
              'Well-structured codebase',
            ]
          : scaledQualityScore >= 60
            ? ['Good foundation', 'Clear project objectives']
            : ['Project concept is clear'],
      weaknesses:
        scaledQualityScore < 60
          ? [
              'Significant improvements needed',
              'Documentation insufficient',
              'Implementation gaps identified',
            ]
          : scaledQualityScore < 80
            ? ['Some areas need refinement', 'Documentation could be enhanced']
            : [],
      recommendations:
        scaledQualityScore < 60
          ? [
              'Comprehensive revision required',
              'Improve documentation quality',
              'Address technical implementation gaps',
            ]
          : scaledQualityScore < 80
            ? [
                'Minor improvements recommended',
                'Enhance documentation completeness',
              ]
            : ['Excellent work, minor polishing suggested'],
      documents:
        documents?.map((doc: any) => ({
          id: doc._id,
          name: doc.originalName,
          type: doc.documentType,
          verified:
            documentVerificationStatus?.checklist?.find(
              (dvs: any) => dvs.document?._id === doc._id
            )?.verified || false,
          annotations: documentAnnotations[doc._id]?.length || 0,
          comments:
            documentAnnotations[doc._id]?.map((ann) => ann.content) || [],
          size: doc.size || 0,
          uploadDate: doc._creationTime || new Date().toISOString(),
        })) || [],
    }),
    [
      currentUser,
      verification,
      scaledQualityScore,
      documents,
      documentVerificationStatus,
      documentAnnotations,
    ]
  );

  const memoizedAuditData = useMemo(
    () => ({
      timeline:
        auditTrail?.map((entry) => ({
          id: entry._id || 'unknown',
          timestamp: entry.timestamp || new Date().toISOString(),
          action: entry.action || 'unknown_action',
          description: entry.details?.section
            ? `${entry.action || 'action'} in ${entry.details.section}`
            : entry.action || 'unknown_action',
          user: entry.verifierId || 'unknown_user',
          category: entry.action?.includes('document')
            ? 'document'
            : entry.action?.includes('message')
              ? 'communication'
              : entry.action?.includes('verification')
                ? 'verification'
                : 'system',
        })) || [],
      events:
        auditTrail?.map((entry) => ({
          id: entry._id || 'unknown',
          timestamp: entry.timestamp || new Date().toISOString(),
          type: entry.action || 'unknown_event',
          severity: entry.details?.score
            ? entry.details.score < 60
              ? 'critical'
              : entry.details.score < 80
                ? 'medium'
                : 'low'
            : 'low',
          description: entry.details?.notes || entry.action || 'unknown_event',
          metadata: entry.details || {},
        })) || [],
    }),
    [auditTrail]
  );

  const memoizedCommunicationData = useMemo(
    () => ({
      messages:
        transformedMessages?.map((msg) => ({
          id: msg.id || msg._id || 'unknown',
          timestamp: msg.timestamp || new Date().toISOString(),
          sender: msg.sender?.name || msg.senderName || 'Unknown User',
          content: msg.message || '',
          priority: msg.priority || 'normal',
          type: msg.attachments?.length > 0 ? 'attachment' : 'text',
        })) || [],
      decisions:
        auditTrail
          ?.filter(
            (entry) =>
              entry?.action?.includes('approved') ||
              entry?.action?.includes('rejected') ||
              entry?.action?.includes('completed')
          )
          .map((entry) => ({
            id: entry._id || 'unknown',
            timestamp: entry.timestamp || new Date().toISOString(),
            decision: entry.action?.includes('approved')
              ? 'approved'
              : entry.action?.includes('rejected')
                ? 'rejected'
                : 'completed',
            reasoning: entry.details?.notes || '',
            score: entry.details?.score || null,
          })) || [],
      lastMessage: transformedMessages?.[transformedMessages.length - 1],
    }),
    [transformedMessages, auditTrail]
  );

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
                disabled={!isFormValid}
                className={`px-4 py-2 rounded font-medium transition-all duration-200 flex items-center gap-2 ${
                  isFormValid
                    ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  !isFormValid
                    ? 'Please complete all required fields'
                    : 'Approve this project'
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Approve Project
              </button>
              <button
                onClick={() => handleCompleteVerification('rejected')}
                disabled={!isFormValid}
                className={`px-4 py-2 rounded font-medium transition-all duration-200 flex items-center gap-2 ${
                  isFormValid
                    ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  !isFormValid
                    ? 'Please complete all required fields'
                    : 'Reject this project'
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Reject Project
              </button>
              <button
                onClick={() => handleCompleteVerification('revision_required')}
                disabled={!isFormValid}
                className={`px-4 py-2 rounded font-medium transition-all duration-200 flex items-center gap-2 ${
                  isFormValid
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  !isFormValid
                    ? 'Please complete all required fields'
                    : 'Request revisions for this project'
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Request Revision
              </button>
              {!isFormValid && (
                <div className="flex items-center text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Complete verification assessment first
                </div>
              )}
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
            <div className="space-y-6">
              {/* Project Information Card */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
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
                  Project Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="col-span-full">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        {project?.title || 'Project Title'}
                      </h3>
                      <p className="text-blue-700 text-sm">
                        {project?.description || 'No description available'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Project Type</p>
                    <p className="font-medium capitalize text-gray-900">
                      {project?.projectType || 'Academic'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      Submission Date
                    </p>
                    <p className="font-medium text-gray-900">
                      {project?._creationTime
                        ? new Date(project._creationTime).toLocaleDateString()
                        : 'Not specified'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Documents</p>
                    <p className="font-medium text-gray-900">
                      {projectDocuments?.length || 0} files
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Details Card */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Verification Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">
                      Verification ID
                    </p>
                    <p className="font-medium text-blue-900">
                      #{verification._id.slice(-8)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-600 mb-1">Priority</p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        verification.priority === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : verification.priority === 'normal'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {verification.priority}
                    </span>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-600 mb-1">Assigned Date</p>
                    <p className="font-medium text-amber-900">
                      {new Date(verification.assignedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 mb-1">Due Date</p>
                    <p className="font-medium text-red-900">
                      {new Date(verification.dueDate).toLocaleDateString()}
                    </p>
                    {new Date(verification.dueDate) < new Date() && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full mt-1">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification Actions Card */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Verification Assessment
                </h2>

                {/* Verification Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Verification Notes *
                    <span className="text-red-500 ml-1">Required</span>
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className={`w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 ${
                      !verificationNotes.trim()
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Provide detailed verification notes, observations, and recommendations..."
                    required
                  />
                  {!verificationNotes.trim() && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verification notes are required
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    Character count: {verificationNotes.length} (minimum 50
                    characters recommended)
                  </p>
                </div>

                {/* Quality Score and Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Quality Score (1-10) *
                      <span className="text-red-500 ml-1">Required</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={qualityScore}
                        onChange={(e) =>
                          setQualityScore(Number(e.target.value))
                        }
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 ${
                          qualityScore < 1 || qualityScore > 10
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            qualityScore >= 8
                              ? 'bg-green-500'
                              : qualityScore >= 6
                                ? 'bg-yellow-500'
                                : qualityScore >= 4
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                          }`}
                        ></div>
                      </div>
                    </div>
                    {(qualityScore < 1 || qualityScore > 10) && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Score must be between 1 and 10
                      </p>
                    )}
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>1-3: Poor</span>
                        <span>4-6: Fair</span>
                        <span>7-8: Good</span>
                        <span>9-10: Excellent</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            qualityScore >= 8
                              ? 'bg-green-500'
                              : qualityScore >= 6
                                ? 'bg-yellow-500'
                                : qualityScore >= 4
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(qualityScore * 10, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Recommendation *
                      <span className="text-red-500 ml-1">Required</span>
                    </label>
                    <select
                      value={recommendation}
                      onChange={(e) =>
                        setRecommendation(
                          e.target.value as
                            | 'approved'
                            | 'rejected'
                            | 'revision_required'
                        )
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                      required
                    >
                      <option value="approved">
                        ✅ Approve - Project meets all requirements
                      </option>
                      <option value="revision_required">
                        📝 Revision Required - Minor changes needed
                      </option>
                      <option value="rejected">
                        ❌ Reject - Significant issues identified
                      </option>
                    </select>
                    <div className="mt-2 text-sm">
                      {recommendation === 'approved' && (
                        <p className="text-green-600 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Project will be approved and marked as completed
                        </p>
                      )}
                      {recommendation === 'revision_required' && (
                        <p className="text-yellow-600 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Project will be sent back for revisions
                        </p>
                      )}
                      {recommendation === 'rejected' && (
                        <p className="text-red-600 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Project will be rejected and marked as failed
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Validation Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Validation Status
                  </h4>
                  <div className="space-y-1">
                    <div
                      className={`flex items-center text-sm ${verificationNotes.trim() ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {verificationNotes.trim() ? (
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      Verification notes provided
                    </div>
                    <div
                      className={`flex items-center text-sm ${qualityScore >= 1 && qualityScore <= 10 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {qualityScore >= 1 && qualityScore <= 10 ? (
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      Valid quality score (1-10)
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Recommendation selected
                    </div>
                  </div>
                </div>
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
                            url={selectedDoc.media.cloudinary_url || ''}
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
                projectData={memoizedProjectData}
                verificationResults={memoizedVerificationResults}
                auditData={memoizedAuditData}
                communicationData={memoizedCommunicationData}
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
              <CertificateGenerator
                projectData={{
                  ...memoizedProjectData,
                  studentName:
                    currentUser?.firstName && currentUser?.lastName
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : 'Unknown Creator',
                  studentId: project?.creatorId || '',
                  institutionName:
                    currentUser?.organizationName || 'Unknown Organization',
                  courseCode: '',
                  academicYear: new Date().getFullYear().toString(),
                  supervisor: '',
                  metadata: {
                    ...memoizedProjectData.metadata,
                    verificationDuration: verification?.completedAt
                      ? Math.floor(
                          (new Date(verification.completedAt).getTime() -
                            new Date(verification._creationTime).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 0,
                  },
                }}
                verificationData={{
                  verifierId: currentUser?._id || '',
                  verifierName: currentUser
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : '',
                  verifierEmail: currentUser?.email || '',
                  verifierRole: currentUser?.role || 'Verifier',
                  organization: 'Independent Verification Authority',
                  credentials: [
                    currentUser?.role === 'admin'
                      ? 'Senior Verification Specialist'
                      : 'Verification Specialist',
                    'Certified Project Auditor',
                    'Academic Assessment Expert',
                  ],
                  completionDate:
                    verification?.completedAt || new Date().toISOString(),
                  qualityScore: qualityScore,
                  recommendation: memoizedVerificationResults.recommendation,
                  verificationId: verification?._id || '',
                  scope: [
                    'Document Review',
                    'Technical Assessment',
                    'Quality Evaluation',
                    ...(scaledQualityScore >= 80
                      ? ['Excellence Recognition']
                      : []),
                    ...(documentAnnotations &&
                    Object.keys(documentAnnotations).length > 0
                      ? ['Detailed Annotations']
                      : []),
                  ],
                  securityLevel:
                    scaledQualityScore >= 90
                      ? 'high'
                      : scaledQualityScore >= 70
                        ? 'medium'
                        : 'standard',
                }}
                onCertificateGenerated={handleGenerateCertificate}
                onExportCertificate={handleExportCertificate}
                existingCertificate={generatedCertificate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
