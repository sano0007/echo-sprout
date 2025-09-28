'use client';

import { api } from '@packages/backend';
import type { Id } from '@packages/backend/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ChecklistSection {
  carbonReductionValidated?: boolean;
  methodologyVerified?: boolean;
  calculationsAccurate?: boolean;
  timelineAssessed?: boolean;
  budgetAnalyzed?: boolean;
  technicalApproachValid?: boolean;
  resourcesAvailable?: boolean;
  completenessCheck?: boolean;
  accuracyVerified?: boolean;
  complianceValidated?: boolean;
  formatStandards?: boolean;
  geographicDataConfirmed?: boolean;
  landRightsVerified?: boolean;
  accessibilityAssessed?: boolean;
  environmentalSuitability?: boolean;
  longTermViabilityAnalyzed?: boolean;
  maintenancePlanReviewed?: boolean;
  stakeholderEngagement?: boolean;
  adaptabilityAssessed?: boolean;
  score?: number;
  notes?: string;
}

interface VerificationData {
  _id: Id<'verifications'>;
  environmentalImpact?: ChecklistSection;
  projectFeasibility?: ChecklistSection;
  documentationQuality?: ChecklistSection;
  locationVerification?: ChecklistSection;
  sustainability?: ChecklistSection;
  overallScore?: number;
}

interface EnhancedChecklistProps {
  verification: VerificationData;
  isEditable: boolean;
}

