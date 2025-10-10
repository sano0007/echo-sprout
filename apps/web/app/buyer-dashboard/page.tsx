'use client';

import { useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import { api } from '@packages/backend';
import { useQuery } from 'convex/react';
import { useState } from 'react';

import { useCertificate } from '@/hooks/useCertificate';

import ProjectTracking from '../../components/buyer/ProjectTracking';
import MonthlyProgressChart from '../../components/charts/MonthlyProgressChart';
import ProjectTypeChart, {
  ProjectTypeSummary,
} from '../../components/charts/ProjectTypeChart';

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const { user, isSignedIn, isLoaded } = useUser();
  const {
    downloadCertificateDirectly,
    downloadFromStorage,
    viewCertificateInBrowserDirectly,
    viewCertificateFromStorage,
    isDownloading,
    isViewing,
  } = useCertificate();

  // Fetch dashboard metrics using Convex
  const dashboardMetrics = useQuery(
    api.transactions.getBuyerDashboardMetrics,
    isSignedIn && user ? { userId: user.id } : 'skip'
  );

  // Fetch transactions with project details
  const transactions = useQuery(
    api.transactions.getUserTransactionsWithProjects,
    isSignedIn && user ? { userId: user.id, limit: 20 } : 'skip'
  );

  // Fetch certificates
  const certificates = useQuery(
    api.transactions.getUserCertificates,
    isSignedIn && user ? { userId: user.id, limit: 20 } : 'skip'
  );

  // Fetch monthly progress data
  const monthlyProgress = useQuery(
    api.transactions.getMonthlyOffsetProgress,
    isSignedIn && user ? { userId: user.id, months: 12 } : 'skip'
  );

  // Loading states
  const isLoading = !isLoaded || dashboardMetrics === undefined;

  // Show sign-in if not authenticated
  if (isLoaded && !isSignedIn) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-8">Buyer Dashboard</h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Sign in to view your dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your purchase history and carbon
            credit certificates.
          </p>
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Buyer Dashboard</h1>
        <div className="animate-pulse">
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

  // Get data with fallbacks
  const metrics = dashboardMetrics || {
    totalCredits: 0,
    totalSpent: 0,
    totalCO2Offset: 0,
    equivalentTrees: 0,
    equivalentCarsOff: 0,
    projectTypes: {},
    transactionCount: 0,
    activeProjects: 0,
  };

  const purchaseHistory = (transactions || []).map((transaction: any) => ({
    id: transaction._id,
    project: transaction.project?.title || 'General Carbon Credits',
    credits: transaction.creditAmount,
    price: transaction.unitPrice,
    totalPrice: transaction.totalAmount,
    purchaseDate: new Date(transaction._creationTime)
      .toISOString()
      .split('T')[0],
    certificateId: `CERT-${transaction.transactionReference}`,
    status: transaction.paymentStatus === 'completed' ? 'Active' : 'Pending',
    impact: {
      co2Offset: transaction.creditAmount * 1.5,
      projectType: transaction.project?.projectType,
    },
    transactionReference: transaction.transactionReference,
    stripePaymentIntentId: transaction.stripePaymentIntentId,
  }));

  const certificateList = (certificates || []).map((cert: any) => ({
    id: cert.id,
    project: cert.project,
    credits: cert.credits,
    purchaseDate: new Date(cert.purchaseDate).toISOString().split('T')[0],
    certificateId: cert.certificateId,
    status: cert.status,
    co2Offset: cert.co2Offset,
    projectType: cert.projectType,
    certificateUrl: cert.certificateUrl,
  }));

  // Certificate download handlers
  const handleDownloadCertificate = async (
    transactionId: string,
    certificateUrl?: string,
    certificateId?: string
  ) => {
    try {
      if (certificateUrl && certificateId) {
        // Download from storage if already exists
        await downloadFromStorage(certificateUrl, certificateId);
      } else {
        // Generate and download directly
        await downloadCertificateDirectly(transactionId as any);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  // Certificate view handlers
  const handleViewCertificate = async (
    transactionId: string,
    certificateUrl?: string
  ) => {
    try {
      if (certificateUrl) {
        // View from storage if already exists
        await viewCertificateFromStorage(certificateUrl);
      } else {
        // Generate and view directly
        await viewCertificateInBrowserDirectly(transactionId as any);
      }
    } catch (error) {
      console.error('Error viewing certificate:', error);
      alert('Failed to view certificate. Please try again.');
    }
  };

  // Handle invoice download
  const handleDownloadInvoice = async (transactionReference: string, stripePaymentIntentId?: string) => {
    if (!stripePaymentIntentId) {
      alert('Invoice not available for this transaction');
      return;
    }

    setDownloadingInvoice(transactionReference);
    try {
      const response = await fetch(`/api/stripe/receipt?paymentIntentId=${stripePaymentIntentId}`);
      const data = await response.json();

      if (data.success && data.receiptUrl) {
        // Open the Stripe receipt in a new window
        window.open(data.receiptUrl, '_blank');
      } else {
        throw new Error(data.error || 'Failed to get receipt URL');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Buyer Dashboard</h1>

      {/* Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-green-600">
            {metrics.totalCredits}
          </p>
          <p className="text-sm text-gray-600">Credits Purchased</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-blue-600">
            ${metrics.totalSpent.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Total Invested</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-purple-600">
            {metrics.totalCO2Offset.toFixed(1)}
          </p>
          <p className="text-sm text-gray-600">Tons CO₂ Offset</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-orange-600">
            {metrics.equivalentTrees}
          </p>
          <p className="text-sm text-gray-600">Trees Equivalent</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-red-600">
            {metrics.equivalentCarsOff}
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
                  <div className="bg-white rounded-lg p-4">
                    <MonthlyProgressChart
                      monthlyProgress={monthlyProgress?.monthlyProgress || []}
                      totalCO2Offset={monthlyProgress?.totalCO2Offset || 0}
                      className="w-full"
                      showCumulative={true}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Project Type Distribution
                  </h3>
                  <div className="bg-white rounded-lg p-4">
                    <ProjectTypeChart
                      projectTypes={metrics.projectTypes}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Environmental Equivalents and Project Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">
                    Environmental Impact Equivalents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-600">🌳</p>
                      <p className="text-lg font-semibold">
                        {metrics.equivalentTrees}
                      </p>
                      <p className="text-sm text-gray-600">
                        Trees planted equivalent
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-blue-600">🚗</p>
                      <p className="text-lg font-semibold">
                        {metrics.equivalentCarsOff}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cars off road for a year
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-purple-600">⚡</p>
                      <p className="text-lg font-semibold">
                        {(metrics.totalCO2Offset * 3000).toFixed(0)}
                      </p>
                      <p className="text-sm text-gray-600">
                        kWh clean energy supported
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Project Portfolio Summary
                  </h3>
                  <ProjectTypeSummary
                    projectTypes={metrics.projectTypes}
                    className="w-full"
                  />
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Projects:</span>
                      <span className="font-medium">
                        {Object.values(metrics.projectTypes).reduce(
                          (sum: number, count: any) => sum + (count as number),
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Active Projects:</span>
                      <span className="font-medium">
                        {metrics.activeProjects}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Purchase History Tab */}
          {activeTab === 'purchases' && (
            <div className="space-y-6">
              {purchaseHistory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No purchases yet</p>
                  <p className="text-gray-400">
                    Start buying carbon credits to see your history here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchaseHistory.map((purchase: any) => (
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
                            {new Date(
                              purchase.purchaseDate as string
                            ).toLocaleDateString()}
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
                            ${purchase.price.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Cost</p>
                          <p className="text-lg font-semibold">
                            ${purchase.totalPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">CO₂ Offset</p>
                          <p className="text-lg font-semibold">
                            {purchase.impact.co2Offset.toFixed(1)} tons
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleDownloadInvoice(purchase.transactionReference, purchase.stripePaymentIntentId)}
                          disabled={downloadingInvoice === purchase.transactionReference}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloadingInvoice === purchase.transactionReference ? 'Loading...' : 'View Invoice'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Digital Certificates</h3>
              </div>

              {certificateList.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No certificates yet</p>
                  <p className="text-gray-400">
                    Complete a purchase to generate your certificates.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificateList.map((certificate: any) => (
                    <div
                      key={certificate.id}
                      className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border"
                    >
                      <div className="text-center mb-4">
                        <h4 className="font-semibold text-lg">
                          Carbon Credit Certificate
                        </h4>
                        <p className="text-sm text-gray-600">
                          Certificate ID: {certificate.certificateId}
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p>
                          <span className="font-medium">Project:</span>{' '}
                          {certificate.project}
                        </p>
                        <p>
                          <span className="font-medium">Credits:</span>{' '}
                          {certificate.credits}
                        </p>
                        <p>
                          <span className="font-medium">Issue Date:</span>{' '}
                          {new Date(
                            certificate.purchaseDate as string
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">CO₂ Offset:</span>{' '}
                          {certificate.co2Offset.toFixed(1)} tons
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() =>
                            handleViewCertificate(
                              certificate.id,
                              certificate.certificateUrl
                            )
                          }
                          disabled={isViewing}
                        >
                          {isViewing ? 'Opening...' : 'View'}
                        </button>
                        <button
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() =>
                            handleDownloadCertificate(
                              certificate.id,
                              certificate.certificateUrl,
                              certificate.certificateId
                            )
                          }
                          disabled={isDownloading}
                        >
                          {isDownloading ? 'Downloading...' : 'Download'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Project Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                Project Progress Tracking
              </h3>

              <div className="space-y-6">
                {purchaseHistory
                  .filter((p: any) => p.status === 'Active')
                  .map((purchase: any) => (
                    <div key={purchase.id} className="border rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4">
                        {purchase.project}
                      </h4>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium mb-3">
                            Progress Overview
                          </h5>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm">
                                  Overall Progress
                                </span>
                                <span className="text-sm font-medium">75%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: '75%' }}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Phase</p>
                                <p className="font-medium">Implementation</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Next Milestone</p>
                                <p className="font-medium">Q2 2024</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-3">Recent Updates</h5>
                          <div className="space-y-2 text-sm">
                            <div className="bg-green-50 p-2 rounded">
                              <p className="font-medium">Jan 15, 2024</p>
                              <p>Completed reforestation of 250 hectares</p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded">
                              <p className="font-medium">Jan 10, 2024</p>
                              <p>
                                Monthly environmental monitoring report
                                submitted
                              </p>
                            </div>
                            <div className="bg-yellow-50 p-2 rounded">
                              <p className="font-medium">Jan 5, 2024</p>
                              <p>
                                Phase 2 milestone achieved ahead of schedule
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                          View Full Project Details
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
