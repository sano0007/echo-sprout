'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api, Id } from '@packages/backend';
import { useRouter } from 'next/navigation';

export default function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // Get project data
  const project = useQuery(
    api.projects.getProjectVerificationStatus,
    projectId ? { projectId: projectId as Id<'projects'> } : 'skip'
  );

  const updateProject = useMutation(api.projects.updateProject);

  const formatNumberWithCommas = (num: number): string => {
    return num.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'suspended':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'under_review':
        return '⏳';
      case 'draft':
        return '📝';
      case 'rejected':
        return '❌';
      case 'active':
        return '🔄';
      case 'completed':
        return '✅';
      case 'suspended':
        return '⏸️';
      default:
        return '📄';
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

  const handleSetFeaturedImage = async (image: {
    cloudinary_public_id: string;
    cloudinary_url: string;
  }) => {
    if (!project?.project) return;

    try {
      await updateProject({
        projectId: project.project._id as Id<'projects'>,
        featuredImage: image,
      });
      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Error setting featured image:', error);
      alert('Failed to set featured image. Please try again.');
    }
  };

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  const selectedProject = project.project;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Projects
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-3xl font-bold text-gray-900">Project Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}
          >
            <span>{getStatusIcon(selectedProject.status)}</span>
            {getStatusText(selectedProject.status)}
          </span>
        </div>
      </div>

      {/* Enhanced Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        {/* Featured Image - Larger */}
        <div className="lg:col-span-2">
          {selectedProject.featuredImage ? (
            <div className="relative group">
              <img
                src={selectedProject.featuredImage.cloudinary_url}
                alt={selectedProject.title}
                className="w-full h-80 object-cover rounded-2xl shadow-xl transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-800">
                    Featured Image
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-80 bg-gradient-to-br from-blue-100 via-purple-50 to-green-100 rounded-2xl flex items-center justify-center shadow-xl border-2 border-dashed border-gray-300">
              <div className="text-center">
                <span className="text-8xl mb-4 block">🌱</span>
                <p className="text-gray-600 font-medium text-lg">
                  No featured image
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Upload an image to showcase your project
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Project Info - Enhanced */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 h-full border border-gray-200">
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  {selectedProject.title}
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  {selectedProject.description ||
                    'No description available for this project.'}
                </p>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {selectedProject.projectType
                      ?.replace('_', ' ')
                      .toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📍</span>
                    <span className="text-sm font-medium text-gray-600">
                      LOCATION
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedProject.location?.name || 'Not specified'}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📏</span>
                    <span className="text-sm font-medium text-gray-600">
                      AREA SIZE
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedProject.areaSize || 0} hectares
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-sm font-medium text-gray-600">
                      BUDGET
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    Rs. {formatNumberWithCommas(selectedProject.budget || 0)}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🌿</span>
                    <span className="text-sm font-medium text-gray-600">
                      CO2 REDUCTION
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatNumberWithCommas(
                      selectedProject.estimatedCO2Reduction || 0
                    )}{' '}
                    t/y
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Total Credits
              </p>
              <p className="text-3xl font-bold text-blue-700">
                {selectedProject.totalCarbonCredits?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider">
                Available
              </p>
              <p className="text-3xl font-bold text-green-700">
                {selectedProject.creditsAvailable?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{
                width: `${((selectedProject.creditsAvailable || 0) / (selectedProject.totalCarbonCredits || 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Credits Sold
              </p>
              <p className="text-3xl font-bold text-purple-700">
                {selectedProject.creditsSold?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{
                width: `${((selectedProject.creditsSold || 0) / (selectedProject.totalCarbonCredits || 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💎</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Price/Credit
              </p>
              <p className="text-3xl font-bold text-orange-700">
                Rs.{' '}
                {formatNumberWithCommas(selectedProject.pricePerCredit || 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-orange-600 mt-2">
            <span>Market Rate</span>
            <span className="font-semibold">Competitive</span>
          </div>
        </div>
      </div>

      {/* Enhanced Timeline */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-xl text-white">⏰</span>
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">
              Project Timeline
            </h4>
            <p className="text-gray-600">
              Track your project's progress and milestones
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-green-500"></div>

          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                <span className="text-2xl text-white">🚀</span>
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-gray-900 text-lg">
                      Project Start Date
                    </h5>
                    <p className="text-gray-600">
                      When the project officially begins
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedProject.startDate
                        ? new Date(
                            selectedProject.startDate
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                <span className="text-2xl text-white">🎯</span>
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-gray-900 text-lg">
                      Expected Completion
                    </h5>
                    <p className="text-gray-600">Projected completion date</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedProject.expectedCompletionDate
                        ? new Date(
                            selectedProject.expectedCompletionDate
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {selectedProject.actualCompletionDate && (
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                  <span className="text-2xl text-white">🏁</span>
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-gray-900 text-lg">
                        Actual Completion
                      </h5>
                      <p className="text-gray-600">
                        Project completed successfully
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {new Date(
                          selectedProject.actualCompletionDate
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-500 rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                <span className="text-2xl text-white">📅</span>
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-gray-900 text-lg">
                      Project Created
                    </h5>
                    <p className="text-gray-600">
                      Initial project registration
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-600">
                      {selectedProject._creationTime
                        ? new Date(
                            selectedProject._creationTime
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image Section */}
      {selectedProject.featuredImage && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-xl">⭐</span>
            </div>
            <h4 className="text-xl font-bold text-gray-900">Featured Image</h4>
          </div>

          <div className="relative group max-w-md mx-auto">
            <img
              src={selectedProject.featuredImage.cloudinary_url}
              alt="Featured project image"
              className="w-full h-64 object-cover rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
              Featured
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Project Gallery */}
      {selectedProject.projectImages &&
      selectedProject.projectImages.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-xl text-white">🖼️</span>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">
                  Project Gallery
                </h4>
                <p className="text-gray-600">
                  {selectedProject.projectImages.length} images uploaded
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {selectedProject.projectImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100 hover:border-blue-300 transition-all duration-300">
                  <img
                    src={image.cloudinary_url}
                    alt={image.caption || `Project image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetFeaturedImage({
                          cloudinary_public_id: image.cloudinary_public_id,
                          cloudinary_url: image.cloudinary_url,
                        });
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:bg-blue-500 hover:text-white"
                    >
                      Set as Featured
                    </button>
                  </div>
                </div>

                {image.isPrimary && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                    ⭐ Featured
                  </div>
                )}

                {image.caption && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 text-center truncate">
                      {image.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border-2 border-dashed border-gray-300 mb-8">
          <div className="text-center">
            <span className="text-6xl mb-4 block">📷</span>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              No Images Uploaded
            </h4>
            <p className="text-gray-600">
              Upload project images to showcase your work
            </p>
          </div>
        </div>
      )}

      {/* Project Documents */}
      {project.project.documents && project.project.documents.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-xl text-white">📄</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">
                Uploaded Documents
              </h4>
              <p className="text-gray-600">
                {project.project.documents.length} document(s) uploaded
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.project.documents.map((doc, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📎</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 capitalize">
                      {doc.originalName || doc.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.fileType} • {doc.fileSizeFormatted}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border-2 border-dashed border-gray-300 mb-8">
          <div className="text-center">
            <span className="text-6xl mb-4 block">📄</span>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              No Documents Uploaded
            </h4>
            <p className="text-gray-600">
              Upload project documents to complete your project submission
            </p>
          </div>
        </div>
      )}

      {/* Creator Information */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
          <h4 className="text-xl font-bold text-gray-900">Project Creator</h4>
        </div>

        {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-6">*/}
        {/*  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">*/}
        {/*    <div className="flex items-center gap-3">*/}
        {/*      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">*/}
        {/*        <span className="text-sm">👤</span>*/}
        {/*      </div>*/}
        {/*      <div>*/}
        {/*        <p className="text-xs text-gray-500 font-medium">NAME</p>*/}
        {/*        <p className="font-semibold text-gray-900">*/}
        {/*          {selectedProject.creator ? `${selectedProject.creator.firstName || 'Unknown'} ${selectedProject.creator.lastName || ''}` : 'Unknown User'}*/}
        {/*        </p>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}

        {/*  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">*/}
        {/*    <div className="flex items-center gap-3">*/}
        {/*      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">*/}
        {/*        <span className="text-sm">📧</span>*/}
        {/*      </div>*/}
        {/*      <div>*/}
        {/*        <p className="text-xs text-gray-500 font-medium">EMAIL</p>*/}
        {/*        <p className="font-semibold text-gray-900">*/}
        {/*          {selectedProject.creator?.email || 'No email'}*/}
        {/*        </p>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm">🏷️</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">ROLE</p>
              {/*<p className="font-semibold text-gray-900 capitalize">*/}
              {/*  {selectedProject.creator?.role?.replace('_', ' ') || 'Project Creator'}*/}
              {/*</p>*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
