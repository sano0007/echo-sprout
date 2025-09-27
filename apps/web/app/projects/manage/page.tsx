'use client';

import { Project } from '@echo-sprout/types';
import { api, Id } from '@packages/backend';
import { useAction, useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import FileUpload from '../../components/FileUpload';
import PageContainer from '../../../components/ui/PageContainer';
import PageHeader from '../../../components/ui/PageHeader';

export default function ManageProjects() {
  const router = useRouter();
  const projects = useQuery(api.projects.getUserProjects);
  const getStorageUrl = useAction(api.projects.getStorageUrl);
  const [convexImageUrls, setConvexImageUrls] = useState<{
    [storageId: string]: string;
  }>({});
  const [loadingImageUrls, setLoadingImageUrls] = useState<{
    [storageId: string]: boolean;
  }>({});
  const updateProject = useMutation(api.projects.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject);
  const submitProjectForVerification = useMutation(
    api.projects.submitProjectForVerification
  );
  // State for handling featured image updates
  const setFeaturedImage = useMutation(api.projects.updateProject);

  const formatNumberWithCommas = (num: number): string => {
    return num.toLocaleString();
  };

  // Get project verification status (includes documents) - not needed in manage page
  // const projectVerificationStatus = useQuery(
  //   api.projects.getProjectVerificationStatus,
  //   selectedProject?._id ? { projectId: selectedProject._id as Id<'projects'> } : 'skip'
  // );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Load Convex URLs for project images
  useEffect(() => {
    if (projects) {
      const loadImageUrls = async () => {
        for (const project of projects) {
          // Load featured image URL
          if (
            project.featuredImage?.cloudinary_public_id &&
            (project.featuredImage.cloudinary_url.startsWith('storage://') ||
              !project.featuredImage.cloudinary_url.startsWith('http'))
          ) {
            try {
              const storageId = project.featuredImage.cloudinary_public_id;

              // Set loading state
              setLoadingImageUrls((prev) => ({
                ...prev,
                [storageId]: true,
              }));

              const url = await getStorageUrl({ storageId });
              if (url) {
                setConvexImageUrls((prev) => ({
                  ...prev,
                  [storageId]: url,
                }));
              }
            } catch (error) {
              console.error('Failed to load featured image URL:', error);
            } finally {
              // Clear loading state
              setLoadingImageUrls((prev) => ({
                ...prev,
                [project.featuredImage?.cloudinary_public_id ?? '']: false,
              }));
            }
          }

          // Load project images URLs
          if (project.projectImages) {
            for (const image of project.projectImages) {
              if (
                image.cloudinary_public_id &&
                (image.cloudinary_url.startsWith('storage://') ||
                  !image.cloudinary_url.startsWith('http'))
              ) {
                try {
                  const storageId = image.cloudinary_public_id;

                  // Set loading state
                  setLoadingImageUrls((prev) => ({
                    ...prev,
                    [storageId]: true,
                  }));

                  const url = await getStorageUrl({ storageId });
                  if (url) {
                    setConvexImageUrls((prev) => ({
                      ...prev,
                      [storageId]: url,
                    }));
                  }
                } catch (error) {
                  console.error('Failed to load project image URL:', error);
                } finally {
                  // Clear loading state
                  setLoadingImageUrls((prev) => ({
                    ...prev,
                    [image.cloudinary_public_id]: false,
                  }));
                }
              }
            }
          }
        }
      };
      loadImageUrls();
    }
  }, [projects, getStorageUrl]);

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

  // Filter projects based on search query
  const filteredProjects =
    projects?.filter((project: Project) => {
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
    }) || [];

  const handleEditProject = (project: Project) => {
    router.push(`/projects/edit/${project._id}`);
  };

  const handleSubmitForReview = async (projectId: Id<'projects'>) => {
    try {
      const result = await submitProjectForVerification({
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

  if (!projects) {
    return (
      <PageContainer size="lg">
        <PageHeader
          title="Manage Projects"
          right={
            <a
              href="/projects/register"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Project
            </a>
          }
        />
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your projects...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your carbon credit projects
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-12 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
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
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Project
          </a>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🌱</div>
          <h3 className="text-2xl font-semibold mb-2 text-gray-900">
            {searchQuery ? 'No Projects Found' : 'No Projects Yet'}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchQuery
              ? `No projects match your search for "${searchQuery}"`
              : 'Start your journey towards a sustainable future by creating your first carbon credit project'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Clear search
            </button>
          )}
          {!searchQuery && (
            <a
              href="/projects/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
            >
              Create Your First Project
            </a>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProjects.map((project: Project) => (
            <div
              key={project._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Project Info Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4 mb-6">
                      {/* Project Image */}
                      <div className="flex-shrink-0">
                        {project.featuredImage ? (
                          loadingImageUrls[
                            project.featuredImage.cloudinary_public_id
                          ] ? (
                            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          ) : (
                            <div className="relative w-20 h-20">
                              <Image
                                src={
                                  convexImageUrls[
                                    project.featuredImage.cloudinary_public_id
                                  ] || project.featuredImage.cloudinary_url
                                }
                                alt={project.title || 'Project image'}
                                fill
                                className="rounded-lg object-cover shadow-sm"
                              />
                            </div>
                          )
                        ) : project.projectImages &&
                          project.projectImages.length > 0 &&
                          project.projectImages[0] ? (
                          loadingImageUrls[
                            project.projectImages[0].cloudinary_public_id
                          ] ? (
                            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          ) : (
                            <div className="relative w-20 h-20">
                              <Image
                                src={
                                  convexImageUrls[
                                    project.projectImages[0]
                                      .cloudinary_public_id
                                  ] || project.projectImages[0].cloudinary_url
                                }
                                alt={
                                  project.projectImages[0].caption ||
                                  project.title
                                }
                                fill
                                className="rounded-lg object-cover shadow-sm"
                              />
                            </div>
                          )
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                            <span className="text-3xl">🌱</span>
                          </div>
                        )}
                      </div>

                      {/* Project Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 truncate">
                            {project.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}
                          >
                            <span className="text-base">
                              {getStatusIcon(project.status)}
                            </span>
                            {getStatusText(project.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {project.projectType}
                        </p>
                        <p className="text-sm text-gray-500">
                          {project.creator
                            ? `Created by ${project.creator.firstName || 'Unknown'} ${project.creator.lastName || ''}`
                            : 'Created by Unknown User'}
                        </p>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                          Expected Credits
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                          {formatNumberWithCommas(project.totalCarbonCredits)}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                          Available
                        </p>
                        <p className="text-xl font-bold text-green-900">
                          {formatNumberWithCommas(project.creditsAvailable)}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                          Budget
                        </p>
                        <p className="text-xl font-bold text-purple-900">
                          Rs. {formatNumberWithCommas(project.budget)}
                        </p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                        <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">
                          CO2 Reduction
                        </p>
                        <p className="text-xl font-bold text-orange-900">
                          {formatNumberWithCommas(
                            project.estimatedCO2Reduction
                          )}{' '}
                          t/y
                        </p>
                      </div>
                    </div>

                    {/* Project Meta */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        📍 {project.location.name}
                      </span>
                      <span className="flex items-center gap-1">
                        📏 {project.areaSize} hectares
                      </span>
                      <span className="flex items-center gap-1">
                        📅 Created{' '}
                        {new Date(project._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[160px]">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      title="Edit project details, images, and documents"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <a
                      href={`/projects/details/${project._id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Details
                    </a>
                    {project.status === 'draft' && (
                      <button
                        onClick={() =>
                          handleSubmitForReview(project._id as Id<'projects'>)
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Submit
                      </button>
                    )}
                    {project.verificationStatus === 'in_progress' && (
                      <a
                        href={`/verification/review/${project._id}`}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Review
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            'Are you sure you want to delete this project? This action cannot be undone.'
                          )
                        ) {
                          deleteProject({
                            projectId: project._id as Id<'projects'>,
                          })
                            .then(() => {
                              alert('Project deleted successfully!');
                            })
                            .catch((error) => {
                              console.error('Error deleting project:', error);
                              alert(
                                'Failed to delete project. Please try again.'
                              );
                            });
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
