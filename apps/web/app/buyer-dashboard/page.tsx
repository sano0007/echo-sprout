'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@packages/backend/convex/_generated/api';


import ProjectTracking from '../../components/buyer/ProjectTracking';

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useUser();

  // Fetch real data from the database
  const purchaseData = useQuery(
    api.buyer_dashboard.getBuyerPurchaseHistory,
    user?.id ? { buyerClerkId: user.id } : 'skip'
  );

  const certificates = useQuery(
    api.buyer_dashboard.getBuyerCertificates,
    user?.id ? { buyerClerkId: user.id } : 'skip'
  );

  const dashboardSummary = useQuery(
    api.buyer_dashboard.getBuyerDashboardSummary,
    user?.id ? { buyerClerkId: user.id } : 'skip'
  );

  // Use real data or show loading
  const purchaseHistory = purchaseData?.purchases || [];
  const totalImpact = purchaseData?.totalImpact || {
    totalCredits: 0,
    totalSpent: 0,
    totalCO2Offset: 0,
    equivalentTrees: 0,
    equivalentCarsOff: 0,
  };

  // Show loading state
  if (purchaseData === undefined || certificates === undefined || dashboardSummary === undefined) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold mb-8">Buyer Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Show empty state if no user
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to sign in to view your buyer dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Buyer Dashboard</h1>

      {/* Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-green-600">
            {totalImpact.totalCredits}
          </p>
          <p className="text-sm text-gray-600">Credits Purchased</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-blue-600">
            Rs. {totalImpact.totalSpent.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Total Invested</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-purple-600">
            {totalImpact.totalCO2Offset}
          </p>
          <p className="text-sm text-gray-600">Tons CO₂ Offset</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-orange-600">
            {totalImpact.equivalentTrees}
          </p>
          <p className="text-sm text-gray-600">Trees Equivalent</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-red-600">
            {totalImpact.equivalentCarsOff}
          </p>
          <p className="text-sm text-gray-600">Cars Off Road/Year</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Impact Overview
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'purchases' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Purchase History
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'certificates' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Certificates
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'tracking' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Project Tracking
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Impact Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Environmental Impact Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Monthly CO₂ Offset Progress
                  </h3>
                  <div className="h-64 flex items-center justify-center bg-white rounded">
                    <p className="text-gray-500">
                      Chart showing monthly CO₂ offset progress
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Project Type Distribution
                  </h3>
                  <div className="h-64 flex items-center justify-center bg-white rounded">
                    <p className="text-gray-500">
                      Pie chart showing project type distribution
                    </p>
                  </div>
                </div>
              </div>

              {/* Environmental Equivalents */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Environmental Impact Equivalents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">🌳</p>
                    <p className="text-lg font-semibold">
                      {totalImpact.equivalentTrees}
                    </p>
                    <p className="text-sm text-gray-600">
                      Trees planted equivalent
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">🚗</p>
                    <p className="text-lg font-semibold">
                      {totalImpact.equivalentCarsOff}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cars off road for a year
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-600">⚡</p>
                    <p className="text-lg font-semibold">45,000</p>
                    <p className="text-sm text-gray-600">
                      kWh clean energy supported
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Purchase History Tab */}
          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Purchase History</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  Export History
                </button>
              </div>

              <div className="space-y-4">
                {purchaseHistory.map((purchase) => (
                  <div key={purchase.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold">
                          {purchase.project}
                        </h4>
                        <p className="text-gray-600">
                          Certificate ID: {purchase.certificateId}
                        </p>
                        <p className="text-sm text-gray-600">
                          Purchased on{' '}
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded text-sm ${
                            purchase.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {purchase.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Credits Purchased
                        </p>
                        <p className="text-lg font-semibold">
                          {purchase.credits}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Price per Credit
                        </p>
                        <p className="text-lg font-semibold">
                          Rs. {purchase.price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="text-lg font-semibold">
                          Rs. {(purchase.credits * purchase.price).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">CO₂ Offset</p>
                        <p className="text-lg font-semibold">
                          {purchase.impact.co2Offset} tons
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                        View Certificate
                      </button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded text-sm">
                        Track Project
                      </button>
                      <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Digital Certificates</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  Download All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchaseHistory.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border"
                  >
                    <div className="text-center mb-4">
                      <h4 className="font-semibold text-lg">
                        Carbon Credit Certificate
                      </h4>
                      <p className="text-sm text-gray-600">
                        Certificate ID: {purchase.certificateId}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p>
                        <span className="font-medium">Project:</span>{' '}
                        {purchase.project}
                      </p>
                      <p>
                        <span className="font-medium">Credits:</span>{' '}
                        {purchase.credits}
                      </p>
                      <p>
                        <span className="font-medium">Issue Date:</span>{' '}
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">CO₂ Offset:</span>{' '}
                        {purchase.impact.co2Offset} tons
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm">
                        View Full
                      </button>
                      <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Tracking Tab */}
          {activeTab === 'tracking' && (
            <ProjectTracking className="space-y-6" />
          )}
        </div>
      </div>
    </div>
  );
}
