'use client';

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  BarChart3,
  MessageCircle,
  CheckCircle,
  Check,
  Clock,
  Download,
  FileText,
  AlertTriangle,
  Eye,
  Filter,
  Globe,
  Info,
  Search,
  MapPin,
  Edit,
  Image,
  User,
  XCircle,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ProgressSubmission {
  id: string;
  projectId: string;
  projectName: string;
  creatorName: string;
  submissionType:
    | 'milestone'
    | 'progress_update'
    | 'completion'
    | 'documentation';
  submittedAt: string;
  reportingPeriod: string;
  status:
    | 'pending'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'requires_revision';
  title: string;
  description: string;
  completionPercentage: number;
  metrics: {
    treesPlanted?: number;
    carbonOffset?: number;
    energyGenerated?: number;
    wasteRemoved?: number;
    areaRestored?: number;
  };
  documents: {
    id: string;
    name: string;
    type: 'image' | 'pdf' | 'video' | 'report';
    url: string;
    size: string;
    uploadedAt: string;
  }[];
  geoLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  previousProgress?: number;
  targetProgress?: number;
  verifierNotes?: string;
  creatorResponse?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  region: string;
}

interface ProgressReviewToolsProps {
  submissions?: ProgressSubmission[];
  selectedSubmission?: ProgressSubmission;
  onSubmissionSelect?: (submission: ProgressSubmission) => void;
  onApprove?: (submissionId: string, notes: string) => void;
  onReject?: (submissionId: string, reason: string) => void;
  onRequestRevision?: (submissionId: string, feedback: string) => void;
  currentVerifierId?: string;
}

