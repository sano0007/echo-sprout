'use client';

import { CloudUpload, MapPin, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface ProgressSubmissionFormProps {
  projectId: string;
  projectType: string;
  onSubmit: (data: ProgressUpdateData) => void;
  onCancel?: () => void;
  existingUpdate?: any; // For resubmitting after revision request
}

interface ProgressUpdateData {
  title: string;
  description: string;
  progressPercentage: number;
  updateType: 'milestone' | 'measurement' | 'photo' | 'issue' | 'completion';
  measurementData: {
    carbonImpactToDate?: number;
    treesPlanted?: number;
    energyGenerated?: number;
    wasteProcessed?: number;
  };
  photos: File[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  nextSteps?: string;
  challenges?: string;
}

export default function ProgressSubmissionForm({
  projectId,
  projectType,
  onSubmit,
  onCancel,
  existingUpdate,
}: ProgressSubmissionFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProgressUpdateData>({
    title: existingUpdate?.title || '',
    description: existingUpdate?.description || '',
    progressPercentage: existingUpdate?.progressPercentage || 0,
    updateType: existingUpdate?.updateType || 'measurement',
    measurementData: existingUpdate?.measurementData || {},
    photos: [],
    nextSteps: existingUpdate?.nextSteps || '',
    challenges: existingUpdate?.challenges || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>(
    existingUpdate?.photoUrls || []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateTypeOptions = [
    { value: 'measurement', label: 'Environmental Measurement', icon: '📊' },
    { value: 'milestone', label: 'Milestone Achievement', icon: '🎯' },
    { value: 'photo', label: 'Photo Documentation', icon: '📸' },
    { value: 'issue', label: 'Issue Report', icon: '⚠️' },
    { value: 'completion', label: 'Project Completion', icon: '✅' },
  ];

  const measurementFields = {
    reforestation: [
      { key: 'treesPlanted', label: 'Trees Planted', unit: 'trees' },
      { key: 'carbonImpactToDate', label: 'CO2 Sequestered', unit: 'tons CO2' },
    ],
    solar: [
      { key: 'energyGenerated', label: 'Energy Generated', unit: 'kWh' },
      { key: 'carbonImpactToDate', label: 'CO2 Avoided', unit: 'tons CO2' },
    ],
    wind: [
      { key: 'energyGenerated', label: 'Energy Generated', unit: 'kWh' },
      { key: 'carbonImpactToDate', label: 'CO2 Avoided', unit: 'tons CO2' },
    ],
    waste_management: [
      { key: 'wasteProcessed', label: 'Waste Processed', unit: 'tons' },
      { key: 'carbonImpactToDate', label: 'CO2 Impact', unit: 'tons CO2' },
    ],
    biogas: [
      { key: 'energyGenerated', label: 'Gas Generated', unit: 'cubic meters' },
      { key: 'carbonImpactToDate', label: 'CO2 Impact', unit: 'tons CO2' },
    ],
    mangrove_restoration: [
      { key: 'treesPlanted', label: 'Mangroves Planted', unit: 'plants' },
      { key: 'carbonImpactToDate', label: 'CO2 Sequestered', unit: 'tons CO2' },
    ],
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMeasurementChange = (field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      measurementData: {
        ...prev.measurementData,
        [field]: value,
      },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = [...formData.photos, ...files];
    setFormData((prev) => ({ ...prev, photos: newPhotos }));

    // Create preview URLs (for both images and PDFs)
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewPhotos((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    const newPreviews = previewPhotos.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, photos: newPhotos }));
    setPreviewPhotos(newPreviews);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current Location',
          },
        }));
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting progress update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.updateType;
      case 2:
        return formData.progressPercentage >= 0;
      case 3:
        return true; // Photos are optional
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const stepTitles = [
    'Basic Information',
    'Progress & Measurements',
    'Documentation',
    'Review & Submit',
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <h2 className="text-2xl font-bold">
          {existingUpdate
            ? 'Resubmit Progress Update'
            : 'Submit Progress Update'}
        </h2>
        <p className="text-blue-100 mt-1">Project ID: {projectId}</p>
      </div>

      {/* Revision Notes Banner */}
      {existingUpdate?.status === 'needs_revision' &&
        existingUpdate?.reviewNotes && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mx-6 mt-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-orange-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-orange-800">
                  Revision Required
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>
                    <strong>Verifier's Notes:</strong>{' '}
                    {existingUpdate.reviewNotes}
                  </p>
                  <p className="mt-2">
                    Please address the feedback above and resubmit your progress
                    update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Progress Steps */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex items-center space-x-4">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index + 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : index + 1 === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`ml-2 text-sm ${
                  index + 1 === currentStep
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600'
                }`}
              >
                {title}
              </span>
              {index < stepTitles.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Monthly Progress Report - January 2024"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {updateTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleInputChange('updateType', option.value)
                    }
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.updateType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="Describe the progress made, activities completed, and any important updates..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 2: Progress & Measurements */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Progress Percentage
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progressPercentage}
                  onChange={(e) =>
                    handleInputChange(
                      'progressPercentage',
                      parseInt(e.target.value)
                    )
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-lg font-semibold text-blue-600 w-12">
                  {formData.progressPercentage}%
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${formData.progressPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Environmental Measurements
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  measurementFields[
                    projectType as keyof typeof measurementFields
                  ] || []
                ).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {field.label} ({field.unit})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={
                        formData.measurementData[
                          field.key as keyof typeof formData.measurementData
                        ] || ''
                      }
                      onChange={(e) =>
                        handleMeasurementChange(
                          field.key,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Steps
                </label>
                <textarea
                  value={formData.nextSteps}
                  onChange={(e) =>
                    handleInputChange('nextSteps', e.target.value)
                  }
                  placeholder="Outline planned activities for the next reporting period..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenges & Issues
                </label>
                <textarea
                  value={formData.challenges}
                  onChange={(e) =>
                    handleInputChange('challenges', e.target.value)
                  }
                  placeholder="Describe any challenges encountered or issues that need attention..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documentation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Photo Documentation
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  Upload Documentation
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop or click to select files (Images: JPG, PNG |
                  Documents: PDF, max 10MB each)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {previewPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {previewPhotos.map((preview, index) => {
                    const file = formData.photos[index];
                    const isPDF = file?.type === 'application/pdf';

                    return (
                      <div key={index} className="relative group w-full h-32">
                        {isPDF ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-300">
                            <div className="text-center">
                              <svg
                                className="w-12 h-12 mx-auto text-red-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <p className="text-xs mt-1 text-gray-600 truncate px-2">
                                {file?.name}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover rounded-lg"
                          />
                        )}
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Data
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <MapPin className="h-5 w-5" />
                  <span>Use Current Location</span>
                </button>
                {formData.location && (
                  <div className="text-sm text-gray-600">
                    📍 Location captured (
                    {formData.location.latitude.toFixed(4)},{' '}
                    {formData.location.longitude.toFixed(4)})
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Review Your Submission
            </h3>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Title
                  </label>
                  <p className="text-gray-800">{formData.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Update Type
                  </label>
                  <p className="text-gray-800 capitalize">
                    {formData.updateType.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Progress
                  </label>
                  <p className="text-gray-800">
                    {formData.progressPercentage}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Photos
                  </label>
                  <p className="text-gray-800">
                    {formData.photos.length} photo(s)
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Description
                </label>
                <p className="text-gray-800 mt-1">{formData.description}</p>
              </div>

              {Object.keys(formData.measurementData).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Measurements
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {Object.entries(formData.measurementData).map(
                      ([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}:{' '}
                          </span>
                          <span className="text-gray-800">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Previous
            </button>
          )}
        </div>

        <div className="flex space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isStepValid(currentStep)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Update'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
