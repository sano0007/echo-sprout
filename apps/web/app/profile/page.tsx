'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userType, setUserType] = useState('creator'); // creator, buyer, verifier, admin

  const userProfiles = {
    creator: {
      name: 'Green Solutions Inc',
      email: 'contact@greensolutions.com',
      userType: 'Project Creator',
      joinDate: '2023-08-15',
      location: 'California, USA',
      website: 'www.greensolutions.com',
      description:
        'We specialize in large-scale reforestation and renewable energy projects across North America.',
      stats: {
        totalProjects: 12,
        activeProjects: 5,
        creditsGenerated: 15000,
        verified: true,
      },
    },
    buyer: {
      name: 'EcoTech Corporation',
      email: 'sustainability@ecotech.com',
      userType: 'Credit Buyer',
      joinDate: '2023-09-22',
      location: 'New York, USA',
      company: 'EcoTech Corporation',
      description:
        'Technology company committed to carbon neutrality through strategic carbon credit investments.',
      stats: {
        creditsPurchased: 2500,
        totalSpent: 45000,
        projectsSupported: 8,
        co2Offset: 3750,
      },
    },
  };

  const currentProfile = userProfiles[userType];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">
                {currentProfile.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{currentProfile.name}</h1>
              <p className="text-blue-100">{currentProfile.userType}</p>
              <p className="text-blue-100">
                Member since{' '}
                {new Date(currentProfile.joinDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              {currentProfile.stats.verified && (
                <span className="bg-green-500 px-3 py-1 rounded-full text-sm">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'activity' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Activity & Stats
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Account Settings
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Documents & Verification
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          defaultValue={currentProfile.name}
                          className="w-full p-3 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          defaultValue={currentProfile.email}
                          className="w-full p-3 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          defaultValue={currentProfile.location}
                          className="w-full p-3 border rounded"
                        />
                      </div>
                      {currentProfile.website && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Website
                          </label>
                          <input
                            type="url"
                            defaultValue={currentProfile.website}
                            className="w-full p-3 border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      User Type & Role
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 border rounded">
                        <input
                          type="radio"
                          checked={userType === 'creator'}
                          onChange={() => setUserType('creator')}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-medium">Project Creator</span>
                          <p className="text-sm text-gray-600">
                            Develop and manage carbon credit projects
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded">
                        <input
                          type="radio"
                          checked={userType === 'buyer'}
                          onChange={() => setUserType('buyer')}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-medium">Credit Buyer</span>
                          <p className="text-sm text-gray-600">
                            Purchase carbon credits for offset goals
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <textarea
                    defaultValue={currentProfile.description}
                    className="w-full h-32 p-3 border rounded"
                    placeholder="Tell us about your organization and goals..."
                  ></textarea>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {userType === 'creator' ? (
                        <>
                          <div className="bg-blue-50 p-4 rounded text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {currentProfile.stats.totalProjects}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total Projects
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {currentProfile.stats.activeProjects}
                            </p>
                            <p className="text-sm text-gray-600">
                              Active Projects
                            </p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded text-center col-span-2">
                            <p className="text-2xl font-bold text-purple-600">
                              {currentProfile.stats.creditsGenerated?.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Credits Generated
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-blue-50 p-4 rounded text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {currentProfile.stats.creditsPurchased?.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Credits Purchased
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded text-center">
                            <p className="text-2xl font-bold text-green-600">
                              $
                              {currentProfile.stats.totalSpent?.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total Invested
                            </p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded text-center">
                            <p className="text-2xl font-bold text-purple-600">
                              {currentProfile.stats.projectsSupported}
                            </p>
                            <p className="text-sm text-gray-600">
                              Projects Supported
                            </p>
                          </div>
                          <div className="bg-orange-50 p-4 rounded text-center">
                            <p className="text-2xl font-bold text-orange-600">
                              {currentProfile.stats.co2Offset?.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              CO₂ Offset (tons)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Activity & Stats Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <div className="space-y-4">
                {userType === 'creator'
                  ? [
                      {
                        action:
                          "Project 'Amazon Reforestation Phase 2' approved",
                        date: '2024-01-18',
                        type: 'success',
                      },
                      {
                        action:
                          "Monthly report submitted for 'Solar Farm Initiative'",
                        date: '2024-01-15',
                        type: 'info',
                      },
                      {
                        action:
                          "Document revision requested for 'Wind Power Project'",
                        date: '2024-01-12',
                        type: 'warning',
                      },
                      {
                        action: "New project 'Biogas Plant' registered",
                        date: '2024-01-10',
                        type: 'info',
                      },
                    ]
                  : [
                      {
                        action:
                          "Purchased 50 credits from 'Amazon Conservation Project'",
                        date: '2024-01-18',
                        type: 'success',
                      },
                      {
                        action: "Certificate downloaded for 'Solar Initiative'",
                        date: '2024-01-15',
                        type: 'info',
                      },
                      {
                        action: "Added 25 credits to cart from 'Wind Power'",
                        date: '2024-01-12',
                        type: 'info',
                      },
                      {
                        action: 'Completed purchase of 30 credits',
                        date: '2024-01-10',
                        type: 'success',
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded border-l-4 ${
                          activity.type === 'success'
                            ? 'border-green-500 bg-green-50'
                            : activity.type === 'warning'
                              ? 'border-yellow-500 bg-yellow-50'
                              : 'border-blue-500 bg-blue-50'
                        }`}
                      >
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
              </div>
            </div>
          )}

          {/* Account Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span>Email notifications for project updates</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span>SMS notifications for important alerts</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span>Marketing communications</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span>Make profile visible to other users</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span>Show activity in community forum</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Security</h3>
                <div className="space-y-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Change Password
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Enable Two-Factor Authentication
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Documents & Verification Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Identity Verification
                </h3>
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="font-medium text-green-800">
                      Identity Verified
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Your identity has been verified on January 10, 2024
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Uploaded Documents
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <p className="font-medium">Business License</p>
                      <p className="text-sm text-gray-600">
                        Uploaded: Jan 8, 2024 • Verified ✓
                      </p>
                    </div>
                    <button className="text-blue-600 hover:underline">
                      View
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <p className="font-medium">Tax Certificate</p>
                      <p className="text-sm text-gray-600">
                        Uploaded: Jan 8, 2024 • Verified ✓
                      </p>
                    </div>
                    <button className="text-blue-600 hover:underline">
                      View
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Upload Additional Documents
                </h3>
                <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded">
                  <p className="text-gray-600 mb-2">
                    Drag and drop files here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, JPG, PNG (Max 10MB)
                  </p>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Choose Files
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
