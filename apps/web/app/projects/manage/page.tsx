'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { Id } from '@packages/backend/convex/_generated/dataModel';
import { Project } from '@echo-sprout/types';

export default function ManageProjects() {
  const projects = useQuery(api.projects.getUserProjects);
  const updateProject = useMutation(api.projects.updateProject);
  const updateProjectStatus = useMutation(api.projects.updateProjectStatus);

  // Details modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    projectType: 'reforestation' as
      | 'reforestation'
      | 'solar'
      | 'wind'
      | 'biogas'
      | 'waste_management'
      | 'mangrove_restoration',
    location: { lat: 0, long: 0, name: '' },
    areaSize: 0,
    estimatedCO2Reduction: 0,
    budget: 0,
    startDate: '',
    expectedCompletionDate: '',
    totalCarbonCredits: 0,
    pricePerCredit: 0,
    requiredDocuments: [] as string[],
  });

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
      case 'suspended':
        return 'Suspended';
      default:
        return status;
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditFormData({
      title: project.title,
      description: project.description,
      projectType: project.projectType,
      location: project.location,
      areaSize: project.areaSize,
      estimatedCO2Reduction: project.estimatedCO2Reduction,
      budget: project.budget,
      startDate: project.startDate,
      expectedCompletionDate: project.expectedCompletionDate,
      totalCarbonCredits: project.totalCarbonCredits,
      pricePerCredit: project.pricePerCredit,
      requiredDocuments: project.requiredDocuments,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProject) return;

    try {
      await updateProject({
        projectId: editingProject._id,
        ...editFormData,
      });
      setIsEditModalOpen(false);
      setEditingProject(null);
      // The page will automatically re-render with updated data
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  const handleEditFormChange = (
    field: string,
    value: string | number | { lat: number; long: number; name: string }
  ) => {
    if (field === 'location') {
      setEditFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          ...(value as { lat: number; long: number; name: string }),
        },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const handleSubmitForReview = async (projectId: Id<'projects'>) => {
    try {
      await updateProjectStatus({
        projectId,
        status: 'submitted',
      });
      alert('Project submitted for review successfully!');
    } catch (error) {
      console.error('Error submitting project for review:', error);
      alert('Failed to submit project for review. Please try again.');
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
          {projects.map((project: Project) => (
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
                  <button
                    onClick={() => handleEditProject(project)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewDetails(project)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                  {project.status === 'draft' && (
                    <button
                      onClick={() =>
                        handleSubmitForReview(project._id as Id<'projects'>)
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Submit for Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Project</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) =>
                        handleEditFormChange('title', e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Project Type
                    </label>
                    <select
                      value={editFormData.projectType}
                      onChange={(e) =>
                        handleEditFormChange('projectType', e.target.value)
                      }
                      className="w-full p-2 border rounded"
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
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) =>
                      handleEditFormChange('description', e.target.value)
                    }
                    className="w-full p-2 border rounded h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editFormData.location.name}
                      onChange={(e) =>
                        handleEditFormChange('location', {
                          lat: editFormData.location.lat,
                          long: editFormData.location.long,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Location name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Area Size (hectares)
                    </label>
                    <input
                      type="number"
                      value={editFormData.areaSize}
                      onChange={(e) =>
                        handleEditFormChange(
                          'areaSize',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      CO2 Reduction (tons/year)
                    </label>
                    <input
                      type="number"
                      value={editFormData.estimatedCO2Reduction}
                      onChange={(e) =>
                        handleEditFormChange(
                          'estimatedCO2Reduction',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Budget ($)
                    </label>
                    <input
                      type="number"
                      value={editFormData.budget}
                      onChange={(e) =>
                        handleEditFormChange(
                          'budget',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editFormData.startDate}
                      onChange={(e) =>
                        handleEditFormChange('startDate', e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Completion Date
                    </label>
                    <input
                      type="date"
                      value={editFormData.expectedCompletionDate}
                      onChange={(e) =>
                        handleEditFormChange(
                          'expectedCompletionDate',
                          e.target.value
                        )
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Carbon Credits
                    </label>
                    <input
                      type="number"
                      value={editFormData.totalCarbonCredits}
                      onChange={(e) =>
                        handleEditFormChange(
                          'totalCarbonCredits',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price per Credit ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.pricePerCredit}
                      onChange={(e) =>
                        handleEditFormChange(
                          'pricePerCredit',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {isDetailsModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Project Details</h2>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Project Header */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedProject.title || 'Untitled Project'}
                    </h3>
                    <p className="text-gray-600">
                      {selectedProject.projectType || 'Unknown Type'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}
                  >
                    {getStatusText(selectedProject.status)}
                  </span>
                </div>
                <p className="text-gray-700">
                  {selectedProject.description || 'No description available'}
                </p>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-600 mb-2">
                    Total Credits
                  </h4>
                  <p className="text-2xl font-bold text-blue-900">
                    {selectedProject.totalCarbonCredits?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-600 mb-2">
                    Available Credits
                  </h4>
                  <p className="text-2xl font-bold text-green-900">
                    {selectedProject.creditsAvailable?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-600 mb-2">
                    Credits Sold
                  </h4>
                  <p className="text-2xl font-bold text-purple-900">
                    {selectedProject.creditsSold?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-600 mb-2">
                    Price per Credit
                  </h4>
                  <p className="text-2xl font-bold text-orange-900">
                    ${selectedProject.pricePerCredit || 0}
                  </p>
                </div>
              </div>

              {/* Project Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">
                    Project Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">
                        {selectedProject.location?.name || 'Unknown Location'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area Size:</span>
                      <span className="font-medium">
                        {selectedProject.areaSize || 0} hectares
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CO2 Reduction:</span>
                      <span className="font-medium">
                        {selectedProject.estimatedCO2Reduction?.toLocaleString() ||
                          0}{' '}
                        tons/year
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">
                        ${selectedProject.budget?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">
                        {selectedProject.startDate
                          ? new Date(
                              selectedProject.startDate
                            ).toLocaleDateString()
                          : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Expected Completion:
                      </span>
                      <span className="font-medium">
                        {selectedProject.expectedCompletionDate
                          ? new Date(
                              selectedProject.expectedCompletionDate
                            ).toLocaleDateString()
                          : 'Not set'}
                      </span>
                    </div>
                    {selectedProject.actualCompletionDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Actual Completion:
                        </span>
                        <span className="font-medium">
                          {new Date(
                            selectedProject.actualCompletionDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {selectedProject._creationTime
                          ? new Date(
                              selectedProject._creationTime
                            ).toLocaleDateString()
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Progress</h4>
                <div className="bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(((selectedProject.creditsSold || 0) / (selectedProject.totalCarbonCredits || 1)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedProject.creditsSold || 0} of{' '}
                  {selectedProject.totalCarbonCredits || 0} credits sold (
                  {Math.round(
                    ((selectedProject.creditsSold || 0) /
                      (selectedProject.totalCarbonCredits || 1)) *
                      100
                  )}
                  %)
                </p>
              </div>

              {/* Creator Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">Project Creator</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">
                      {selectedProject.creator.firstName || 'Unknown'}{' '}
                      {selectedProject.creator.lastName || ''}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">
                      {selectedProject.creator.email || 'No email'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <p className="font-medium capitalize">
                      {selectedProject.creator.role?.replace('_', ' ') ||
                        'Unknown Role'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              {selectedProject.requiredDocuments &&
                selectedProject.requiredDocuments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-3">
                      Required Documents
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.requiredDocuments.map(
                        (doc: string, index: number) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {doc?.replace('_', ' ') || 'Unknown Document'}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleEditProject(selectedProject);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
