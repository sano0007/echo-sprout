'use client';

import { useState } from 'react';

const steps = [
  'Basic Information',
  'Project Timeline',
  'Location & Details',
  'Document Upload',
  'Review & Submit',
];

export default function ProjectRegister() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Register Your Project</h1>

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
              <input
                type="text"
                placeholder="Project Name"
                className="w-full p-3 border rounded"
              />
              <select className="w-full p-3 border rounded">
                <option>Select Project Type</option>
                <option>Reforestation</option>
                <option>Solar Energy</option>
                <option>Wind Energy</option>
                <option>Biogas</option>
                <option>Waste Management</option>
                <option>Custom</option>
              </select>
              <textarea
                placeholder="Project Description"
                className="w-full p-3 border rounded h-32"
              ></textarea>
              <input
                type="number"
                placeholder="Expected Carbon Credits"
                className="w-full p-3 border rounded"
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Project Timeline</h2>
            <div className="space-y-4">
              <input type="date" className="w-full p-3 border rounded" />
              <input type="date" className="w-full p-3 border rounded" />
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
              <input
                type="text"
                placeholder="Project Address"
                className="w-full p-3 border rounded"
              />
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
              <input
                type="number"
                placeholder="Area Size (hectares)"
                className="w-full p-3 border rounded"
              />
              <textarea
                placeholder="Environmental Impact Details"
                className="w-full p-3 border rounded h-32"
              ></textarea>
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
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={
            currentStep === steps.length - 1
              ? () => alert('Project submitted!')
              : nextStep
          }
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
}
