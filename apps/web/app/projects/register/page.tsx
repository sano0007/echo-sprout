'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../packages/backend/convex/_generated/api';

interface ProjectFormData {
  title: string;
  description: string;
  projectType:
    | 'reforestation'
    | 'solar'
    | 'wind'
    | 'biogas'
    | 'waste_management'
    | 'mangrove_restoration';
  location: {
    lat: number;
    long: number;
    name: string;
  };
  areaSize: number;
  estimatedCO2Reduction: number;
  budget: number;
  startDate: string;
  expectedCompletionDate: string;
  totalCarbonCredits: number;
  pricePerCredit: number;
  requiredDocuments: string[];
}

const steps = [
  'Basic Information',
  'Project Timeline',
  'Location & Details',
  'Document Upload',
  'Review & Submit',
];

export default function ProjectRegister() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    projectType: 'reforestation',
    location: {
      lat: 0,
      long: 0,
      name: '',
    },
    areaSize: 0,
    estimatedCO2Reduction: 0,
    budget: 0,
    startDate: '',
    expectedCompletionDate: '',
    totalCarbonCredits: 0,
    pricePerCredit: 0,
    requiredDocuments: [
      'project_plan',
      'environmental_assessment',
      'permits',
      'photos',
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProject = useMutation(api.projects.createProject);

  const handleInputChange = (
    field: string,
    value: string | number | { lat: number; long: number; name: string }
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.title.trim())
          newErrors.title = 'Project title is required';
        if (!formData.projectType)
          newErrors.projectType = 'Project type is required';
        if (!formData.description.trim())
          newErrors.description = 'Description is required';
        if (formData.totalCarbonCredits <= 0)
          newErrors.totalCarbonCredits =
            'Carbon credits must be greater than 0';
        break;
      case 1: // Project Timeline
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.expectedCompletionDate)
          newErrors.expectedCompletionDate = 'Completion date is required';
        if (
          new Date(formData.startDate) >=
          new Date(formData.expectedCompletionDate)
        ) {
          newErrors.expectedCompletionDate =
            'Completion date must be after start date';
        }
        break;
      case 2: // Location & Details
        if (!formData.location.name.trim())
          newErrors.location = 'Location is required';
        if (formData.areaSize <= 0)
          newErrors.areaSize = 'Area size must be greater than 0';
        if (formData.estimatedCO2Reduction <= 0)
          newErrors.estimatedCO2Reduction =
            'CO2 reduction must be greater than 0';
        if (formData.budget <= 0)
          newErrors.budget = 'Budget must be greater than 0';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      // Submit project directly with user-provided location name
      await submitProject(formData);
    } catch (error) {
      console.error('Error submitting project:', error);
      setErrors({ submit: 'Failed to submit project. Please try again.' });
    }
  };

  const submitProject = async (data: ProjectFormData) => {
    try {
      await createProject({
        title: data.title,
        description: data.description,
        projectType: data.projectType,
        location: data.location,
        areaSize: data.areaSize,
        estimatedCO2Reduction: data.estimatedCO2Reduction,
        budget: data.budget,
        startDate: data.startDate,
        expectedCompletionDate: data.expectedCompletionDate,
        totalCarbonCredits: data.totalCarbonCredits,
        pricePerCredit: data.pricePerCredit,
        requiredDocuments: data.requiredDocuments,
      });

      alert('Project submitted successfully!');
      // Reset form or redirect to project management
      window.location.href = '/projects/manage';
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ submit: 'Failed to create project. Please try again.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Register Your Project</h1>

      {/* Debug Info - Hidden */}
      <div className="hidden">
        Debug: Current Step: {currentStep}, Form Data:{' '}
        {JSON.stringify(formData, null, 2)}
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex-1 text-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 mx-auto rounded-full border-2 ${index <= currentStep ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'} flex items-center justify-center mb-2`}
            >
              {index + 1}
            </div>
            <span className="text-sm">{step}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white p-6 rounded-lg shadow-md min-h-96">
        {currentStep === 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full p-3 border rounded ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>
              <div>
                <select
                  value={formData.projectType}
                  onChange={(e) =>
                    handleInputChange('projectType', e.target.value)
                  }
                  className={`w-full p-3 border rounded ${errors.projectType ? 'border-red-500' : ''}`}
                >
                  <option value="reforestation">Reforestation</option>
                  <option value="solar">Solar Energy</option>
                  <option value="wind">Wind Energy</option>
                  <option value="biogas">Biogas</option>
                  <option value="waste_management">Waste Management</option>
                  <option value="mangrove_restoration">
                    Mangrove Restoration
                  </option>
                </select>
                {errors.projectType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.projectType}
                  </p>
                )}
              </div>
              <div>
                <textarea
                  placeholder="Project Description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  className={`w-full p-3 border rounded h-32 ${errors.description ? 'border-red-500' : ''}`}
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Expected Carbon Credits"
                  value={formData.totalCarbonCredits || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'totalCarbonCredits',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className={`w-full p-3 border rounded ${errors.totalCarbonCredits ? 'border-red-500' : ''}`}
                />
                {errors.totalCarbonCredits && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.totalCarbonCredits}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Project Timeline</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange('startDate', e.target.value)
                  }
                  className={`w-full p-3 border rounded ${errors.startDate ? 'border-red-500' : ''}`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Expected Completion Date
                </label>
                <input
                  type="date"
                  value={formData.expectedCompletionDate}
                  onChange={(e) =>
                    handleInputChange('expectedCompletionDate', e.target.value)
                  }
                  className={`w-full p-3 border rounded ${errors.expectedCompletionDate ? 'border-red-500' : ''}`}
                />
                {errors.expectedCompletionDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.expectedCompletionDate}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Key Milestone 1"
                  className="p-3 border rounded"
                />
                <input type="date" className="p-3 border rounded" />
                <input
                  type="text"
                  placeholder="Key Milestone 2"
                  className="p-3 border rounded"
                />
                <input type="date" className="p-3 border rounded" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Location & Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Location
                </label>
                <input
                  type="text"
                  placeholder="Project Address"
                  value={formData.location.name}
                  onChange={(e) =>
                    handleInputChange('location', {
                      ...formData.location,
                      name: e.target.value,
                    })
                  }
                  className={`w-full p-3 border rounded ${errors.location ? 'border-red-500' : ''}`}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  className="p-3 border rounded"
                />
                <input
                  type="text"
                  placeholder="Country"
                  className="p-3 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Area Size (hectares)
                </label>
                <input
                  type="number"
                  placeholder="Area Size (hectares)"
                  value={formData.areaSize || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'areaSize',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className={`w-full p-3 border rounded ${errors.areaSize ? 'border-red-500' : ''}`}
                />
                {errors.areaSize && (
                  <p className="text-red-500 text-sm mt-1">{errors.areaSize}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimated CO2 Reduction (tons/year)
                </label>
                <input
                  type="number"
                  placeholder="Estimated CO2 Reduction"
                  value={formData.estimatedCO2Reduction || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'estimatedCO2Reduction',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className={`w-full p-3 border rounded ${errors.estimatedCO2Reduction ? 'border-red-500' : ''}`}
                />
                {errors.estimatedCO2Reduction && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.estimatedCO2Reduction}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Budget ($)
                </label>
                <input
                  type="number"
                  placeholder="Project Budget"
                  value={formData.budget || ''}
                  onChange={(e) =>
                    handleInputChange('budget', parseFloat(e.target.value) || 0)
                  }
                  className={`w-full p-3 border rounded ${errors.budget ? 'border-red-500' : ''}`}
                />
                {errors.budget && (
                  <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Document Upload</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 p-8 text-center">
                <p>Drag and drop files here or click to browse</p>
                <p className="text-sm text-gray-600">
                  Supported formats: PDF, JPG, PNG, DOC (Max 50MB)
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Required documents:</p>
                <ul className="list-disc ml-4">
                  <li>Project proposal document</li>
                  <li>Environmental impact assessment</li>
                  <li>Site photographs</li>
                  <li>Legal permits and certifications</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Review & Submit</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold">Project Summary</h3>
                <p>Project Name: Sample Reforestation Project</p>
                <p>Type: Reforestation</p>
                <p>Location: Sample City, Sample Country</p>
                <p>Expected Credits: 1000</p>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <label>I agree to the terms and conditions</label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
          disabled={currentStep === 0}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
}
