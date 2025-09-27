'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAction, useQuery, useMutation } from 'convex/react';
import { api, Id } from '@packages/backend';

export default function EditProject() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: '',
    location: { name: '', coordinates: { lat: 0, lng: 0 } },
    areaSize: 0,
    budget: 0,
    estimatedCO2Reduction: 0,
    totalCarbonCredits: 0,
    pricePerCredit: 0,
    startDate: '' as string,
    expectedCompletionDate: '' as string,
  });

  // Document state - for new uploads and existing documents
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    projectProposal: Array<{
      file: File;
      name: string;
      size: string;
      type: string;
    }>;
    environmentalAssessment: Array<{
      file: File;
      name: string;
      size: string;
      type: string;
    }>;
    sitePhotographs: Array<{
      file: File;
      name: string;
      size: string;
      type: string;
    }>;
    legalPermits: Array<{
      file: File;
      name: string;
      size: string;
      type: string;
    }>;
  }>({
    projectProposal: [],
    environmentalAssessment: [],
    sitePhotographs: [],
    legalPermits: [],
  });
  
  // Existing documents from database
  const [existingDocuments, setExistingDocuments] = useState<{
    projectProposal: Array<{
      _id: string;
      fileName: string;
      originalName: string;
      fileType: string;
      fileSizeFormatted: string;
      isVerified: boolean;
      documentType: string;
      media: {
        cloudinary_public_id: string;
        cloudinary_url: string;
      };
    }>;
    environmentalAssessment: Array<{
      _id: string;
      fileName: string;
      originalName: string;
      fileType: string;
      fileSizeFormatted: string;
      isVerified: boolean;
      documentType: string;
      media: {
        cloudinary_public_id: string;
        cloudinary_url: string;
      };
    }>;
    sitePhotographs: Array<{
      _id: string;
      fileName: string;
      originalName: string;
      fileType: string;
      fileSizeFormatted: string;
      isVerified: boolean;
      documentType: string;
      media: {
        cloudinary_public_id: string;
        cloudinary_url: string;
      };
    }>;
    legalPermits: Array<{
      _id: string;
      fileName: string;
      originalName: string;
      fileType: string;
      fileSizeFormatted: string;
      isVerified: boolean;
      documentType: string;
      media: {
        cloudinary_public_id: string;
        cloudinary_url: string;
      };
    }>;
  }>({
    projectProposal: [],
    environmentalAssessment: [],
    sitePhotographs: [],
    legalPermits: [],
  });
  
  const [convexDocumentUrls, setConvexDocumentUrls] = useState<{[storageId: string]: string}>({});
  const [loadingDocumentUrls, setLoadingDocumentUrls] = useState<{[storageId: string]: boolean}>({});
  const [tempUploadedFiles, setTempUploadedFiles] = useState<File[]>([]);
  const [uploadedImagePreviews, setUploadedImagePreviews] = useState<{[storageId: string]: string}>({});
  const [convexImageUrls, setConvexImageUrls] = useState<{[storageId: string]: string}>({});
  const [loadingImageUrls, setLoadingImageUrls] = useState<{[storageId: string]: boolean}>({});
  const [projectImages, setProjectImages] = useState<
    Array<{
      cloudinary_public_id: string;
      cloudinary_url: string;
      caption?: string;
      isPrimary: boolean;
      uploadDate: number;
    }>
  >([]);
  const [featuredImage, setFeaturedImage] = useState<{
    cloudinary_public_id: string;
    cloudinary_url: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Get project data
  const project = useQuery(
    api.projects.getProjectVerificationStatus,
    projectId ? { projectId: projectId as Id<'projects'> } : 'skip'
  );
  
  // Get project documents
  const projectDocuments = useQuery(
    api.documents.getDocumentsByEntity,
    projectId ? { 
      entityId: projectId as string,
      entityType: 'project' as const
    } : 'skip'
  );

  // Mutation for updating project
  const updateProjectMutation = useMutation(api.projects.updateProject);
  
  // Mutation for deleting documents
  const deleteDocumentMutation = useMutation(api.documents.deleteDocument);

  // Actions and mutations for file uploads
  const generateUploadUrlAction = useAction(api.projects.generateUploadUrl);
  const getStorageUrl = useAction(api.projects.getStorageUrl);
  const uploadDocumentMutation = useMutation(
    api.projects.uploadProjectDocument
  );

  // Populate form data when project loads
  useEffect(() => {
    if (project?.project) {
      const projectData = project.project;
      setFormData({
        title: projectData.title || '',
        description: projectData.description || '',
        projectType: projectData.projectType || '',
        location: projectData.location
          ? {
              name: projectData.location.name,
              coordinates: {
                lat: projectData.location.lat,
                lng: projectData.location.long,
              },
            }
          : { name: '', coordinates: { lat: 0, lng: 0 } },
        areaSize: projectData.areaSize || 0,
        budget: projectData.budget || 0,
        estimatedCO2Reduction: projectData.estimatedCO2Reduction || 0,
        totalCarbonCredits: projectData.totalCarbonCredits || 0,
        pricePerCredit: projectData.pricePerCredit || 0,
        startDate: projectData.startDate,
        expectedCompletionDate: projectData.expectedCompletionDate,
      });

      // Populate images and documents
      setProjectImages(projectData.projectImages || []);
      setFeaturedImage(projectData.featuredImage || null);
      
      // Load Convex URLs for existing images
      if (projectData.projectImages) {
        const loadImageUrls = async () => {
          for (const image of projectData.projectImages) {
            if (image.cloudinary_public_id && (image.cloudinary_url.startsWith('storage://') || !image.cloudinary_url.startsWith('http'))) {
              try {
                // For existing images, get the URL from Convex storage
                const storageId = image.cloudinary_public_id;
                
                // Set loading state
                setLoadingImageUrls(prev => ({
                  ...prev,
                  [storageId]: true
                }));
                
                const url = await getStorageUrl({ storageId });
                if (url) {
                  setConvexImageUrls(prev => ({
                    ...prev,
                    [storageId]: url
                  }));
                }
              } catch (error) {
                console.error('Failed to load image URL for storageId:', image.cloudinary_public_id, error);
              } finally {
                // Clear loading state
                setLoadingImageUrls(prev => ({
                  ...prev,
                  [image.cloudinary_public_id]: false
                }));
              }
            } else if (image.cloudinary_url && image.cloudinary_url.startsWith('http')) {
              // If it's already a valid URL, use it directly
              setConvexImageUrls(prev => ({
                ...prev,
                [image.cloudinary_public_id]: image.cloudinary_url
              }));
            }
          }
        };
        loadImageUrls();
      }
    }
  }, [project]);
  
  // Load and categorize existing documents
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
      
      // Load document URLs from Convex storage
      const loadDocumentUrls = async () => {
        for (const doc of projectDocuments) {
          if (doc.media?.cloudinary_public_id && (doc.media.cloudinary_url.startsWith('storage://') || !doc.media.cloudinary_url.startsWith('http'))) {
            try {
              const storageId = doc.media.cloudinary_public_id;
              
              // Set loading state
              setLoadingDocumentUrls(prev => ({
                ...prev,
                [storageId]: true
              }));
              
              const url = await getStorageUrl({ storageId });
              if (url) {
                setConvexDocumentUrls(prev => ({
                  ...prev,
                  [storageId]: url
                }));
              }
            } catch (error) {
              console.error('Failed to load document URL for storageId:', doc.media.cloudinary_public_id, error);
            } finally {
              // Clear loading state
              setLoadingDocumentUrls(prev => ({
                ...prev,
                [doc.media.cloudinary_public_id]: false
              }));
            }
          } else if (doc.media?.cloudinary_url && doc.media.cloudinary_url.startsWith('http')) {
            // If it's already a valid URL, use it directly
            setConvexDocumentUrls(prev => ({
              ...prev,
              [doc.media.cloudinary_public_id]: doc.media.cloudinary_url
            }));
          }
        }
      };
      loadDocumentUrls();
    }
  }, [projectDocuments, getStorageUrl]);

  // Authentication check
  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to sign in to access this page.
            </p>
            <button
              onClick={() => router.push('/sign-in')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateImageFile = (file: File): string | null => {
    if (!file.type.includes('png')) {
      return 'Only PNG files are allowed for images';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'Image file size must be less than 10MB';
    }
    return null;
  };

  const validateDocumentFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, DOC, and DOCX files are allowed for documents';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'Document file size must be less than 10MB';
    }
    return null;
  };

  const validateImageFile2 = (file: File): string | null => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only PNG, JPG, and JPEG files are allowed for images';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'Image file size must be less than 10MB';
    }
    return null;
  };

  const handleImageUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        const error = validateImageFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        alert('Image upload errors:\n' + errors.join('\n'));
      }

      for (const file of validFiles) {
        try {
          const uploadUrl = await generateUploadUrlAction();
          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: file,
            headers: { 'Content-Type': file.type },
          });

          if (!response.ok) throw new Error('Failed to upload file to storage');

          const { storageId } = await response.json();
          
          const reader = new FileReader();
          reader.onload = (e) => {
            const previewUrl = e.target?.result as string;
            setUploadedImagePreviews(prev => ({
              ...prev,
              [storageId]: previewUrl
            }));
          };
          reader.readAsDataURL(file);
          
          const newImage = {
            cloudinary_public_id: storageId,
            cloudinary_url: `storage://${storageId}`,
            caption: '',
            isPrimary: projectImages.length === 0,
            uploadDate: Date.now(),
          };
          
          setProjectImages(prev => [...prev, newImage]);
          
          if (projectImages.length === 0) {
            setFeaturedImage({
              cloudinary_public_id: newImage.cloudinary_public_id,
              cloudinary_url: newImage.cloudinary_url,
            });
          }
        } catch (error) {
          console.error(`Failed to upload image ${file.name}:`, error);
          errors.push(`${file.name}: Upload failed`);
        }
      }
      
      if (errors.length > 0) {
        alert('Some images failed to upload:\n' + errors.join('\n'));
      }
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSpecificDocumentUpload = (
    files: File[],
    documentType: 'projectProposal' | 'environmentalAssessment' | 'sitePhotographs' | 'legalPermits'
  ) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      let error: string | null = null;
      
      if (documentType === 'sitePhotographs') {
        error = validateImageFile2(file);
      } else {
        error = validateDocumentFile(file);
      }
      
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      const documentTypeNames = {
        projectProposal: 'Project Proposal',
        environmentalAssessment: 'Environmental Assessment',
        sitePhotographs: 'Site Photographs',
        legalPermits: 'Legal Permits'
      };
      alert(`${documentTypeNames[documentType]} upload errors:\n` + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setTempUploadedFiles(prev => [...prev, ...validFiles]);
      
      const newDocuments = validFiles.map(file => ({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: documentType === 'sitePhotographs' 
          ? file.type.split('/')[1]?.toUpperCase()
          : file.type.includes('pdf') ? 'PDF' : 'DOC',
      }));
      
      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: [...prev[documentType], ...newDocuments]
      }));
    }
  };

  const handleSetFeaturedImage = async (image: {
    cloudinary_public_id: string;
    cloudinary_url: string;
  }) => {
    try {
      await updateProjectMutation({
        projectId: projectId as Id<'projects'>,
        featuredImage: image,
      });
      setFeaturedImage(image);
      alert('Featured image updated successfully!');
    } catch (error) {
      console.error('Error setting featured image:', error);
      alert('Failed to set featured image. Please try again.');
    }
  };

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

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic Information validation
    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.description.trim())
      newErrors.description = 'Project description is required';
    if (!formData.projectType)
      newErrors.projectType = 'Project type is required';
    if (formData.totalCarbonCredits <= 0)
      newErrors.totalCarbonCredits =
        'Total carbon credits must be greater than 0';

    // Project Timeline validation
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.expectedCompletionDate)
      newErrors.expectedCompletionDate = 'Expected completion date is required';
    if (formData.startDate && formData.expectedCompletionDate) {
      if (
        new Date(formData.startDate) >=
        new Date(formData.expectedCompletionDate)
      ) {
        newErrors.expectedCompletionDate =
          'Completion date must be after start date';
      }
    }

    // Location & Details validation
    if (!formData.location.name.trim())
      newErrors.location = 'Location is required';
    if (formData.areaSize <= 0)
      newErrors.areaSize = 'Area size must be greater than 0';
    if (formData.estimatedCO2Reduction <= 0)
      newErrors.estimatedCO2Reduction = 'CO2 reduction must be greater than 0';
    if (formData.budget <= 0)
      newErrors.budget = 'Budget must be greater than 0';
    if (formData.pricePerCredit <= 0)
      newErrors.pricePerCredit = 'Price per credit must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updateProjectMutation({
        projectId: projectId as Id<'projects'>,
        ...formData,
        location: {
          name: formData.location.name,
          lat: formData.location.coordinates.lat,
          long: formData.location.coordinates.lng,
        },
        startDate: formData.startDate || undefined,
        expectedCompletionDate: formData.expectedCompletionDate || undefined,
        // Type cast projectType to the expected union type
        projectType: formData.projectType as
          | 'reforestation'
          | 'solar'
          | 'wind'
          | 'biogas'
          | 'waste_management'
          | 'mangrove_restoration'
          | undefined,
      });

      alert('Project updated successfully!');
      router.push(`/projects/details/${projectId}`);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}
          >
            <span>
              {selectedProject.status === 'approved'
                ? '✓'
                : selectedProject.status === 'under_review'
                  ? '⏳'
                  : selectedProject.status === 'draft'
                    ? '📝'
                    : selectedProject.status === 'rejected'
                      ? '❌'
                      : selectedProject.status === 'active'
                        ? '🔄'
                        : selectedProject.status === 'completed'
                          ? '✅'
                          : selectedProject.status === 'suspended'
                            ? '⏸️'
                            : '📄'}
            </span>
            {selectedProject.status?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Enhanced Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Featured Image - Display Only */}
          <div className="lg:col-span-2">
            {selectedProject.featuredImage ? (
              <div className="relative group">
                <img
                  src={selectedProject.featuredImage.cloudinary_url}
                  alt={selectedProject.title}
                  className="w-full h-80 object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-800">
                      Featured Image
                    </p>
                    <p className="text-xs text-gray-600">
                      Image management coming soon
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
                    Image upload coming soon
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Project Info - Form Fields */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 h-full border border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Project Information
                  </h3>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange('title', e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Enter project title"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Description *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange('description', e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Describe your carbon credit project"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Project Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Type *
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) =>
                        handleInputChange('projectType', e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.projectType ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      <option value="">Select project type</option>
                      <option value="reforestation">Reforestation</option>
                      <option value="solar">Solar Energy</option>
                      <option value="wind">Wind Energy</option>
                      <option value="biogas">Biogas</option>
                      <option value="waste_management">Waste Management</option>
                      <option value="mangrove_restoration">
                        Mangrove Restoration
                      </option>
                    </select>
                    {errors.projectType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.projectType}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Location */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={formData.location.name}
              onChange={(e) =>
                handleInputChange('location', {
                  ...formData.location,
                  name: e.target.value,
                })
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.location ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter project location"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Area Size */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Size (hectares) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.areaSize}
              onChange={(e) =>
                handleInputChange('areaSize', parseFloat(e.target.value) || 0)
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.areaSize ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="0.00"
            />
            {errors.areaSize && (
              <p className="text-red-500 text-sm mt-1">{errors.areaSize}</p>
            )}
          </div>

          {/* Budget */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget (Rs.) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.budget}
              onChange={(e) =>
                handleInputChange('budget', parseFloat(e.target.value) || 0)
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.budget ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="0.00"
            />
            {errors.budget && (
              <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
            )}
          </div>

          {/* CO2 Reduction */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CO2 Reduction (t/y) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.estimatedCO2Reduction}
              onChange={(e) =>
                handleInputChange(
                  'estimatedCO2Reduction',
                  parseFloat(e.target.value) || 0
                )
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.estimatedCO2Reduction ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="0.00"
            />
            {errors.estimatedCO2Reduction && (
              <p className="text-red-500 text-sm mt-1">
                {errors.estimatedCO2Reduction}
              </p>
            )}
          </div>

          {/* Total Carbon Credits */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Carbon Credits *
            </label>
            <input
              type="number"
              value={formData.totalCarbonCredits}
              onChange={(e) =>
                handleInputChange(
                  'totalCarbonCredits',
                  parseInt(e.target.value) || 0
                )
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.totalCarbonCredits ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="0"
            />
            {errors.totalCarbonCredits && (
              <p className="text-red-500 text-sm mt-1">
                {errors.totalCarbonCredits}
              </p>
            )}
          </div>

          {/* Price Per Credit */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Credit (Rs.) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.pricePerCredit}
              onChange={(e) =>
                handleInputChange(
                  'pricePerCredit',
                  parseFloat(e.target.value) || 0
                )
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.pricePerCredit ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="0.00"
            />
            {errors.pricePerCredit && (
              <p className="text-red-500 text-sm mt-1">
                {errors.pricePerCredit}
              </p>
            )}
          </div>
        </div>

        {/* Project Images Management */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-xl text-white">🖼️</span>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">
                  Project Images
                </h4>
                <p className="text-gray-600">
                  Manage your project images and set featured image
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    handleImageUpload(files);
                  }
                }}
                className="hidden"
                disabled={isUploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </button>
            </div>
          </div>

          {projectImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {projectImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100 hover:border-blue-300 transition-all duration-300">
                    {loadingImageUrls[image.cloudinary_public_id] ? (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : uploadedImagePreviews[image.cloudinary_public_id] || convexImageUrls[image.cloudinary_public_id] ? (
                      <img
                        src={uploadedImagePreviews[image.cloudinary_public_id] || convexImageUrls[image.cloudinary_public_id] || image.cloudinary_url}
                        alt={image.caption || `Project image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-2xl flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                        <button
                          onClick={() => {
                            setFeaturedImage({
                              cloudinary_public_id: image.cloudinary_public_id,
                              cloudinary_url: image.cloudinary_url,
                            });
                          }}
                          className={`px-2 py-1 text-xs rounded ${
                            image.isPrimary ||
                            featuredImage?.cloudinary_public_id ===
                              image.cloudinary_public_id
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-800'
                          }`}
                        >
                          {image.isPrimary ||
                          featuredImage?.cloudinary_public_id ===
                            image.cloudinary_public_id
                            ? 'Featured'
                            : 'Set Featured'}
                        </button>
                        <button
                          onClick={() => {
                            // Remove image and its preview
                            const imageToRemove = projectImages[index];
                            setProjectImages((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                            // Clean up preview
                            setUploadedImagePreviews(prev => {
                              const newPreviews = { ...prev };
                              delete newPreviews[imageToRemove?.cloudinary_public_id ?? ""];
                              return newPreviews;
                            });
                            // Clear featured image if it was the one being removed
                            if (featuredImage?.cloudinary_public_id === imageToRemove?.cloudinary_public_id) {
                              setFeaturedImage(null);
                            }
                          }}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  {(image.isPrimary || featuredImage?.cloudinary_public_id === image.cloudinary_public_id) && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                      ⭐ Primary
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
        </div>

        {/* Required Documents Sections */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-xl text-white">📄</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">
                Required Documents
              </h4>
              <p className="text-gray-600">
                Upload project documentation by category
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Project Proposal Document */}
            <div className="border rounded-lg p-4">
              <h4 className="text-md font-medium mb-2">Project proposal document (PDF, DOC, and DOCX files)</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-3">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleSpecificDocumentUpload(files, 'projectProposal');
                    }
                  }}
                  className="hidden"
                  id="edit-project-proposal-upload"
                />
                <label htmlFor="edit-project-proposal-upload" className="cursor-pointer flex flex-col items-center">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-blue-600 hover:text-blue-800 text-sm">Click to upload</span>
                </label>
              </div>
              {uploadedDocuments.projectProposal.length > 0 && (
                <div className="space-y-2">
                  {uploadedDocuments.projectProposal.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                        <div>
                          <p className="text-xs font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setUploadedDocuments(prev => ({
                            ...prev,
                            projectProposal: prev.projectProposal.filter((_, i) => i !== index)
                          }));
                          setTempUploadedFiles(prev => prev.filter(file => file.name !== doc.name));
                        }}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {existingDocuments.projectProposal.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Existing files</h5>
                  <div className="space-y-2">
                    {existingDocuments.projectProposal.map((doc: any, index: number) => (
                      <div key={doc._id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                          <div className="min-w-0">
                            <a
                              href={convexDocumentUrls[doc.media?.cloudinary_public_id] || doc.media?.cloudinary_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-blue-600 hover:underline truncate block"
                              title={doc.originalName || doc.fileName}
                            >
                              {doc.originalName || doc.fileName}
                            </a>
                            <p className="text-[10px] text-gray-500">
                              {doc.fileType} • {doc.fileSizeFormatted} {doc.isVerified ? '• Verified' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Environmental Impact Assessment */}
            <div className="border rounded-lg p-4">
              <h4 className="text-md font-medium mb-2">Environmental impact assessment (PDF, DOC, and DOCX files)</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-3">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleSpecificDocumentUpload(files, 'environmentalAssessment');
                    }
                  }}
                  className="hidden"
                  id="edit-environmental-assessment-upload"
                />
                <label htmlFor="edit-environmental-assessment-upload" className="cursor-pointer flex flex-col items-center">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-blue-600 hover:text-blue-800 text-sm">Click to upload</span>
                </label>
              </div>
              {uploadedDocuments.environmentalAssessment.length > 0 && (
                <div className="space-y-2">
                  {uploadedDocuments.environmentalAssessment.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                        <div>
                          <p className="text-xs font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setUploadedDocuments(prev => ({
                            ...prev,
                            environmentalAssessment: prev.environmentalAssessment.filter((_, i) => i !== index)
                          }));
                          setTempUploadedFiles(prev => prev.filter(file => file.name !== doc.name));
                        }}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {existingDocuments.environmentalAssessment.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Existing files</h5>
                  <div className="space-y-2">
                    {existingDocuments.environmentalAssessment.map((doc: any, index: number) => (
                      <div key={doc._id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                          <div className="min-w-0">
                            <a
                              href={convexDocumentUrls[doc.media?.cloudinary_public_id] || doc.media?.cloudinary_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-blue-600 hover:underline truncate block"
                              title={doc.originalName || doc.fileName}
                            >
                              {doc.originalName || doc.fileName}
                            </a>
                            <p className="text-[10px] text-gray-500">
                              {doc.fileType} • {doc.fileSizeFormatted} {doc.isVerified ? '• Verified' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Site Photographs */}
            <div className="border rounded-lg p-4">
              <h4 className="text-md font-medium mb-2">Site photographs (Images)</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-3">
                <input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleSpecificDocumentUpload(files, 'sitePhotographs');
                    }
                  }}
                  className="hidden"
                  id="edit-site-photographs-upload"
                />
                <label htmlFor="edit-site-photographs-upload" className="cursor-pointer flex flex-col items-center">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-blue-600 hover:text-blue-800 text-sm">Click to upload</span>
                </label>
              </div>
              {uploadedDocuments.sitePhotographs.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {uploadedDocuments.sitePhotographs.map((doc, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded border flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <button
                          onClick={() => {
                            setUploadedDocuments(prev => ({
                              ...prev,
                              sitePhotographs: prev.sitePhotographs.filter((_, i) => i !== index)
                            }));
                            setTempUploadedFiles(prev => prev.filter(file => file.name !== doc.name));
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{doc.name}</p>
                      <p className="text-xs text-center text-gray-500">{doc.type} • {doc.size}</p>
                    </div>
                  ))}
                </div>
              )}

              {existingDocuments.sitePhotographs.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Existing photographs</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {existingDocuments.sitePhotographs.map((doc: any, index: number) => (
                      <a
                        key={doc._id || index}
                        href={convexDocumentUrls[doc.media?.cloudinary_public_id] || doc.media?.cloudinary_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group"
                      >
                        <div className="aspect-square bg-gray-100 rounded border overflow-hidden">
                          {(convexDocumentUrls[doc.media?.cloudinary_public_id] || doc.media?.cloudinary_url) ? (
                            <img
                              src={convexDocumentUrls[doc.media?.cloudinary_public_id] || doc.media?.cloudinary_url}
                              alt={doc.originalName || `Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-center mt-1 truncate">{doc.originalName || doc.fileName}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Legal Permits and Certifications */}
            <div className="border rounded-lg p-4">
              <h4 className="text-md font-medium mb-2">Legal permits and certifications (PDF, DOC, and DOCX files)</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-3">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleSpecificDocumentUpload(files, 'legalPermits');
                    }
                  }}
                  className="hidden"
                  id="edit-legal-permits-upload"
                />
                <label htmlFor="edit-legal-permits-upload" className="cursor-pointer flex flex-col items-center">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-blue-600 hover:text-blue-800 text-sm">Click to upload</span>
                </label>
              </div>
              {uploadedDocuments.legalPermits.length > 0 && (
                <div className="space-y-2">
                  {uploadedDocuments.legalPermits.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                        <div>
                          <p className="text-xs font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setUploadedDocuments(prev => ({
                            ...prev,
                            legalPermits: prev.legalPermits.filter((_, i) => i !== index)
                          }));
                          setTempUploadedFiles(prev => prev.filter(file => file.name !== doc.name));
                        }}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {existingDocuments.legalPermits.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Existing files</h5>
                  <div className="space-y-2">
                    {existingDocuments.legalPermits.map((doc: any, index: number) => (
                      <div key={doc._id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                          <div className="min-w-0">
                            <a
                              href={convexDocumentUrls[doc.media?.cloudinary_public_id] || doc.media?.cloudinary_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-blue-600 hover:underline truncate block"
                              title={doc.originalName || doc.fileName}
                            >
                              {doc.originalName || doc.fileName}
                            </a>
                            <p className="text-[10px] text-gray-500">
                              {doc.fileType} • {doc.fileSizeFormatted} {doc.isVerified ? '• Verified' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Overall Upload Status */}
            {tempUploadedFiles.length > 0 && (
              <div className="text-sm text-green-600 p-3 bg-green-50 rounded-lg border border-green-200">
                ✓ {tempUploadedFiles.length} file{tempUploadedFiles.length !== 1 ? 's' : ''} ready to upload
              </div>
            )}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-xl text-white">⏰</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">
                Project Timeline
              </h4>
              <p className="text-gray-600">
                Set your project start and completion dates
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            {/* Expected Completion Date */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Completion Date
              </label>
              <input
                type="date"
                value={formData.expectedCompletionDate}
                onChange={(e) =>
                  handleInputChange('expectedCompletionDate', e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.expectedCompletionDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.expectedCompletionDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