export default function EnhancedChecklist({
  verification,
  isEditable,
}: EnhancedChecklistProps) {
  const updateChecklist = useMutation(
    api.verifications.updateEnhancedChecklist
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSectionUpdate = async (
    sectionName:
      | 'environmentalImpact'
      | 'projectFeasibility'
      | 'documentationQuality'
      | 'locationVerification'
      | 'sustainability',
    updates: Partial<ChecklistSection>
  ) => {
    if (!isEditable) return;

    setIsUpdating(true);
    try {
      await updateChecklist({
        verificationId: verification._id,
        updates: {
          [sectionName]: {
            ...verification[sectionName],
            ...updates,
          },
        },
      });
      toast.success(
        `${sectionName.replace(/([A-Z])/g, ' $1').toLowerCase()} updated successfully`
      );
    } catch (error) {
      toast.error('Failed to update checklist');
    } finally {
      setIsUpdating(false);
    }
  };

  const sections = [
    {
      key: 'environmentalImpact' as const,
      title: 'Environmental Impact Assessment',
      icon: '🌱',
      description: 'Carbon reduction validation and methodology verification',
      items: [
        {
          key: 'carbonReductionValidated',
          label: 'Carbon reduction calculations validated',
        },
        {
          key: 'methodologyVerified',
          label: 'Calculation methodology verified',
        },
        { key: 'calculationsAccurate', label: 'All calculations are accurate' },
      ],
    },
    {
      key: 'projectFeasibility' as const,
      title: 'Project Feasibility',
      icon: '📊',
      description: 'Timeline, budget, and technical approach evaluation',
      items: [
        {
          key: 'timelineAssessed',
          label: 'Project timeline assessed and realistic',
        },
        {
          key: 'budgetAnalyzed',
          label: 'Budget breakdown analyzed and validated',
        },
        {
          key: 'technicalApproachValid',
          label: 'Technical approach is valid and proven',
        },
        {
          key: 'resourcesAvailable',
          label: 'Required resources are available',
        },
      ],
    },
    {
      key: 'documentationQuality' as const,
      title: 'Documentation Quality',
      icon: '📋',
      description: 'Completeness, accuracy, and compliance validation',
      items: [
        {
          key: 'completenessCheck',
          label: 'All required documentation provided',
        },
        { key: 'accuracyVerified', label: 'Documentation accuracy verified' },
        {
          key: 'complianceValidated',
          label: 'Regulatory compliance validated',
        },
        {
          key: 'formatStandards',
          label: 'Documentation meets format standards',
        },
      ],
    },
    {
      key: 'locationVerification' as const,
      title: 'Location Verification',
      icon: '📍',
      description: 'Geographic data and land rights confirmation',
      items: [
        {
          key: 'geographicDataConfirmed',
          label: 'Geographic coordinates confirmed',
        },
        {
          key: 'landRightsVerified',
          label: 'Land rights and ownership verified',
        },
        { key: 'accessibilityAssessed', label: 'Site accessibility assessed' },
        {
          key: 'environmentalSuitability',
          label: 'Environmental suitability confirmed',
        },
      ],
    },
    {
      key: 'sustainability' as const,
      title: 'Sustainability Assessment',
      icon: '♻️',
      description: 'Long-term viability and maintenance planning',
      items: [
        {
          key: 'longTermViabilityAnalyzed',
          label: 'Long-term viability analyzed',
        },
        { key: 'maintenancePlanReviewed', label: 'Maintenance plan reviewed' },
        {
          key: 'stakeholderEngagement',
          label: 'Stakeholder engagement assessed',
        },
        { key: 'adaptabilityAssessed', label: 'Climate adaptability assessed' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overall Score Display */}
      {verification.overallScore !== undefined && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Overall Quality Score
              </h3>
              <p className="text-sm text-gray-600">
                Calculated from all assessment categories
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">
                {verification.overallScore}/100
              </div>
              <div className="text-sm text-gray-500">
                {verification.overallScore >= 90
                  ? 'Excellent'
                  : verification.overallScore >= 80
                    ? 'Very Good'
                    : verification.overallScore >= 70
                      ? 'Good'
                      : verification.overallScore >= 60
                        ? 'Satisfactory'
                        : 'Needs Improvement'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Sections */}
      {sections.map((section) => {
        const sectionData = verification[section.key] || {};
        const completedItems = section.items.filter(
          (item) => sectionData[item.key as keyof ChecklistSection]
        ).length;
        const completionPercentage = Math.round(
          (completedItems / section.items.length) * 100
        );

        return (
          <ChecklistSection
            key={section.key}
            section={section}
            sectionData={sectionData}
            completionPercentage={completionPercentage}
            isEditable={isEditable}
            isUpdating={isUpdating}
            onUpdate={(updates) => handleSectionUpdate(section.key, updates)}
          />
        );
      })}
    </div>
  );
}

interface ChecklistSectionProps {
  section: {
    key: string;
    title: string;
    icon: string;
    description: string;
    items: { key: string; label: string }[];
  };
  sectionData: ChecklistSection;
  completionPercentage: number;
  isEditable: boolean;
  isUpdating: boolean;
  onUpdate: (updates: Partial<ChecklistSection>) => void;
}

function ChecklistSection({
  section,
  sectionData,
  completionPercentage,
  isEditable,
  isUpdating,
  onUpdate,
}: ChecklistSectionProps) {
  const [localScore, setLocalScore] = useState(sectionData.score || 0);
  const [localNotes, setLocalNotes] = useState(sectionData.notes || '');

  const handleItemToggle = (itemKey: string, value: boolean) => {
    onUpdate({ [itemKey]: value });
  };

  const handleScoreUpdate = () => {
    if (localScore !== sectionData.score) {
      onUpdate({ score: localScore });
    }
  };

  const handleNotesUpdate = () => {
    if (localNotes !== sectionData.notes) {
      onUpdate({ notes: localNotes });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{section.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h3>
              <p className="text-sm text-gray-600">{section.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Completion Progress */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {completionPercentage}% Complete
              </div>
              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            {/* Score */}
            {sectionData.score !== undefined && (
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(sectionData.score)}`}
              >
                {sectionData.score}/100
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6">
        {/* Checklist Items */}
        <div className="space-y-3 mb-6">
          {section.items.map((item) => {
            const isChecked = sectionData[
              item.key as keyof ChecklistSection
            ] as boolean;
            return (
              <div key={item.key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`${section.key}-${item.key}`}
                  checked={isChecked || false}
                  onChange={(e) => handleItemToggle(item.key, e.target.checked)}
                  disabled={!isEditable || isUpdating}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label
                  htmlFor={`${section.key}-${item.key}`}
                  className={`text-sm ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-600'} ${
                    !isEditable ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  {item.label}
                </label>
                {isChecked && <span className="text-green-500 text-sm">✓</span>}
              </div>
            );
          })}
        </div>

        {/* Score Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Score (0-100)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="0"
                max="100"
                value={localScore}
                onChange={(e) => setLocalScore(Number(e.target.value))}
                onBlur={handleScoreUpdate}
                disabled={!isEditable || isUpdating}
                className="block w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 bg-white text-gray-900"
              />
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      localScore >= 90
                        ? 'bg-green-500'
                        : localScore >= 80
                          ? 'bg-blue-500'
                          : localScore >= 70
                            ? 'bg-yellow-500'
                            : localScore >= 60
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                    }`}
                    style={{ width: `${localScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assessment Notes
          </label>
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={handleNotesUpdate}
            disabled={!isEditable || isUpdating}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 bg-white text-gray-900"
            placeholder="Add notes about this assessment category..."
          />
        </div>
      </div>
    </div>
  );
}
