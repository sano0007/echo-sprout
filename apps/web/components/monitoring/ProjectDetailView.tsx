'use client';

import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  FlaskConical,
  Globe,
  Heart,
  Image,
  MapPin,
  Share,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProjectDetailData {
  id: string;
  title: string;
  description: string;
  type:
    | 'reforestation'
    | 'renewable_energy'
    | 'waste_management'
    | 'water_conservation'
    | 'biodiversity';
  status: 'planning' | 'active' | 'completed' | 'verified' | 'suspended';
  location: {
    country: string;
    region: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  creator: {
    id: string;
    name: string;
    organization?: string;
    avatar?: string;
    verification: 'verified' | 'pending' | 'unverified';
  };
  timeline: {
    startDate: string;
    endDate: string;
    currentPhase: string;
    nextMilestone: string;
    progress: number;
  };
  financials: {
    totalCredits: number;
    availableCredits: number;
    pricePerCredit: number;
    totalRaised: number;
    targetAmount: number;
    currency: string;
  };
  impact: {
    co2Offset: number;
    co2OffsetUnit: 'tons' | 'kg';
    additionalBenefits: string[];
    biodiversityScore?: number;
    communityImpact?: number;
  };
  verification: {
    status: 'pending' | 'in_progress' | 'verified' | 'rejected';
    verifier?: string;
    lastVerified?: string;
    nextVerification?: string;
    certifications: string[];
  };
  documentation: {
    photos: string[];
    reports: Array<{
      id: string;
      title: string;
      type: 'progress' | 'verification' | 'impact' | 'financial';
      date: string;
      url: string;
    }>;
    measurements: Array<{
      id: string;
      type: string;
      value: number;
      unit: string;
      date: string;
      verified: boolean;
    }>;
  };
  risks: Array<{
    id: string;
    type: 'environmental' | 'financial' | 'regulatory' | 'operational';
    description: string;
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
  community: {
    followers: number;
    backers: number;
    averageRating: number;
    totalReviews: number;
    updates: number;
  };
  metadata: {
    createdAt: string;
    lastUpdated: string;
    viewCount: number;
    isFavorited: boolean;
    userRating?: number;
  };
}

interface ProjectDetailViewProps {
  projectId: string;
  project: ProjectDetailData;
  userRole: 'creator' | 'buyer' | 'admin' | 'verifier' | 'visitor';
  onInvest?: (amount: number, credits: number) => void;
  onFavorite?: (projectId: string) => void;
  onRate?: (projectId: string, rating: number) => void;
  onShare?: (projectId: string) => void;
  onDownloadReport?: (reportId: string) => void;
}

export default function ProjectDetailView({
  projectId,
  project,
  userRole,
  onInvest,
  onFavorite,
  onRate,
  onShare,
  onDownloadReport,
}: ProjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'timeline'
    | 'impact'
    | 'verification'
    | 'financials'
    | 'documents'
  >('overview');
  const [investmentAmount, setInvestmentAmount] = useState<number>(100);
  const [creditsToInvest, setCreditsToInvest] = useState<number>(1);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(
    project.metadata.userRating || 0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'active':
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'planning':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'suspended':
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reforestation':
        return '🌳';
      case 'renewable_energy':
        return '⚡';
      case 'waste_management':
        return '♻️';
      case 'water_conservation':
        return '💧';
      case 'biodiversity':
        return '🦋';
      default:
        return '🌱';
    }
  };

  const getRiskColor = (risk: { likelihood: string; impact: string }) => {
    const riskScore =
      (risk.likelihood === 'high' ? 3 : risk.likelihood === 'medium' ? 2 : 1) +
      (risk.impact === 'high' ? 3 : risk.impact === 'medium' ? 2 : 1);

    if (riskScore >= 5) return 'border-red-500 bg-red-50';
    if (riskScore >= 3) return 'border-yellow-500 bg-yellow-50';
    return 'border-green-500 bg-green-50';
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: FileText },
    { key: 'timeline', label: 'Timeline', icon: Calendar },
    { key: 'impact', label: 'Impact', icon: Globe },
    { key: 'verification', label: 'Verification', icon: CheckCircle },
    { key: 'financials', label: 'Financials', icon: DollarSign },
    { key: 'documents', label: 'Documents', icon: Image },
  ];

  useEffect(() => {
    setCreditsToInvest(
      Math.floor(investmentAmount / project.financials.pricePerCredit)
    );
  }, [investmentAmount, project.financials.pricePerCredit]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-64 bg-gradient-to-r from-green-600 to-blue-600">
          {project.documentation.photos.length > 0 && (
            <img
              src={project.documentation.photos[0]}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40" />

          {/* Project Header */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex justify-between items-end">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl">{getTypeIcon(project.type)}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}
                  >
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {project.creator.verification === 'verified' && (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {project.location.region}, {project.location.country}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{project.creator.name}</span>
                    {project.creator.organization && (
                      <span className="text-gray-300">
                        • {project.creator.organization}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>
                      {project.metadata.viewCount.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onFavorite?.(projectId)}
                  className="flex items-center space-x-1 px-3 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
                >
                  {project.metadata.isFavorited ? (
                    <Heart className="h-5 w-5 text-red-400 fill-current" />
                  ) : (
                    <Heart className="h-5 w-5" />
                  )}
                  <span className="text-sm">{project.community.followers}</span>
                </button>

                <button
                  onClick={() => onShare?.(projectId)}
                  className="flex items-center space-x-1 px-3 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
                >
                  <Share className="h-5 w-5" />
                  <span className="text-sm">Share</span>
                </button>

                {userRole === 'buyer' &&
                  project.financials.availableCredits > 0 && (
                    <button
                      onClick={() => setShowInvestModal(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Invest Now
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {project.impact.co2Offset.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {project.impact.co2OffsetUnit} CO₂ Offset
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(project.financials.pricePerCredit)}
              </div>
              <div className="text-sm text-gray-600">Per Credit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {project.timeline.progress}%
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <div className="text-2xl font-bold text-yellow-600">
                  {project.community.averageRating.toFixed(1)}
                </div>
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
              </div>
              <div className="text-sm text-gray-600">
                {project.community.totalReviews} reviews
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Project Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Details */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  Project Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">
                      {project.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {new Date(project.timeline.startDate).getFullYear()} -{' '}
                      {new Date(project.timeline.endDate).getFullYear()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Phase:</span>
                    <span className="font-medium">
                      {project.timeline.currentPhase}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Milestone:</span>
                    <span className="font-medium">
                      {project.timeline.nextMilestone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Impact Metrics */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  Impact Metrics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">CO₂ Offset:</span>
                    <span className="font-medium">
                      {project.impact.co2Offset.toLocaleString()}{' '}
                      {project.impact.co2OffsetUnit}
                    </span>
                  </div>
                  {project.impact.biodiversityScore && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biodiversity Score:</span>
                      <span className="font-medium">
                        {project.impact.biodiversityScore}/100
                      </span>
                    </div>
                  )}
                  {project.impact.communityImpact && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Community Impact:</span>
                      <span className="font-medium">
                        {project.impact.communityImpact} beneficiaries
                      </span>
                    </div>
                  )}
                </div>

                {project.impact.additionalBenefits.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Additional Benefits:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {project.impact.additionalBenefits.map(
                        (benefit, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {benefit}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Assessment */}
            {project.risks.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  Risk Assessment
                </h4>
                <div className="grid gap-3">
                  {project.risks.map((risk) => (
                    <div
                      key={risk.id}
                      className={`p-4 rounded-lg border-l-4 ${getRiskColor(risk)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-800 capitalize">
                          {risk.type} Risk
                        </h5>
                        <div className="flex space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              risk.likelihood === 'high'
                                ? 'bg-red-100 text-red-600'
                                : risk.likelihood === 'medium'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-green-100 text-green-600'
                            }`}
                          >
                            {risk.likelihood} likelihood
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              risk.impact === 'high'
                                ? 'bg-red-100 text-red-600'
                                : risk.impact === 'medium'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-green-100 text-green-600'
                            }`}
                          >
                            {risk.impact} impact
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {risk.description}
                      </p>
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium">Mitigation: </span>
                        {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Project Timeline
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>
                  Started:{' '}
                  {new Date(project.timeline.startDate).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>
                  Expected End:{' '}
                  {new Date(project.timeline.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{project.timeline.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${project.timeline.progress}%` }}
                />
              </div>
            </div>

            {/* Current Phase */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Current Phase</h4>
              <p className="text-blue-600">{project.timeline.currentPhase}</p>
              <div className="mt-2 text-sm text-blue-600">
                <span className="font-medium">Next Milestone: </span>
                {project.timeline.nextMilestone}
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">
                    Verification Status
                  </h4>
                  <p
                    className={`text-sm ${getStatusColor(project.verification.status).split(' ')[0]}`}
                  >
                    {project.verification.status
                      .replace('_', ' ')
                      .toUpperCase()}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  {project.verification.lastVerified && (
                    <div>
                      Last verified:{' '}
                      {new Date(
                        project.verification.lastVerified
                      ).toLocaleDateString()}
                    </div>
                  )}
                  {project.verification.nextVerification && (
                    <div>
                      Next verification:{' '}
                      {new Date(
                        project.verification.nextVerification
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Impact Tab */}
        {activeTab === 'impact' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Environmental Impact
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Globe className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800">CO₂ Impact</h4>
                    <p className="text-green-600">
                      Primary environmental benefit
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-700 mb-2">
                  {project.impact.co2Offset.toLocaleString()}
                  <span className="text-lg ml-1">
                    {project.impact.co2OffsetUnit}
                  </span>
                </div>
                <p className="text-green-600 text-sm">
                  Equivalent to removing{' '}
                  {Math.round(project.impact.co2Offset / 4.6)} cars from the
                  road for a year
                </p>
              </div>

              {project.impact.biodiversityScore && (
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <FlaskConical className="h-8 w-8 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-purple-800">
                        Biodiversity
                      </h4>
                      <p className="text-purple-600">Ecosystem health score</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-purple-700 mb-2">
                    {project.impact.biodiversityScore}
                    <span className="text-lg ml-1">/100</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${project.impact.biodiversityScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {project.impact.additionalBenefits.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  Additional Environmental Benefits
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {project.impact.additionalBenefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Measurement Data */}
            {project.documentation.measurements.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  Latest Measurements
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Measurement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {project.documentation.measurements
                        .slice(0, 5)
                        .map((measurement) => (
                          <tr key={measurement.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {measurement.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {measurement.value} {measurement.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(measurement.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {measurement.verified ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Verified
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Verification & Compliance
            </h3>

            {/* Verification Status */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(project.verification.status)}`}
                  >
                    {project.verification.status === 'verified' ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : project.verification.status === 'in_progress' ? (
                      <Clock className="h-6 w-6" />
                    ) : project.verification.status === 'rejected' ? (
                      <AlertTriangle className="h-6 w-6" />
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {project.verification.status
                        .replace('_', ' ')
                        .toUpperCase()}
                    </h4>
                    {project.verification.verifier && (
                      <p className="text-gray-600">
                        Verified by {project.verification.verifier}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right text-sm text-gray-600">
                  {project.verification.lastVerified && (
                    <div>
                      Last verified:{' '}
                      {new Date(
                        project.verification.lastVerified
                      ).toLocaleDateString()}
                    </div>
                  )}
                  {project.verification.nextVerification && (
                    <div>
                      Next verification:{' '}
                      {new Date(
                        project.verification.nextVerification
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Certifications */}
            {project.verification.certifications.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  Certifications & Standards
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {project.verification.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <Trophy className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <span className="text-blue-700 font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Reports */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">
                Verification Reports
              </h4>
              <div className="space-y-3">
                {project.documentation.reports
                  .filter((report) => report.type === 'verification')
                  .map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <h5 className="font-medium text-gray-800">
                            {report.title}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {new Date(report.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onDownloadReport?.(report.id)}
                        className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:text-blue-700"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-sm">Download</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Financials Tab */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Financial Overview
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  Total Credits
                </h4>
                <div className="text-2xl font-bold text-green-700">
                  {project.financials.totalCredits.toLocaleString()}
                </div>
                <p className="text-green-600 text-sm">
                  Total carbon credits generated
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Available Credits
                </h4>
                <div className="text-2xl font-bold text-blue-700">
                  {project.financials.availableCredits.toLocaleString()}
                </div>
                <p className="text-blue-600 text-sm">Ready for purchase</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">
                  Price per Credit
                </h4>
                <div className="text-2xl font-bold text-purple-700">
                  {formatCurrency(project.financials.pricePerCredit)}
                </div>
                <p className="text-purple-600 text-sm">Current market price</p>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-800">
                  Funding Progress
                </h4>
                <span className="text-sm text-gray-600">
                  {formatCurrency(project.financials.totalRaised)} of{' '}
                  {formatCurrency(project.financials.targetAmount)}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((project.financials.totalRaised / project.financials.targetAmount) * 100, 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {(
                    (project.financials.totalRaised /
                      project.financials.targetAmount) *
                    100
                  ).toFixed(1)}
                  % funded
                </span>
                <span>{project.community.backers} backers</span>
              </div>
            </div>

            {/* Investment Opportunity */}
            {userRole === 'buyer' &&
              project.financials.availableCredits > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Investment Opportunity
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Investment Amount ({project.financials.currency})
                      </label>
                      <input
                        type="number"
                        value={investmentAmount}
                        onChange={(e) =>
                          setInvestmentAmount(Number(e.target.value))
                        }
                        min="1"
                        max={
                          project.financials.availableCredits *
                          project.financials.pricePerCredit
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credits to Purchase
                      </label>
                      <input
                        type="number"
                        value={creditsToInvest}
                        onChange={(e) => {
                          const credits = Number(e.target.value);
                          setCreditsToInvest(credits);
                          setInvestmentAmount(
                            credits * project.financials.pricePerCredit
                          );
                        }}
                        min="1"
                        max={project.financials.availableCredits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>CO₂ Offset:</span>
                      <span className="font-medium">
                        {(
                          creditsToInvest *
                          (project.impact.co2Offset /
                            project.financials.totalCredits)
                        ).toFixed(2)}{' '}
                        {project.impact.co2OffsetUnit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Cost:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          creditsToInvest * project.financials.pricePerCredit
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onInvest?.(investmentAmount, creditsToInvest)
                    }
                    className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Invest{' '}
                    {formatCurrency(
                      creditsToInvest * project.financials.pricePerCredit
                    )}
                  </button>
                </div>
              )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Project Documentation
            </h3>

            {/* Photo Gallery */}
            {project.documentation.photos.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  Photo Gallery
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {project.documentation.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo}
                        alt={`Project photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">
                Reports & Documents
              </h4>
              <div className="space-y-3">
                {project.documentation.reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <h5 className="font-medium text-gray-800">
                          {report.title}
                        </h5>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              report.type === 'verification'
                                ? 'bg-green-100 text-green-700'
                                : report.type === 'progress'
                                  ? 'bg-blue-100 text-blue-700'
                                  : report.type === 'impact'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {report.type}
                          </span>
                          <span>
                            {new Date(report.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDownloadReport?.(report.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Community & Rating */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Community & Reviews
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Community Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Followers:</span>
                <span className="font-medium">
                  {project.community.followers.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Backers:</span>
                <span className="font-medium">
                  {project.community.backers.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updates:</span>
                <span className="font-medium">{project.community.updates}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Rating:</span>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">
                    {project.community.averageRating.toFixed(1)}
                  </span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-500">
                    ({project.community.totalReviews})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {userRole !== 'visitor' && (
            <div>
              <h4 className="font-medium text-gray-800 mb-3">
                Rate this Project
              </h4>
              <div className="flex items-center space-x-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setUserRating(star);
                      onRate?.(projectId, star);
                    }}
                    className="transition-colors"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= userRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Click to rate this project
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhoto}
              alt="Project photo"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
