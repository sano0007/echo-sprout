'use client';

import { useState, useRef, useCallback } from 'react';

interface FileWithStatus {
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress?: number;
  description?: string;
}

interface DocumentUploadProps {
  documentType:
    | 'project_proposal'
    | 'environmental_impact'
    | 'site_photographs'
    | 'legal_permits'
    | 'featured_images'
    | 'site_images';
  projectId: string;
  uploadMode: 'immediate' | 'deferred';
  onFilesReady?: (files: FileWithStatus[]) => void;
}

const DOCUMENT_CONFIG = {
  project_proposal: {
    title: 'Project Proposal Document',
    description: 'Upload your comprehensive project proposal document',
    required: true,
    maxFiles: 1,
    acceptedTypes: '.pdf,.doc,.docx',
    acceptedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  environmental_impact: {
    title: 'Environmental Impact Assessment',
    description: 'Upload environmental impact assessment documents',
    required: true,
    maxFiles: 3,
    acceptedTypes: '.pdf,.doc,.docx',
    acceptedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  site_photographs: {
    title: 'Site Photographs',
    description: 'Upload current site photographs (up to 6 images)',
    required: false,
    maxFiles: 6,
    acceptedTypes: '.jpg,.jpeg,.png,.webp',
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  legal_permits: {
    title: 'Legal Permits and Certifications',
    description: 'Upload all required legal documents and permits',
    required: true,
    maxFiles: 5,
    acceptedTypes: '.pdf,.doc,.docx',
    acceptedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  featured_images: {
    title: 'Featured Project Images',
    description: 'Upload up to 3 high-quality images to represent your project',
    required: false,
    maxFiles: 3,
    acceptedTypes: '.jpg,.jpeg,.png,.webp',
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  site_images: {
    title: 'Site Images',
    description: 'Upload general site images (up to 6 images)',
    required: false,
    maxFiles: 6,
    acceptedTypes: '.jpg,.jpeg,.png,.webp',
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
};

export default function DocumentUpload({
  documentType,
  projectId,
  uploadMode,
  onFilesReady,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = DOCUMENT_CONFIG[documentType];

  // Handle file validation
  const validateFile = (file: File): string | null => {
    if (!config.acceptedMimeTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please upload ${config.acceptedTypes} files.`;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size exceeds 10MB limit.';
    }

    return null;
  };

  // Handle file addition
  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validatedFiles: FileWithStatus[] = [];

      for (const file of newFiles) {
        // Check file limit
        if (files.length + validatedFiles.length >= config.maxFiles) {
          break;
        }

        const error = validateFile(file);
        if (!error) {
          validatedFiles.push({
            file,
            status: 'pending',
            progress: 0,
          });
        }
      }

      if (validatedFiles.length > 0) {
        const updatedFiles = [...files, ...validatedFiles];
        setFiles(updatedFiles);

        if (onFilesReady) {
          onFilesReady(updatedFiles);
        }
      }
    },
    [files, config.maxFiles, onFilesReady]
  );

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);

    if (onFilesReady) {
      onFilesReady(updatedFiles);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUploadMore = files.length < config.maxFiles;

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {config.title}
            {config.required && <span className="text-red-500">*</span>}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
        </div>
        <div className="text-sm text-gray-500">
          {files.length}/{config.maxFiles} files
        </div>
      </div>

      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={config.maxFiles > 1}
            accept={config.acceptedTypes}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="space-y-2">
            <div className="text-4xl text-gray-400">📁</div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Drop files here or click to browse
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {config.maxFiles - files.length} more file
              {config.maxFiles - files.length !== 1 ? 's' : ''} allowed
            </p>
            <p className="text-xs text-gray-400">
              Max 10MB per file • {config.acceptedTypes}
            </p>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((fileItem, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-blue-600">
                  {fileItem.file.type.startsWith('image/') ? '🖼️' : '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileItem.file.size)} • {fileItem.file.type}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    fileItem.status === 'pending'
                      ? 'bg-gray-400'
                      : fileItem.status === 'uploading'
                        ? 'bg-blue-500'
                        : fileItem.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                  }`}
                />
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {files.length > 0 && uploadMode === 'deferred' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            📋 {files.length} file{files.length !== 1 ? 's' : ''} ready for
            upload. Files will be uploaded when you submit the project.
          </p>
        </div>
      )}
    </div>
  );
}
