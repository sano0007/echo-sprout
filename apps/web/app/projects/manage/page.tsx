'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../../packages/backend/convex/_generated/api';

export default function ManageProjects() {
  const projects = useQuery(api.projects.getUserProjects);

  if (projects === undefined) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Projects</h1>
          <a
            href="/projects/register"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            New Project
          </a>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'under_review':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'under_review':
        return 'Under Review';
      case 'submitted':
        return 'Submitted';
      case 'draft':
        return 'Draft';
      case 'rejected':
        return 'Rejected';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Projects</h1>
        <a
          href="/projects/register"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          + New Project
        </a>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
          <p className="text-gray-600 mb-6">
            Start by creating your first carbon credit project
          </p>
          <a
            href="/projects/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Create Your First Project
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{project.projectType}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Created by: {project.creator.firstName}{' '}
                    {project.creator.lastName}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}
                >
                  {getStatusText(project.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Expected Credits</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {project.totalCarbonCredits.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Credits</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {project.creditsAvailable.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="text-lg font-semibold text-green-600">
                    ${project.budget.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CO2 Reduction</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {project.estimatedCO2Reduction.toLocaleString()} tons/year
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-sm font-medium">{project.location.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Area Size</p>
                  <p className="text-sm font-medium">
                    {project.areaSize} hectares
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((project.creditsSold / project.totalCarbonCredits) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1 text-gray-500">
                    {project.creditsSold} / {project.totalCarbonCredits} credits
                    sold
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Created:{' '}
                  {new Date(project._creationTime).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Edit
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors">
                    View Details
                  </button>
                  {project.status === 'draft' && (
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                      Submit for Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
