'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { Id } from '@packages/backend/convex/_generated/dataModel';

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id as Id<'projects'>;
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [creditQuantity, setCreditQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const project = useQuery(api.marketplace.getProjectById, {
    projectId,
  });

  const handlePurchase = async () => {
    if (!project || creditQuantity <= 0) return;

    setIsProcessing(true);
    try {
      const totalAmount = project.pricePerCredit * creditQuantity;

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          credits: creditQuantity,
          projectId: project._id,
          projectName: project.title,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-600">Loading project...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="w-full h-96 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <p className="text-gray-500">Project Image</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((img, index) => (
                <div
                  key={index}
                  className="h-24 bg-gray-200 rounded flex items-center justify-center"
                >
                  <p className="text-xs text-gray-500">Image {index + 2}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                <p className="text-gray-600 mb-2">{project.location.name}</p>
                <div className="flex items-center mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded mr-3">
                    {project.projectType}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                    {project.status}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{project.description}</p>

            {/* Impact Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded">
                <p className="text-2xl font-bold text-green-600">
                  {project.estimatedCO2Reduction.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Estimated CO₂ Reduction (tons)
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded">
                <p className="text-2xl font-bold text-blue-600">
                  {project.areaSize.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Area Size (hectares)</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded">
                <p className="text-2xl font-bold text-purple-600">
                  ${project.budget.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Project Budget</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Project Timeline</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p>
                  <strong>Start Date:</strong>{' '}
                  {new Date(project.startDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Expected Completion:</strong>{' '}
                  {new Date(
                    project.expectedCompletionDate
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className="capitalize">
                    {project.status.replace('_', ' ')}
                  </span>
                </p>
                <p>
                  <strong>Verification Status:</strong>{' '}
                  <span className="capitalize">
                    {project.verificationStatus.replace('_', ' ')}
                  </span>
                </p>
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Credit Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-medium">Total Credits</p>
                  <p className="text-2xl font-bold text-green-600">
                    {project.totalCarbonCredits.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-medium">Credits Sold</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {project.creditsSold.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Purchase Card */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 sticky top-6">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-green-600">
                ${project.pricePerCredit}
              </p>
              <p className="text-gray-600">per credit</p>
            </div>

            <div className="mb-4">
              <p className="text-lg font-semibold mb-2">
                {project.creditsAvailable.toLocaleString()} credits available
              </p>
              <p className="text-sm text-gray-600">
                of {project.totalCarbonCredits.toLocaleString()} total credits
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${(project.creditsAvailable / project.totalCarbonCredits) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => setShowPurchaseModal(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded mb-3 hover:bg-blue-700 disabled:opacity-50"
              disabled={project.creditsAvailable === 0}
            >
              {project.creditsAvailable === 0 ? 'Sold Out' : 'Contribute'}
            </button>

            {/* Creator Info */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-2">Project Creator</h4>
              <div className="flex items-center mb-2">
                <span className="font-medium">{project.creator.name}</span>
                {project.creator.verified && (
                  <span className="ml-2 text-green-600 text-sm">
                    ✓ Verified
                  </span>
                )}
              </div>
              <button className="text-blue-600 hover:underline">
                Contact Creator
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Contribute to Project</h2>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                disabled={isProcessing}
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">Project</p>
                <p className="text-lg font-semibold">{project.title}</p>
                <p className="text-sm text-gray-600">
                  Price per credit: ${project.pricePerCredit}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Credits
                  </label>
                  <input
                    type="number"
                    value={creditQuantity}
                    onChange={(e) =>
                      setCreditQuantity(
                        Math.max(
                          1,
                          Math.min(
                            project.creditsAvailable,
                            parseInt(e.target.value) || 1
                          )
                        )
                      )
                    }
                    min="1"
                    max={project.creditsAvailable}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={isProcessing}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Available: {project.creditsAvailable.toLocaleString()}{' '}
                    credits
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${(project.pricePerCredit * creditQuantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">
                    Credits to purchase:
                  </span>
                  <span className="text-sm font-medium">
                    {creditQuantity.toLocaleString()} credits
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={
                  isProcessing ||
                  creditQuantity <= 0 ||
                  creditQuantity > project.creditsAvailable
                }
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
