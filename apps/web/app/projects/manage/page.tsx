'use client';

import { api, Id } from '@packages/backend';
import { useAction, useMutation, useQuery } from 'convex/react';
import { useState } from 'react';

export default function ManageProjects() {
  const projects = useQuery(api.projects.getUserProjects) as any[];
  const updateProject = useMutation(api.projects.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject);
  const submitForVerification = useMutation(
    api.projects.submitProjectForVerification
  );

  // Document management mutations
  const deleteDocument = useMutation(api.documents.deleteDocument);
  const uploadProjectDocument = useMutation(api.projects.uploadProjectDocument);
  const generateUploadUrl = useAction(api.projects.generateUploadUrl);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Details modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview'); // Tab navigation for details modal

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  // Document management state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingDocumentType, setUploadingDocumentType] = useState<
    string | null
  >(null);
  const [documentToReplace, setDocumentToReplace] = useState<any>(null);

  // Documents for the selected project (view modal)
  const projectDocuments = useQuery(
    api.documents.getDocumentsByEntity,
    selectedProject
      ? {
          entityId: selectedProject._id,
          entityType: 'project',
        }
      : 'skip'
  );

  // Documents for the editing project (edit modal)
  const editingProjectDocuments = useQuery(
    api.documents.getDocumentsByEntity,
    editingProject
      ? {
          entityId: editingProject._id,
          entityType: 'project',
        }
      : 'skip'
  );

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
    location: { lat: 0, long: 0, name: '', city: '', country: '' },
    areaSize: 0,
    estimatedCO2Reduction: 0,
    budget: 0,
    startDate: '',
    expectedCompletionDate: '',
    milestone1: { name: '', date: '' },
    milestone2: { name: '', date: '' },
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

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'revision_required':
        return 'bg-yellow-100 text-yellow-800';
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

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.projectType.toLowerCase().includes(query) ||
      project.location.name.toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query) ||
      project.creator.firstName.toLowerCase().includes(query) ||
      project.creator.lastName.toLowerCase().includes(query)
    );
  });

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setEditFormData({
      title: project.title,
      description: project.description,
      projectType: project.projectType,
      location: {
        lat: project.location?.lat || 0,
        long: project.location?.long || 0,
        name: project.location?.name || '',
        city: project.location?.city || '',
        country: project.location?.country || '',
      },
      areaSize: project.areaSize,
      estimatedCO2Reduction: project.estimatedCO2Reduction,
      budget: project.budget,
      startDate: project.startDate,
      expectedCompletionDate: project.expectedCompletionDate,
      milestone1: project.milestone1 || { name: '', date: '' },
      milestone2: project.milestone2 || { name: '', date: '' },
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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update project: ${errorMessage}`);
    }
  };

  const handleEditFormChange = (
    field: string,
    value:
      | string
      | number
      | {
          lat: number;
          long: number;
          name: string;
          city?: string;
          country?: string;
        }
      | { name: string; date: string }
  ) => {
    if (field === 'location') {
      setEditFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          ...(value as {
            lat: number;
            long: number;
            name: string;
            city?: string;
            country?: string;
          }),
        },
      }));
    } else if (field === 'milestone1' || field === 'milestone2') {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value as { name: string; date: string },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleViewDetails = (project: any) => {
    setSelectedProject(project);
    setActiveTab('overview'); // Reset to overview tab
    setIsDetailsModalOpen(true);
  };

  const handleSubmitForReview = async (projectId: Id<'projects'>) => {
    try {
      const result = await submitForVerification({
        projectId,
        priority: 'normal',
      });

      if (result.success) {
        alert(
          result.message || 'Project submitted for verification successfully!'
        );
      }
    } catch (error) {
      console.error('Error submitting project for verification:', error);
      alert('Failed to submit project for verification. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId: Id<'projects'>) => {
    if (
      !confirm(
        'Are you sure you want to delete this project? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await deleteProject({ projectId });
      alert('Project deleted successfully!');
      // The page will automatically re-render with updated data
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  // Document management functions
  const handleDeleteDocument = async (
    documentId: string,
    documentName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${documentName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteDocument({ documentId: documentId as any });
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleReplaceDocument = (doc: any) => {
    setDocumentToReplace(doc);
    setUploadingDocumentType(doc.documentType);
    // Trigger file input click
    const fileInput = document.getElementById(
      `file-input-${doc.documentType}`
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    const file = event.target.files?.[0];
    if (!file || !editingProject) return;

    setIsUploading(true);
    setUploadingDocumentType(documentType);

    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const { storageId } = await uploadResponse.json();

      // If replacing an existing document, delete the old one first
      if (documentToReplace) {
        await deleteDocument({ documentId: documentToReplace._id });
      }

      // Upload new document record
      await uploadProjectDocument({
        projectId: editingProject._id,
        fileName: file.name,
        fileType: file.type,
        storageId: storageId,
        documentType: documentType as any,
        description: `${documentToReplace ? 'Replacement for' : 'New'} ${documentType.replace('_', ' ')}`,
      });

      alert(
        `${documentToReplace ? 'Document replaced' : 'Document uploaded'} successfully!`
      );
      setDocumentToReplace(null);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadingDocumentType(null);
      // Clear file input
      event.target.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Projects</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <a
            href="/projects/register"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            + New Project
          </a>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? 'No Projects Found' : 'No Projects Yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? `No projects match your search for "${searchQuery}"`
              : 'Start by creating your first carbon credit project'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Clear search
            </button>
          )}
          {!searchQuery && (
            <a
              href="/projects/register"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Create Your First Project
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          </div>
          <div className="grid gap-6">
            {filteredProjects.map((project: any) => (
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
                  <div className="flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}
                    >
                      {getStatusText(project.status)}
                    </span>
                    {project.verificationStatus &&
                      project.status !== 'draft' && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(project.verificationStatus)}`}
                        >
                          Verification:{' '}
                          {project.verificationStatus.replace('_', ' ')}
                        </span>
                      )}
                  </div>
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
                      Rs. {project.budget.toFixed(2)}
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
                    <p className="text-sm font-medium">
                      {project.location.name}
                    </p>
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
                      {project.creditsSold} / {project.totalCarbonCredits}{' '}
                      credits sold
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
                        Submit for Verification
                      </button>
                    )}
                    {project.verificationStatus === 'in_progress' && (
                      <a
                        href={`/verification/review/${project._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        View Verification
                      </a>
                    )}
                    <button
                      onClick={() =>
                        handleDeleteProject(project._id as Id<'projects'>)
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

              <div className="space-y-6">
                {/* Section 1: Basic Information (matches registration step 0) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Project Name"
                        value={editFormData.title}
                        onChange={(e) =>
                          handleEditFormChange('title', e.target.value)
                        }
                        className="w-full p-3 border rounded"
                      />
                    </div>
                    <div>
                      <select
                        value={editFormData.projectType}
                        onChange={(e) =>
                          handleEditFormChange('projectType', e.target.value)
                        }
                        className="w-full p-3 border rounded"
                      >
                        <option value="reforestation">Reforestation</option>
                        <option value="solar">Solar Energy</option>
                        <option value="wind">Wind Energy</option>
                        <option value="biogas">Biogas</option>
                        <option value="waste_management">
                          Waste Management
                        </option>
                        <option value="mangrove_restoration">
                          Mangrove Restoration
                        </option>
                      </select>
                    </div>
                    <div>
                      <textarea
                        placeholder="Project Description"
                        value={editFormData.description}
                        onChange={(e) =>
                          handleEditFormChange('description', e.target.value)
                        }
                        className="w-full p-3 border rounded h-32"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Expected Carbon Credits"
                        value={editFormData.totalCarbonCredits || ''}
                        onChange={(e) =>
                          handleEditFormChange(
                            'totalCarbonCredits',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full p-3 border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Project Timeline (matches registration step 1) */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Project Timeline
                  </h3>
                  <div className="space-y-4">
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
                        className="w-full p-3 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Expected Completion Date
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
                        className="w-full p-3 border rounded"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Key Milestone 1"
                        value={editFormData.milestone1?.name || ''}
                        onChange={(e) =>
                          handleEditFormChange('milestone1', {
                            ...(editFormData.milestone1 || {
                              name: '',
                              date: '',
                            }),
                            name: e.target.value,
                          })
                        }
                        className="p-3 border rounded"
                      />
                      <input
                        type="date"
                        value={editFormData.milestone1?.date || ''}
                        onChange={(e) =>
                          handleEditFormChange('milestone1', {
                            ...(editFormData.milestone1 || {
                              name: '',
                              date: '',
                            }),
                            date: e.target.value,
                          })
                        }
                        className="p-3 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Key Milestone 2"
                        value={editFormData.milestone2?.name || ''}
                        onChange={(e) =>
                          handleEditFormChange('milestone2', {
                            ...(editFormData.milestone2 || {
                              name: '',
                              date: '',
                            }),
                            name: e.target.value,
                          })
                        }
                        className="p-3 border rounded"
                      />
                      <input
                        type="date"
                        value={editFormData.milestone2?.date || ''}
                        onChange={(e) =>
                          handleEditFormChange('milestone2', {
                            ...(editFormData.milestone2 || {
                              name: '',
                              date: '',
                            }),
                            date: e.target.value,
                          })
                        }
                        className="p-3 border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Location & Details (matches registration step 2) */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Location & Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Project Location
                      </label>
                      <input
                        type="text"
                        placeholder="Project Address"
                        value={editFormData.location.name}
                        onChange={(e) =>
                          handleEditFormChange('location', {
                            ...editFormData.location,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={editFormData.location.city || ''}
                        onChange={(e) =>
                          handleEditFormChange('location', {
                            ...editFormData.location,
                            city: e.target.value,
                          })
                        }
                        className="p-3 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={editFormData.location.country || ''}
                        onChange={(e) =>
                          handleEditFormChange('location', {
                            ...editFormData.location,
                            country: e.target.value,
                          })
                        }
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
                        value={editFormData.areaSize || ''}
                        onChange={(e) =>
                          handleEditFormChange(
                            'areaSize',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full p-3 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Estimated CO2 Reduction (tons/year)
                      </label>
                      <input
                        type="number"
                        placeholder="Estimated CO2 Reduction"
                        value={editFormData.estimatedCO2Reduction || ''}
                        onChange={(e) =>
                          handleEditFormChange(
                            'estimatedCO2Reduction',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full p-3 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Project Budget (Rs.)
                      </label>
                      <input
                        type="number"
                        placeholder="Project Budget"
                        value={editFormData.budget || ''}
                        onChange={(e) =>
                          handleEditFormChange(
                            'budget',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full p-3 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Price per Credit ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price per Credit"
                        value={editFormData.pricePerCredit || ''}
                        onChange={(e) =>
                          handleEditFormChange(
                            'pricePerCredit',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full p-3 border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Required Documents (matches registration step 3) */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Required Documents
                  </h3>

                  {editingProjectDocuments === undefined ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">
                        Loading documents...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Project Proposal */}
                      {(() => {
                        const projectProposal =
                          editingProjectDocuments?.filter(
                            (doc: any) =>
                              doc.documentType === 'project_proposal'
                          ) || [];

                        return (
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-900">
                                Project Proposal
                              </h4>
                              <input
                                type="file"
                                id="add-file-input-project_proposal"
                                className="hidden"
                                accept="*/*"
                                onChange={(e) =>
                                  handleFileUpload(e, 'project_proposal')
                                }
                              />
                              <button
                                onClick={() => {
                                  setDocumentToReplace(null);
                                  const input = document.getElementById(
                                    'add-file-input-project_proposal'
                                  ) as HTMLInputElement;
                                  input?.click();
                                }}
                                disabled={isUploading}
                                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 disabled:opacity-50 flex items-center gap-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                                Add Document
                              </button>
                            </div>
                            {projectProposal.length > 0 ? (
                              <div className="grid grid-cols-1 gap-3">
                                {projectProposal.map((doc: any) => (
                                  <div
                                    key={doc._id}
                                    className="bg-white p-4 rounded border hover:shadow-sm transition-shadow"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-gray-900">
                                          {doc.originalName}
                                        </h5>
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="text-xs text-gray-500">
                                            {doc.fileSizeFormatted ||
                                              'Unknown size'}
                                          </span>
                                          <span
                                            className={`px-2 py-1 rounded text-xs ${doc.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                          >
                                            {doc.isVerified
                                              ? 'Verified'
                                              : 'Pending'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            window.open(
                                              doc.media?.fileUrl || '',
                                              '_blank'
                                            )
                                          }
                                          className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded"
                                        >
                                          View
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleReplaceDocument(doc)
                                          }
                                          disabled={
                                            isUploading &&
                                            uploadingDocumentType ===
                                              doc.documentType
                                          }
                                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                        >
                                          {isUploading &&
                                          uploadingDocumentType ===
                                            doc.documentType
                                            ? 'Uploading...'
                                            : 'Replace'}
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteDocument(
                                              doc._id,
                                              doc.originalName
                                            )
                                          }
                                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center">
                                <div className="text-orange-500 mb-2">
                                  <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 48 48"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-orange-700 mb-3">
                                  No project proposal uploaded
                                </p>
                                <input
                                  type="file"
                                  id="file-input-project_proposal"
                                  className="hidden"
                                  accept="*/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, 'project_proposal')
                                  }
                                />
                                <button
                                  onClick={() => {
                                    setDocumentToReplace(null);
                                    const input = document.getElementById(
                                      'file-input-project_proposal'
                                    ) as HTMLInputElement;
                                    input?.click();
                                  }}
                                  disabled={isUploading}
                                  className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                                >
                                  Upload Project Proposal
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Environmental Impact */}
                      {(() => {
                        const envImpact =
                          editingProjectDocuments?.filter(
                            (doc: any) =>
                              doc.documentType === 'environmental_impact'
                          ) || [];

                        return (
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-900">
                                Environmental Impact Assessment
                              </h4>
                              <input
                                type="file"
                                id="add-file-input-environmental_impact"
                                className="hidden"
                                accept="*/*"
                                onChange={(e) =>
                                  handleFileUpload(e, 'environmental_impact')
                                }
                              />
                              <button
                                onClick={() => {
                                  setDocumentToReplace(null);
                                  const input = document.getElementById(
                                    'add-file-input-environmental_impact'
                                  ) as HTMLInputElement;
                                  input?.click();
                                }}
                                disabled={isUploading}
                                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 disabled:opacity-50 flex items-center gap-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                                Add Document
                              </button>
                            </div>
                            {envImpact.length > 0 ? (
                              <div className="grid grid-cols-1 gap-3">
                                {envImpact.map((doc: any) => (
                                  <div
                                    key={doc._id}
                                    className="bg-white p-4 rounded border hover:shadow-sm transition-shadow"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-gray-900">
                                          {doc.originalName}
                                        </h5>
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="text-xs text-gray-500">
                                            {doc.fileSizeFormatted ||
                                              'Unknown size'}
                                          </span>
                                          <span
                                            className={`px-2 py-1 rounded text-xs ${doc.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                          >
                                            {doc.isVerified
                                              ? 'Verified'
                                              : 'Pending'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            window.open(
                                              doc.media?.fileUrl || '',
                                              '_blank'
                                            )
                                          }
                                          className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded"
                                        >
                                          View
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleReplaceDocument(doc)
                                          }
                                          disabled={
                                            isUploading &&
                                            uploadingDocumentType ===
                                              doc.documentType
                                          }
                                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                        >
                                          {isUploading &&
                                          uploadingDocumentType ===
                                            doc.documentType
                                            ? 'Uploading...'
                                            : 'Replace'}
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteDocument(
                                              doc._id,
                                              doc.originalName
                                            )
                                          }
                                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center">
                                <div className="text-orange-500 mb-2">
                                  <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 48 48"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-orange-700 mb-3">
                                  No environmental impact assessment uploaded
                                </p>
                                <input
                                  type="file"
                                  id="file-input-environmental_impact"
                                  className="hidden"
                                  accept="*/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, 'environmental_impact')
                                  }
                                />
                                <button
                                  onClick={() => {
                                    setDocumentToReplace(null);
                                    const input = document.getElementById(
                                      'file-input-environmental_impact'
                                    ) as HTMLInputElement;
                                    input?.click();
                                  }}
                                  disabled={isUploading}
                                  className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                                >
                                  Upload Environmental Impact
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Legal Permits */}
                      {(() => {
                        const legalPermits =
                          editingProjectDocuments?.filter(
                            (doc: any) => doc.documentType === 'legal_permits'
                          ) || [];

                        return (
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-900">
                                Legal Permits
                              </h4>
                              <input
                                type="file"
                                id="add-file-input-legal_permits"
                                className="hidden"
                                accept="*/*"
                                onChange={(e) =>
                                  handleFileUpload(e, 'legal_permits')
                                }
                              />
                              <button
                                onClick={() => {
                                  setDocumentToReplace(null);
                                  const input = document.getElementById(
                                    'add-file-input-legal_permits'
                                  ) as HTMLInputElement;
                                  input?.click();
                                }}
                                disabled={isUploading}
                                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 disabled:opacity-50 flex items-center gap-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                                Add Document
                              </button>
                            </div>
                            {legalPermits.length > 0 ? (
                              <div className="grid grid-cols-1 gap-3">
                                {legalPermits.map((doc: any) => (
                                  <div
                                    key={doc._id}
                                    className="bg-white p-4 rounded border hover:shadow-sm transition-shadow"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-gray-900">
                                          {doc.originalName}
                                        </h5>
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="text-xs text-gray-500">
                                            {doc.fileSizeFormatted ||
                                              'Unknown size'}
                                          </span>
                                          <span
                                            className={`px-2 py-1 rounded text-xs ${doc.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                          >
                                            {doc.isVerified
                                              ? 'Verified'
                                              : 'Pending'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            window.open(
                                              doc.media?.fileUrl || '',
                                              '_blank'
                                            )
                                          }
                                          className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded"
                                        >
                                          View
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleReplaceDocument(doc)
                                          }
                                          disabled={
                                            isUploading &&
                                            uploadingDocumentType ===
                                              doc.documentType
                                          }
                                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                        >
                                          {isUploading &&
                                          uploadingDocumentType ===
                                            doc.documentType
                                            ? 'Uploading...'
                                            : 'Replace'}
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteDocument(
                                              doc._id,
                                              doc.originalName
                                            )
                                          }
                                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center">
                                <div className="text-orange-500 mb-2">
                                  <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 48 48"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-orange-700 mb-3">
                                  No legal permits uploaded
                                </p>
                                <input
                                  type="file"
                                  id="file-input-legal_permits"
                                  className="hidden"
                                  accept="*/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, 'legal_permits')
                                  }
                                />
                                <button
                                  onClick={() => {
                                    setDocumentToReplace(null);
                                    const input = document.getElementById(
                                      'file-input-legal_permits'
                                    ) as HTMLInputElement;
                                    input?.click();
                                  }}
                                  disabled={isUploading}
                                  className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                                >
                                  Upload Legal Permits
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Section 5: Project Images (matches registration step 4) */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Project Images</h3>

                  {editingProjectDocuments === undefined ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">
                        Loading images...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Featured Images */}
                      {(() => {
                        const featuredImages =
                          editingProjectDocuments?.filter(
                            (doc: any) => doc.documentType === 'featured_images'
                          ) || [];

                        return (
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-900">
                                Featured Images
                              </h4>
                              <input
                                type="file"
                                id="add-file-input-featured_images"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileUpload(e, 'featured_images')
                                }
                              />
                              <button
                                onClick={() => {
                                  setDocumentToReplace(null);
                                  const input = document.getElementById(
                                    'add-file-input-featured_images'
                                  ) as HTMLInputElement;
                                  input?.click();
                                }}
                                disabled={isUploading}
                                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                                Add Images
                              </button>
                            </div>
                            {featuredImages.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {featuredImages.map((image: any) => (
                                  <div
                                    key={image._id}
                                    className="relative group"
                                  >
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                      <img
                                        src={image.media?.fileUrl || ''}
                                        alt={image.originalName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIgd2lkdGg9IjE4IiB4PSIzIiB5PSIzIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cGF0aCBkPSJtMjEgMTUtMy43ODYtMy43ODZhMSAxIDAgMCAwLTEuNDE0IDBMMTEgMTYiLz48L3N2Zz4=';
                                        }}
                                      />
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            window.open(
                                              image.media?.fileUrl || '',
                                              '_blank'
                                            )
                                          }
                                          className="bg-white text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-100"
                                        >
                                          View
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleReplaceDocument(image)
                                          }
                                          disabled={
                                            isUploading &&
                                            uploadingDocumentType ===
                                              image.documentType
                                          }
                                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                                        >
                                          {isUploading &&
                                          uploadingDocumentType ===
                                            image.documentType
                                            ? 'Uploading...'
                                            : 'Replace'}
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteDocument(
                                              image._id,
                                              image.originalName
                                            )
                                          }
                                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {image.originalName}
                                      </p>
                                      <span
                                        className={`inline-block mt-1 px-2 py-1 rounded text-xs ${image.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                      >
                                        {image.isVerified
                                          ? 'Verified'
                                          : 'Pending'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
                                <div className="text-purple-500 mb-2">
                                  <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 48 48"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 6l-7-7m0 0l-7 7m7-7v18"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-purple-700 mb-3">
                                  No featured images uploaded
                                </p>
                                <input
                                  type="file"
                                  id="file-input-featured_images"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, 'featured_images')
                                  }
                                />
                                <button
                                  onClick={() => {
                                    setDocumentToReplace(null);
                                    const input = document.getElementById(
                                      'file-input-featured_images'
                                    ) as HTMLInputElement;
                                    input?.click();
                                  }}
                                  disabled={isUploading}
                                  className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                                >
                                  Upload Featured Images
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Site Photographs */}
                      {(() => {
                        const sitePhotos =
                          editingProjectDocuments?.filter(
                            (doc: any) =>
                              doc.documentType === 'site_photographs'
                          ) || [];

                        return (
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-900">
                                Site Photographs
                              </h4>
                              <input
                                type="file"
                                id="add-file-input-site_photographs"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileUpload(e, 'site_photographs')
                                }
                              />
                              <button
                                onClick={() => {
                                  setDocumentToReplace(null);
                                  const input = document.getElementById(
                                    'add-file-input-site_photographs'
                                  ) as HTMLInputElement;
                                  input?.click();
                                }}
                                disabled={isUploading}
                                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                                Add Images
                              </button>
                            </div>
                            {sitePhotos.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {sitePhotos.map((image: any) => (
                                  <div
                                    key={image._id}
                                    className="relative group"
                                  >
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                      <img
                                        src={image.media?.fileUrl || ''}
                                        alt={image.originalName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIgd2lkdGg9IjE4IiB4PSIzIiB5PSIzIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cGF0aCBkPSJtMjEgMTUtMy43ODYtMy43ODZhMSAxIDAgMCAwLTEuNDE0IDBMMTEgMTYiLz48L3N2Zz4=';
                                        }}
                                      />
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            window.open(
                                              image.media?.fileUrl || '',
                                              '_blank'
                                            )
                                          }
                                          className="bg-white text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-100"
                                        >
                                          View
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleReplaceDocument(image)
                                          }
                                          disabled={
                                            isUploading &&
                                            uploadingDocumentType ===
                                              image.documentType
                                          }
                                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                                        >
                                          {isUploading &&
                                          uploadingDocumentType ===
                                            image.documentType
                                            ? 'Uploading...'
                                            : 'Replace'}
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteDocument(
                                              image._id,
                                              image.originalName
                                            )
                                          }
                                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {image.originalName}
                                      </p>
                                      <span
                                        className={`inline-block mt-1 px-2 py-1 rounded text-xs ${image.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                      >
                                        {image.isVerified
                                          ? 'Verified'
                                          : 'Pending'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
                                <div className="text-purple-500 mb-2">
                                  <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 48 48"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 6l-7-7m0 0l-7 7m7-7v18"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-purple-700 mb-3">
                                  No site photographs uploaded
                                </p>
                                <input
                                  type="file"
                                  id="file-input-site_photographs"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, 'site_photographs')
                                  }
                                />
                                <button
                                  onClick={() => {
                                    setDocumentToReplace(null);
                                    const input = document.getElementById(
                                      'file-input-site_photographs'
                                    ) as HTMLInputElement;
                                    input?.click();
                                  }}
                                  disabled={isUploading}
                                  className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                                >
                                  Upload Site Photographs
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Image Guidelines (matches registration) */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Image Guidelines
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>
                            • Featured images will be displayed prominently on
                            your project listing
                          </li>
                          <li>
                            • Site photographs help verifiers assess project
                            authenticity
                          </li>
                          <li>
                            • Use high-quality images (JPEG, PNG, or WebP
                            format)
                          </li>
                          <li>
                            • Include diverse angles and perspectives of your
                            project site
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Project Details Modal */}
      {isDetailsModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Modal Header with Background */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedProject.title || 'Untitled Project'}
                      </h2>
                      <p className="text-blue-100 capitalize">
                        {selectedProject.projectType?.replace('_', ' ') ||
                          'Unknown Type'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-blue-100">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {selectedProject.location?.city &&
                      selectedProject.location?.country
                        ? `${selectedProject.location.city}, ${selectedProject.location.country}`
                        : selectedProject.location?.name ||
                          'Location not specified'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Created{' '}
                      {new Date(
                        selectedProject._creationTime
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedProject.status === 'approved'
                        ? 'bg-green-500 text-white'
                        : selectedProject.status === 'active'
                          ? 'bg-blue-500 text-white'
                          : selectedProject.status === 'completed'
                            ? 'bg-purple-500 text-white'
                            : selectedProject.status === 'under_review'
                              ? 'bg-yellow-500 text-white'
                              : selectedProject.status === 'rejected'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-500 text-white'
                    }`}
                  >
                    {getStatusText(selectedProject.status)}
                  </span>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="max-h-[calc(95vh-140px)] overflow-y-auto">
              <div className="p-6">
                {/* Project Description */}
                {selectedProject.description && (
                  <div className="bg-gray-50 p-6 rounded-xl mb-6 border-l-4 border-blue-500">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Project Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>
                )}

                {/* Enhanced Project Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-blue-700 mb-1">
                      Total Credits
                    </h4>
                    <p className="text-3xl font-bold text-blue-900 mb-1">
                      {selectedProject.totalCarbonCredits?.toLocaleString() ||
                        0}
                    </p>
                    <p className="text-xs text-blue-600">Carbon Credits</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-green-700 mb-1">
                      Available
                    </h4>
                    <p className="text-3xl font-bold text-green-900 mb-1">
                      {selectedProject.creditsAvailable?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600">Ready for Sale</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-purple-700 mb-1">
                      Credits Sold
                    </h4>
                    <p className="text-3xl font-bold text-purple-900 mb-1">
                      {selectedProject.creditsSold?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-purple-600">
                      {Math.round(
                        ((selectedProject.creditsSold || 0) /
                          (selectedProject.totalCarbonCredits || 1)) *
                          100
                      )}
                      % Sold
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-orange-700 mb-1">
                      Price per Credit
                    </h4>
                    <p className="text-3xl font-bold text-orange-900 mb-1">
                      Rs. {selectedProject.pricePerCredit?.toFixed(2) || 0}
                    </p>
                    <p className="text-xs text-orange-600">Per Carbon Credit</p>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'overview'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                        Project Overview
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'documents'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Documents & Files
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('images')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'images'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Project Images
                      </div>
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Project Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Project Information
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 font-medium">
                              Location:
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {selectedProject.location?.name ||
                                'Unknown Location'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 font-medium">
                              Area Size:
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {selectedProject.areaSize || 0} hectares
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 font-medium">
                              CO2 Reduction:
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {selectedProject.estimatedCO2Reduction?.toLocaleString() ||
                                0}{' '}
                              tons/year
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 font-medium">
                              Budget:
                            </span>
                            <span className="text-gray-900 font-semibold">
                              Rs. {selectedProject.budget?.toFixed(2) || 0}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 font-medium">
                              Start Date:
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {selectedProject.startDate
                                ? new Date(
                                    selectedProject.startDate
                                  ).toLocaleDateString()
                                : 'Not set'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 font-medium">
                              Expected Completion:
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {selectedProject.expectedCompletionDate
                                ? new Date(
                                    selectedProject.expectedCompletionDate
                                  ).toLocaleDateString()
                                : 'Not set'}
                            </span>
                          </div>
                          {selectedProject.actualCompletionDate && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 font-medium">
                                Actual Completion:
                              </span>
                              <span className="text-gray-900 font-semibold">
                                {new Date(
                                  selectedProject.actualCompletionDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 font-medium">
                              Created:
                            </span>
                            <span className="text-gray-900 font-semibold">
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
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Credit Sales Progress
                      </h4>
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Credits Sold
                          </span>
                          <span className="text-sm font-bold text-blue-600">
                            {selectedProject.creditsSold || 0} /{' '}
                            {selectedProject.totalCarbonCredits || 0}
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(((selectedProject.creditsSold || 0) / (selectedProject.totalCarbonCredits || 1)) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          {Math.round(
                            ((selectedProject.creditsSold || 0) /
                              (selectedProject.totalCarbonCredits || 1)) *
                              100
                          )}
                          % Complete
                        </p>
                      </div>
                    </div>

                    {/* Project Creator */}
                    <div className="bg-green-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Project Creator
                      </h4>
                      <div className="bg-white rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <span className="text-gray-600 text-sm">Name</span>
                            <p className="font-semibold text-gray-900">
                              {selectedProject.creator.firstName || 'Unknown'}{' '}
                              {selectedProject.creator.lastName || ''}
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="text-gray-600 text-sm">Email</span>
                            <p className="font-semibold text-gray-900">
                              {selectedProject.creator.email || 'No email'}
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="text-gray-600 text-sm">Role</span>
                            <p className="font-semibold text-gray-900 capitalize">
                              {selectedProject.creator.role?.replace(
                                '_',
                                ' '
                              ) || 'Unknown Role'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Required Documents */}
                    {selectedProject.requiredDocuments &&
                      selectedProject.requiredDocuments.length > 0 && (
                        <div className="bg-orange-50 rounded-xl p-6">
                          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-orange-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13V12a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Required Documents
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.requiredDocuments.map(
                              (doc: string, index: number) => (
                                <span
                                  key={index}
                                  className="bg-white text-orange-800 px-3 py-2 rounded-lg text-sm font-medium border border-orange-200"
                                >
                                  {doc?.replace('_', ' ') || 'Unknown Document'}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Project Documents
                      </h4>
                      {projectDocuments === undefined ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <span className="text-sm text-gray-600">
                              Loading documents...
                            </span>
                          </div>
                        </div>
                      ) : projectDocuments &&
                        projectDocuments.filter(
                          (doc: any) =>
                            ![
                              'featured_images',
                              'site_photographs',
                              'site_images',
                            ].includes(doc.documentType)
                        ).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {projectDocuments
                            .filter(
                              (doc: any) =>
                                ![
                                  'featured_images',
                                  'site_photographs',
                                  'site_images',
                                ].includes(doc.documentType)
                            )
                            .map((doc: any) => (
                              <div
                                key={doc._id}
                                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <svg
                                        className="w-5 h-5 text-blue-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <h5 className="font-semibold text-gray-900 truncate">
                                        {doc.originalName}
                                      </h5>
                                    </div>
                                    <p className="text-sm text-blue-600 font-medium capitalize mb-1">
                                      {doc.documentType.replace('_', ' ')}
                                    </p>
                                    {doc.description && (
                                      <p className="text-sm text-gray-600 mb-3">
                                        {doc.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs">
                                      <span className="text-gray-500">
                                        Size:{' '}
                                        {doc.fileSizeFormatted || 'Unknown'}
                                      </span>
                                      <span
                                        className={`px-2 py-1 rounded-full font-medium ${
                                          doc.isVerified
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                      >
                                        {doc.isVerified
                                          ? '✓ Verified'
                                          : '⏳ Pending Review'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                  <button
                                    onClick={() =>
                                      window.open(
                                        doc.media?.fileUrl || '',
                                        '_blank'
                                      )
                                    }
                                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                  >
                                    View Document
                                  </button>
                                  <a
                                    href={doc.media?.fileUrl || ''}
                                    download={doc.originalName}
                                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center no-underline"
                                  >
                                    Download
                                  </a>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-gray-400 mb-4">
                            <svg
                              className="w-16 h-16 mx-auto"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 48 48"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-500 text-lg font-medium">
                            No documents uploaded yet
                          </p>
                          <p className="text-gray-400 text-sm">
                            Project documents will appear here once uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'images' && (
                  <div className="space-y-6">
                    {projectDocuments === undefined ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <span className="text-sm text-gray-600">
                            Loading images...
                          </span>
                        </div>
                      </div>
                    ) : (
                      (() => {
                        const featuredImages =
                          projectDocuments?.filter(
                            (doc: any) => doc.documentType === 'featured_images'
                          ) || [];
                        const sitePhotographs =
                          projectDocuments?.filter((doc: any) =>
                            ['site_photographs', 'site_images'].includes(
                              doc.documentType
                            )
                          ) || [];

                        return (
                          <>
                            {/* Featured Images */}
                            <div className="bg-purple-50 rounded-xl p-6">
                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <svg
                                  className="w-5 h-5 text-purple-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Featured Images ({featuredImages.length})
                              </h4>
                              {featuredImages.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {featuredImages.map((image: any) => (
                                    <div
                                      key={image._id}
                                      className="relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                                    >
                                      <div className="aspect-square bg-gray-100 overflow-hidden">
                                        <img
                                          src={image.media?.fileUrl || ''}
                                          alt={image.originalName}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIgd2lkdGg9IjE4IiB4PSIzIiB5PSIzIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cGF0aCBkPSJtMjEgMTUtMy43ODYtMy43ODZhMSAxIDAgMCAwLTEuNDE0IDBMMTEgMTYiLz48L3N2Zz4=';
                                          }}
                                        />
                                      </div>
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-center justify-center">
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() =>
                                              window.open(
                                                image.media?.fileUrl || '',
                                                '_blank'
                                              )
                                            }
                                            className="bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                                          >
                                            View Full
                                          </button>
                                          <a
                                            href={image.media?.fileUrl || ''}
                                            download={image.originalName}
                                            className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors no-underline"
                                          >
                                            Download
                                          </a>
                                        </div>
                                      </div>
                                      <div className="p-3">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {image.originalName}
                                        </p>
                                        <p className="text-xs text-purple-600 font-medium">
                                          Featured Image
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <div className="text-purple-300 mb-3">
                                    <svg
                                      className="w-12 h-12 mx-auto"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 48 48"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 6l-7-7m0 0l-7 7m7-7v18"
                                      />
                                    </svg>
                                  </div>
                                  <p className="text-purple-600 font-medium">
                                    No featured images uploaded
                                  </p>
                                  <p className="text-purple-500 text-sm">
                                    Featured images showcase your project
                                    prominently
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Site Photographs */}
                            <div className="bg-green-50 rounded-xl p-6">
                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <svg
                                  className="w-5 h-5 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Site Photographs ({sitePhotographs.length})
                              </h4>
                              {sitePhotographs.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {sitePhotographs.map((image: any) => (
                                    <div
                                      key={image._id}
                                      className="relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                                    >
                                      <div className="aspect-square bg-gray-100 overflow-hidden">
                                        <img
                                          src={image.media?.fileUrl || ''}
                                          alt={image.originalName}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIgd2lkdGg9IjE4IiB4PSIzIiB5PSIzIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cGF0aCBkPSJtMjEgMTUtMy43ODYtMy43ODZhMSAxIDAgMCAwLTEuNDE0IDBMMTEgMTYiLz48L3N2Zz4=';
                                          }}
                                        />
                                      </div>
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-center justify-center">
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() =>
                                              window.open(
                                                image.media?.fileUrl || '',
                                                '_blank'
                                              )
                                            }
                                            className="bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                                          >
                                            View Full
                                          </button>
                                          <a
                                            href={image.media?.fileUrl || ''}
                                            download={image.originalName}
                                            className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors no-underline"
                                          >
                                            Download
                                          </a>
                                        </div>
                                      </div>
                                      <div className="p-3">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {image.originalName}
                                        </p>
                                        <p className="text-xs text-green-600 font-medium capitalize">
                                          {image.documentType.replace('_', ' ')}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <div className="text-green-300 mb-3">
                                    <svg
                                      className="w-12 h-12 mx-auto"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 48 48"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 6l-7-7m0 0l-7 7m7-7v18"
                                      />
                                    </svg>
                                  </div>
                                  <p className="text-green-600 font-medium">
                                    No site photographs uploaded
                                  </p>
                                  <p className="text-green-500 text-sm">
                                    Site photos help with project verification
                                  </p>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()
                    )}
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
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleDeleteProject(
                        selectedProject._id as Id<'projects'>
                      );
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