const ProgressReviewTools: React.FC<ProgressReviewToolsProps> = ({
  submissions = [],
  selectedSubmission,
  onSubmissionSelect,
  onApprove,
  onReject,
  onRequestRevision,
  currentVerifierId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('submittedAt');
  const [viewMode, setViewMode] = useState<'list' | 'detailed'>('list');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<
    'approve' | 'reject' | 'revise'
  >('approve');

  // Mock data for demonstration
  const mockSubmissions: ProgressSubmission[] = [
    {
      id: 'sub-1',
      projectId: 'proj-1',
      projectName: 'Urban Reforestation Initiative',
      creatorName: 'EcoGreen Solutions',
      submissionType: 'milestone',
      submittedAt: '2024-01-15T10:30:00Z',
      reportingPeriod: 'Q1 2024',
      status: 'under_review',
      title: 'Q1 Milestone: 500 Trees Planted',
      description:
        'Successfully planted 500 native tree species across designated urban areas. Includes survival rate monitoring and community engagement metrics.',
      completionPercentage: 75,
      metrics: {
        treesPlanted: 500,
        carbonOffset: 12.5,
        areaRestored: 2.3,
      },
      documents: [
        {
          id: 'doc-1',
          name: 'plantation-report-q1.pdf',
          type: 'pdf',
          url: '/documents/plantation-report-q1.pdf',
          size: '2.4 MB',
          uploadedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'doc-2',
          name: 'site-photos-january.zip',
          type: 'image',
          url: '/documents/site-photos-january.zip',
          size: '15.7 MB',
          uploadedAt: '2024-01-15T10:15:00Z',
        },
      ],
      geoLocation: {
        latitude: 40.7128,
        longitude: -74.006,
        address: 'Central Park, New York, NY',
      },
      previousProgress: 50,
      targetProgress: 75,
      priority: 'high',
      category: 'Reforestation',
      region: 'North America',
    },
    {
      id: 'sub-2',
      projectId: 'proj-2',
      projectName: 'Solar Farm Development',
      creatorName: 'SolarTech Corp',
      submissionType: 'progress_update',
      submittedAt: '2024-01-14T14:20:00Z',
      reportingPeriod: 'January 2024',
      status: 'pending',
      title: 'Monthly Progress Update - Installation Phase',
      description:
        'Completed installation of 75% of solar panels. Weather delays affected timeline but quality remains high.',
      completionPercentage: 75,
      metrics: {
        energyGenerated: 0,
        carbonOffset: 0,
      },
      documents: [
        {
          id: 'doc-3',
          name: 'installation-progress-jan.pdf',
          type: 'report',
          url: '/documents/installation-progress-jan.pdf',
          size: '1.8 MB',
          uploadedAt: '2024-01-14T14:00:00Z',
        },
      ],
      previousProgress: 60,
      targetProgress: 80,
      priority: 'medium',
      category: 'Renewable Energy',
      region: 'Europe',
    },
  ];

  const displaySubmissions =
    submissions.length > 0 ? submissions : mockSubmissions;

  const filteredSubmissions = displaySubmissions.filter((submission) => {
    const matchesSearch =
      submission.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || submission.status === filterStatus;
    const matchesType =
      filterType === 'all' || submission.submissionType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'under_review':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'requires_revision':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return CheckCircle;
      case 'progress_update':
        return BarChart3;
      case 'completion':
        return FileText;
      case 'documentation':
        return Download;
      default:
        return FileText;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReviewSubmit = () => {
    if (!selectedSubmission) return;

    switch (reviewAction) {
      case 'approve':
        if (onApprove) onApprove(selectedSubmission.id, reviewNotes);
        break;
      case 'reject':
        if (onReject) onReject(selectedSubmission.id, reviewNotes);
        break;
      case 'revise':
        if (onRequestRevision)
          onRequestRevision(selectedSubmission.id, reviewNotes);
        break;
    }

    setShowReviewModal(false);
    setReviewNotes('');
  };

  const renderDetailedView = (submission: ProgressSubmission) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {submission.title}
              </h3>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(submission.status)}`}
              >
                {submission.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-600 mb-2">
              {submission.projectName} • {submission.creatorName}
            </p>
            <p className="text-sm text-gray-500">
              Submitted: {formatDate(submission.submittedAt)} • Period:{' '}
              {submission.reportingPeriod}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(submission.priority)}`}
            >
              {submission.priority}
            </span>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Review
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Progress Overview
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Completion Progress
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {submission.completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${submission.completionPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Previous: {submission.previousProgress}%</span>
                  <span>Target: {submission.targetProgress}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Description
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {submission.description}
              </p>
            </div>

            {/* Metrics */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Environmental Metrics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(submission.metrics).map(([key, value]) => {
                  if (value === undefined || value === 0) return null;
                  return (
                    <div key={key} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {typeof value === 'number'
                          ? value.toLocaleString()
                          : value}
                        {key.includes('carbon')
                          ? ' tons CO₂'
                          : key.includes('trees')
                            ? ' trees'
                            : key.includes('energy')
                              ? ' MWh'
                              : key.includes('area')
                                ? ' acres'
                                : key.includes('waste')
                                  ? ' tons'
                                  : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            {submission.geoLocation && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Location
                </h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {submission.geoLocation.address}
                    </p>
                    <p className="text-xs text-gray-500">
                      {submission.geoLocation.latitude.toFixed(4)},{' '}
                      {submission.geoLocation.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Documents Sidebar */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              Supporting Documents
            </h4>
            <div className="space-y-3">
              {submission.documents.map((doc) => {
                const getDocIcon = (type: string) => {
                  switch (type) {
                    case 'image':
                      return Image;
                    case 'video':
                      return Image;
                    case 'pdf':
                    case 'report':
                      return FileText;
                    default:
                      return Download;
                  }
                };
                const DocIcon = getDocIcon(doc.type);

                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <DocIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.size} • {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Previous Notes */}
            {submission.verifierNotes && (
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Previous Verifier Notes
                </h5>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {submission.verifierNotes}
                  </p>
                </div>
              </div>
            )}

            {submission.creatorResponse && (
              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Creator Response
                </h5>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {submission.creatorResponse}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Progress Review Tools
          </h2>
          <p className="text-gray-600">
            Review and verify project progress submissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setViewMode(viewMode === 'list' ? 'detailed' : 'list')
            }
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {viewMode === 'list' ? 'Detailed View' : 'List View'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="requires_revision">Requires Revision</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="milestone">Milestone</option>
            <option value="progress_update">Progress Update</option>
            <option value="completion">Completion</option>
            <option value="documentation">Documentation</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'detailed' && selectedSubmission ? (
        <div className="space-y-4">
          <button
            onClick={() => onSubmissionSelect?.(undefined as any)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </button>
          {renderDetailedView(selectedSubmission)}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => {
            const TypeIcon = getTypeIcon(submission.submissionType);
            return (
              <div
                key={submission.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TypeIcon className="h-5 w-5 text-gray-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(submission.priority)}`}
                      >
                        {submission.priority}
                      </span>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(submission.status)}`}
                      >
                        {submission.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      {submission.projectName} • {submission.creatorName}
                    </p>
                    <p className="text-gray-700 mb-3">
                      {submission.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(submission.submittedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        {submission.completionPercentage}% complete
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {submission.documents.length} documents
                      </div>
                      {submission.geoLocation && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Location verified
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          {submission.completionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${submission.completionPercentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <button
                      onClick={() => onSubmissionSelect?.(submission)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Review Submission
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="approve"
                      checked={reviewAction === 'approve'}
                      onChange={(e) => setReviewAction(e.target.value as any)}
                      className="mr-2"
                    />
                    <Check className="h-4 w-4 text-green-600 mr-1" />
                    Approve submission
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="revise"
                      checked={reviewAction === 'revise'}
                      onChange={(e) => setReviewAction(e.target.value as any)}
                      className="mr-2"
                    />
                    <Edit className="h-4 w-4 text-orange-600 mr-1" />
                    Request revision
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="reject"
                      checked={reviewAction === 'reject'}
                      onChange={(e) => setReviewAction(e.target.value as any)}
                      className="mr-2"
                    />
                    <X className="h-4 w-4 text-red-600 mr-1" />
                    Reject submission
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {reviewAction === 'approve'
                    ? 'Notes (optional)'
                    : reviewAction === 'revise'
                      ? 'Revision feedback'
                      : 'Rejection reason'}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    reviewAction === 'approve'
                      ? 'Add any additional notes...'
                      : reviewAction === 'revise'
                        ? 'Specify what needs to be revised...'
                        : 'Explain why this submission is being rejected...'
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleReviewSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Submit Review
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No submissions found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No submissions match your current filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressReviewTools;
