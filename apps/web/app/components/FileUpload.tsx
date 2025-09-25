'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { Id } from '@packages/backend/convex/_generated/dataModel';
import { X, Upload, FileText, Image, File } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  storageId?: string; // For immediate uploads
  fileUrl?: string; // URL for accessing the uploaded file
}

interface FileUploadProps {
  projectId: Id<'projects'> | '';
  onUploadComplete?: (fileIds: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  uploadMode?: 'immediate' | 'deferred';
  onFilesReady?: (files: UploadedFile[]) => void; // For deferred uploads
}

export default function FileUpload({
  projectId,
  onUploadComplete,
  maxFiles = 5,
  maxSizeMB = 50,
  acceptedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  uploadMode = 'immediate',
  onFilesReady,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useMutation(api.projects.uploadProjectDocument);
  const generateUploadUrlMutation = useAction(api.projects.generateUploadUrl);

  // Add debugging for the mutation
  console.log('Upload mutation:', uploadMutation);
  console.log('API object:', api);
  console.log('Projects API:', api.projects);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (fileType === 'application/pdf') return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `File type ${file.type} is not supported. Please upload PDF, JPG, PNG, or DOC files.`;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `File size exceeds ${maxSizeMB}MB limit.`;
      }
      if (uploadedFiles.length >= maxFiles) {
        return `Maximum ${maxFiles} files allowed.`;
      }
      return null;
    },
    [acceptedTypes, maxSizeMB, maxFiles, uploadedFiles.length]
  );

  const handleFiles = useCallback(
    (files: FileList) => {
      const newFiles: UploadedFile[] = [];

      Array.from(files).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          newFiles.push({
            id: Math.random().toString(36),
            file,
            progress: 0,
            status: 'error',
            error: validationError,
          });
        } else {
          newFiles.push({
            id: Math.random().toString(36),
            file,
            progress: 0,
            status: 'pending',
          });
        }
      });

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // For deferred uploads, notify parent component
      if (uploadMode === 'deferred' && onFilesReady) {
        const validFiles = newFiles.filter((f) => !f.error);
        onFilesReady(validFiles);
      }
    },
    [validateFile, uploadMode, onFilesReady]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const uploadFile = useCallback(
    async (uploadedFile: UploadedFile) => {
      // For deferred uploads, just mark as ready
      if (uploadMode === 'deferred' || projectId === '') {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'completed', progress: 100 }
              : f
          )
        );
        return uploadedFile.id;
      }

      // For immediate uploads, proceed with actual upload
      try {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'uploading', progress: 0 }
              : f
          )
        );

        // Step 1: Get upload URL
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'uploading', progress: 25 }
              : f
          )
        );

        const uploadUrl = await generateUploadUrlMutation();
        console.log('Generated upload URL:', uploadUrl);

        // Step 2: Upload file to the URL
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'uploading', progress: 50 }
              : f
          )
        );

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: uploadedFile.file,
          headers: {
            'Content-Type': uploadedFile.file.type,
          },
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const { storageId } = await response.json();
        console.log('File uploaded successfully, storage ID:', storageId);

        // Step 3: Store document metadata in database
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'uploading', progress: 75 }
              : f
          )
        );

        const result = await uploadMutation({
          projectId: projectId as Id<'projects'>,
          fileName: uploadedFile.file.name,
          fileType: uploadedFile.file.type,
          storageId: storageId,
        });

        console.log('Document metadata stored:', result);

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  status: 'completed',
                  progress: 100,
                  storageId: result.storageId,
                  fileUrl: result.fileUrl,
                }
              : f
          )
        );

        return result.storageId;
      } catch (error) {
        console.error('Upload error:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          projectId,
          fileName: uploadedFile.file.name,
          fileType: uploadedFile.file.type,
          fileSize: uploadedFile.file.size,
        });
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  status: 'error',
                  error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                }
              : f
          )
        );
        return null;
      }
    },
    [projectId, uploadMutation, generateUploadUrlMutation, uploadMode]
  );

  const uploadAllFiles = useCallback(async () => {
    // For deferred uploads, just mark all files as ready
    if (uploadMode === 'deferred') {
      setUploadedFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: 'completed' as const,
          progress: 100,
        }))
      );

      if (onFilesReady) {
        const validFiles = uploadedFiles.filter((f) => f.status === 'pending');
        onFilesReady(validFiles);
      }
      return;
    }

    // For immediate uploads, proceed with actual uploads
    const pendingFiles = uploadedFiles.filter((f) => f.status === 'pending');
    const uploadedFileIds: string[] = [];

    for (const file of pendingFiles) {
      const fileId = await uploadFile(file);
      if (fileId) {
        uploadedFileIds.push(fileId);
      }
    }

    if (onUploadComplete && uploadedFileIds.length > 0) {
      onUploadComplete(uploadedFileIds);
    }
  }, [uploadedFiles, uploadFile, onUploadComplete, uploadMode, onFilesReady]);

  const pendingCount = uploadedFiles.filter(
    (f) => f.status === 'pending'
  ).length;
  const completedCount = uploadedFiles.filter(
    (f) => f.status === 'completed'
  ).length;
  const errorCount = uploadedFiles.filter((f) => f.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">Drag and drop files here</p>
        <p className="text-gray-600 mb-4">or click to browse</p>
        <p className="text-sm text-gray-500">
          Supported formats: PDF, JPG, PNG, DOC (Max {maxSizeMB}MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Uploaded Files</h3>
            {pendingCount > 0 && (
              <button
                onClick={uploadAllFiles}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* File List */}
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center space-x-4 p-3 border rounded-lg"
              >
                {getFileIcon(uploadedFile.file.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  {uploadedFile.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                  {uploadedFile.error && (
                    <p className="text-sm text-red-500">{uploadedFile.error}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {uploadedFile.status === 'completed' && (
                    <span className="text-green-600 text-sm">✓</span>
                  )}
                  {uploadedFile.status === 'error' && (
                    <span className="text-red-600 text-sm">✗</span>
                  )}
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {(completedCount > 0 || errorCount > 0) && (
            <div className="text-sm text-gray-600">
              {completedCount > 0 &&
                `${completedCount} file${completedCount !== 1 ? 's' : ''} uploaded successfully`}
              {completedCount > 0 && errorCount > 0 && ', '}
              {errorCount > 0 &&
                `${errorCount} file${errorCount !== 1 ? 's' : ''} failed`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
