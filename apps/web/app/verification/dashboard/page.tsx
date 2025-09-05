'use client';

import { useState } from 'react';

export default function VerificationDashboard() {
  const [activeTab, setActiveTab] = useState('pending');

  const projects = {
    pending: [
      {
        id: 1,
        name: 'Solar Farm Project',
        creator: 'SolarTech Inc',
        submitted: '2024-01-15',
        type: 'Solar Energy',
        priority: 'High',
      },
      {
        id: 2,
        name: 'Reforestation Initiative',
        creator: 'Green Forest Co',
        submitted: '2024-01-16',
        type: 'Reforestation',
        priority: 'Medium',
      },
      {
        id: 3,
        name: 'Wind Power Plant',
        creator: 'WindGen LLC',
        submitted: '2024-01-17',
        type: 'Wind Energy',
        priority: 'Low',
      },
    ],
    inProgress: [
      {
        id: 4,
        name: 'Biogas Facility',
        creator: 'BioEnergy Ltd',
        submitted: '2024-01-10',
        type: 'Biogas',
        verifier: 'John Smith',
      },
      {
        id: 5,
        name: 'Waste Management System',
        creator: 'CleanWaste Inc',
        submitted: '2024-01-12',
        type: 'Waste Management',
        verifier: 'Sarah Johnson',
      },
    ],
    completed: [
      {
        id: 6,
        name: 'Ocean Wind Farm',
        creator: 'Marine Power Co',
        completed: '2024-01-05',
        type: 'Wind Energy',
        result: 'Approved',
      },
      {
        id: 7,
        name: 'Urban Forest Project',
        creator: 'City Green Initiative',
        completed: '2024-01-08',
        type: 'Reforestation',
        result: 'Approved',
      },
    ],
  };

  const stats = {
    totalProjects: 25,
    pendingReview: 8,
    inProgress: 5,
    completedThisMonth: 12,
    averageReviewTime: '5.2 days',
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Verification Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-blue-600">
            {stats.totalProjects}
          </p>
          <p className="text-sm text-gray-600">Total Projects</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-orange-600">
            {stats.pendingReview}
          </p>
          <p className="text-sm text-gray-600">Pending Review</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {stats.inProgress}
          </p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-green-600">
            {stats.completedThisMonth}
          </p>
          <p className="text-sm text-gray-600">Completed This Month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-purple-600">
            {stats.averageReviewTime}
          </p>
          <p className="text-sm text-gray-600">Avg Review Time</p>
        </div>
      </div>

      {/* Project Queue Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Pending Review ({projects.pending.length})
            </button>
            <button
              onClick={() => setActiveTab('inProgress')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'inProgress' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              In Progress ({projects.inProgress.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Completed ({projects.completed.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Pending Projects */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {projects.pending.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="text-gray-600">by {project.creator}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {project.type}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            project.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : project.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {project.priority} Priority
                        </span>
                        <span className="text-sm text-gray-600">
                          Submitted:{' '}
                          {new Date(project.submitted).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                        Start Review
                      </button>
                      <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* In Progress Projects */}
          {activeTab === 'inProgress' && (
            <div className="space-y-4">
              {projects.inProgress.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="text-gray-600">by {project.creator}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {project.type}
                        </span>
                        <span className="text-sm text-gray-600">
                          Verifier: {project.verifier}
                        </span>
                        <span className="text-sm text-gray-600">
                          Started:{' '}
                          {new Date(project.submitted).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded text-sm">
                        Continue Review
                      </button>
                      <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                        View Progress
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Projects */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              {projects.completed.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="text-gray-600">by {project.creator}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {project.type}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            project.result === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {project.result}
                        </span>
                        <span className="text-sm text-gray-600">
                          Completed:{' '}
                          {new Date(project.completed).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                        View Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
