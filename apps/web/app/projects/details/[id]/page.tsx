'use client';

import { useUser } from '@clerk/nextjs';
import { api, Id } from '@packages/backend';
import { useAction, useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Card from '../../../../components/ui/Card';
import PageContainer from '../../../../components/ui/PageContainer';
import PageHeader from '../../../../components/ui/PageHeader';

export default function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [convexImageUrls, setConvexImageUrls] = useState<{
    [storageId: string]: string;
  }>({});
  const [loadingImageUrls, setLoadingImageUrls] = useState<{
    [storageId: string]: boolean;
  }>({});
  const [existingDocuments, setExistingDocuments] = useState<{
    projectProposal: any[];
    environmentalAssessment: any[];
    sitePhotographs: any[];
    legalPermits: any[];
  }>({
    projectProposal: [],
    environmentalAssessment: [],
    sitePhotographs: [],
    legalPermits: [],
  });
  const [convexDocumentUrls, setConvexDocumentUrls] = useState<{
    [storageId: string]: string;
  }>({});
  const [loadingDocumentUrls, setLoadingDocumentUrls] = useState<{
    [storageId: string]: boolean;
  }>({});

  // Get project data (public)
  const project = useQuery(
    api.marketplace.getProjectById,
    projectId ? { projectId: projectId as Id<'projects'> } : 'skip'
  );

  // Clerk auth state (only authenticated users can query restricted documents)
  const { user, isLoaded } = useUser();

  // Fetch documents for this project and categorize by type (skip if not signed in)
  const projectDocuments = useQuery(
    api.documents.getDocumentsByEntity,
    isLoaded && user && projectId
      ? {
          entityId: projectId as string,
          entityType: 'project' as const,
        }
      : 'skip'
  );

  const updateProject = useMutation(api.projects.updateProject);
  const getStorageUrl = useAction(api.projects.getStorageUrl);

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
    if (!project) return;

    try {
      await updateProject({
        projectId: project._id as Id<'projects'>,
        featuredImage: image,
      });
      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Error setting featured image:', error);
      alert('Failed to set featured image. Please try again.');
    }
  };

  // Load Convex URLs for project images
  useEffect(() => {
    if (project?.projectImages) {
      const loadImageUrls = async () => {
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
              console.error(
                'Failed to load image URL for storageId:',
                image.cloudinary_public_id,
                error
              );
            } finally {
              // Clear loading state
              setLoadingImageUrls((prev) => ({
                ...prev,
                [image.cloudinary_public_id]: false,
              }));
            }
          } else if (
            image.cloudinary_url &&
            image.cloudinary_url.startsWith('http')
          ) {
            setConvexImageUrls((prev) => ({
              ...prev,
              [image.cloudinary_public_id]: image.cloudinary_url,
            }));
          }
        }
      };
      loadImageUrls();
    }
  }, [project, getStorageUrl]);

  // Load and categorize existing documents and resolve their URLs
  useEffect(() => {
    if (projectDocuments && Array.isArray(projectDocuments)) {
      // Categorize documents by type
      const categorizedDocs = {
        projectProposal: [] as any[],
        environmentalAssessment: [] as any[],
        sitePhotographs: [] as any[],
        legalPermits: [] as any[],
      };

      projectDocuments.forEach((doc: any) => {
        if (doc.documentType === 'project_plan') {
          categorizedDocs.projectProposal.push(doc);
        } else if (doc.documentType === 'environmental_assessment') {
          categorizedDocs.environmentalAssessment.push(doc);
        } else if (doc.documentType === 'photos') {
          categorizedDocs.sitePhotographs.push(doc);
        } else if (doc.documentType === 'permits') {
          categorizedDocs.legalPermits.push(doc);
        }
      });

      setExistingDocuments(categorizedDocs);

      const loadDocumentUrls = async () => {
        for (const doc of projectDocuments) {
          if (
            doc.media?.cloudinary_public_id &&
            (doc.media.cloudinary_url.startsWith('storage://') ||
              !doc.media.cloudinary_url.startsWith('http'))
          ) {
            try {
              const storageId = doc.media.cloudinary_public_id;

              setLoadingDocumentUrls((prev) => ({
                ...prev,
                [storageId]: true,
              }));

              const url = await getStorageUrl({ storageId });
              if (url) {
                setConvexDocumentUrls((prev) => ({
                  ...prev,
                  [storageId]: url,
                }));
              }
            } catch (error) {
              console.error(
                'Failed to load document URL for storageId:',
                doc.media.cloudinary_public_id,
                error
              );
            } finally {
              setLoadingDocumentUrls((prev) => ({
                ...prev,
                [doc.media.cloudinary_public_id]: false,
              }));
            }
          } else if (
            doc.media?.cloudinary_url &&
            doc.media.cloudinary_url.startsWith('http')
          ) {
            setConvexDocumentUrls((prev) => ({
              ...prev,
              [doc.media.cloudinary_public_id]: doc.media.cloudinary_url,
            }));
          }
        }
      };

      loadDocumentUrls();
    }
  }, [projectDocuments, getStorageUrl]);

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

  const selectedProject = project;

  return (
    <PageContainer size="md">
      <PageHeader
        title="Project Details"
        backHref="/projects/manage"
        right={
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedProject.status)}`}
          >
            <span>{getStatusIcon(selectedProject.status)}</span>
            {getStatusText(selectedProject.status)}
          </span>
        }
      />

      {/* Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Featured Image */}
        <Card className="lg:col-span-2">
          {selectedProject.featuredImage ? (
            <div className="relative">
              {loadingImageUrls[
                selectedProject.featuredImage.cloudinary_public_id
              ] ? (
                <div className="w-full h-80 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <Image
                  src={
                    convexImageUrls[
                      selectedProject.featuredImage.cloudinary_public_id
                    ] || selectedProject.featuredImage.cloudinary_url
                  }
                  alt={selectedProject.title || 'Project image'}
                  fill
                  className="object-cover rounded-2xl shadow-xl transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 rounded-lg p-3 shadow">
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
        </Card>

        {/* Project Info */}
        <Card className="lg:col-span-3">
          <div className="space-y-6">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
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

                <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
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

                <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
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

                <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
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
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
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

        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
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

        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
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

        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
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

      {/* Timeline */}
      <Card
        title="Project Timeline"
        description="Track your project's progress and milestones"
        className="mb-8"
      >
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
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center relative z-10">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="flex-1 bg-white rounded-lg p-6 shadow-md border border-gray-200">
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
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center relative z-10">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="flex-1 bg-white rounded-lg p-6 shadow-md border border-gray-200">
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
                <div className="flex-1 bg-white rounded-lg p-6 shadow-md border border-gray-200">
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
      </Card>

      {/* Featured Image Section */}
      {selectedProject.featuredImage && (
        <Card title="Featured Image" className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-xl">⭐</span>
            </div>
            <h4 className="text-xl font-bold text-gray-900">Featured Image</h4>
          </div>

          <div className="relative group h-80">
            {loadingImageUrls[
              selectedProject.featuredImage.cloudinary_public_id
            ] ? (
              <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Image
                src={
                  convexImageUrls[
                    selectedProject.featuredImage.cloudinary_public_id
                  ] || selectedProject.featuredImage.cloudinary_url
                }
                alt="Featured project image"
                fill
                className="object-cover rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
              Featured
            </div>
          </div>
        </Card>
      )}

      {/* Project Images Section */}
      <Card
        title="Project Images"
        description="Visual documentation of the project"
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-xl text-white">🖼️</span>
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">Project Images</h4>
            <p className="text-gray-600">Visual documentation of the project</p>
          </div>
        </div>

        {selectedProject.projectImages &&
        selectedProject.projectImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {selectedProject.projectImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100 hover:border-blue-300 transition-all duration-300">
                  {loadingImageUrls[image.cloudinary_public_id] ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <Image
                      src={
                        convexImageUrls[image.cloudinary_public_id] ||
                        image.cloudinary_url
                      }
                      alt={image.caption || `Project image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  )}
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
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No project images uploaded yet
              </h4>
              <p className="text-gray-500 text-sm">
                Only PNG files up to 10MB each
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Project Documents (Unified, read-only) */}
      <Card
        title="Project Documents"
        description="All documents linked to this project"
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-xl text-white">📄</span>
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">
              Project Documents
            </h4>
            <p className="text-gray-600">
              All documents linked to this project
            </p>
          </div>
        </div>

        {Array.isArray(projectDocuments) &&
        projectDocuments.filter((d: any) => d.documentType !== 'photos')
          .length > 0 ? (
          <div className="space-y-2">
            {projectDocuments
              .filter((d: any) => d.documentType !== 'photos')
              .map((doc: any, index: number) => (
                <div
                  key={doc._id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    <div className="min-w-0">
                      <a
                        href={
                          convexDocumentUrls[doc.media?.cloudinary_public_id] ||
                          doc.media?.cloudinary_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline truncate block"
                        title={doc.originalName || doc.fileName}
                      >
                        {doc.originalName || doc.fileName}
                      </a>
                      <p className="text-xs text-gray-500">
                        {doc.fileType} • {doc.fileSizeFormatted}{' '}
                        {doc.isVerified ? '• Verified' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <svg
              className="w-8 h-8 text-gray-400 mb-2 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm text-gray-500">No documents uploaded yet</p>
          </div>
        )}
      </Card>

      {/* Creator Information */}
      <Card title="Project Creator">
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
      </Card>
    </PageContainer>
  );
}
