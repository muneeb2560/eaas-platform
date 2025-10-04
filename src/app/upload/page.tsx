"use client";

import dynamic from 'next/dynamic';
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/lib/providers/SupabaseProvider';
import { useAsync } from '@/lib/hooks/useAsync';
import { useToast } from '@/lib/hooks/useToast';
import { useNotifications } from '@/lib/providers/NotificationProvider';
import { uploadSchema, type UploadFormData } from '@/lib/validations/schemas';
import { UPLOAD_CONSTRAINTS } from '@/lib/constants/app';
import { useRouter } from 'next/navigation';

interface UploadPreview {
  file: File;
  preview: string;
  validationErrors: string[];
}

interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  url: string;
  uploadedAt: string;
  type: string;
}

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [uploads, setUploads] = useState<UploadPreview[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [loadingFiles, setLoadingFiles] = useState(true);
  const { loading, error, execute } = useAsync<{ success: boolean; url: string; id: string }>();
  const { showSuccess, showError, showInfo } = useToast();
  const { addNotification } = useNotifications();

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch uploaded files on component mount
  const fetchUploadedFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/upload/list');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUploadedFiles(data.files);
        }
      }
    } catch (error) {
      console.error('Failed to fetch uploaded files:', error);
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    fetchUploadedFiles();
  }, [fetchUploadedFiles]);

  // Delete uploaded file
  const deleteUploadedFile = useCallback(async (fileId: string) => {
    try {
      const response = await fetch(`/api/upload/delete/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the uploaded files list
        await fetchUploadedFiles();
      } else {
        const error = await response.json();
        console.error('Failed to delete file:', error);
        alert('Failed to delete file: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    }
  }, [fetchUploadedFiles]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // Only process files on the client side
    if (typeof window === 'undefined') {
      console.warn('File drop attempted on server side, skipping');
      return;
    }

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      console.warn('Some files were rejected:', rejectedFiles);
    }

    // Process accepted files
    const newUploads: UploadPreview[] = acceptedFiles.map(file => {
      const validationErrors: string[] = [];
      
      // Validate file
      try {
        uploadSchema.parse({ file });
      } catch (error) {
        if (error instanceof Error) {
          validationErrors.push(error.message);
        } else {
          validationErrors.push('Unknown validation error');
        }
      }

      // Additional CSV validation
      if (file.name.toLowerCase().endsWith('.csv')) {
        if (file.size > UPLOAD_CONSTRAINTS.maxFileSize) {
          validationErrors.push(`File size exceeds ${UPLOAD_CONSTRAINTS.maxFileSize / 1024 / 1024}MB limit`);
        }
      }

      return {
        file,
        preview: URL.createObjectURL(file),
        validationErrors,
      };
    });

    setUploads(prev => [...prev, ...newUploads]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/jsonl': ['.jsonl'],
    },
    maxSize: UPLOAD_CONSTRAINTS.maxFileSize,
    multiple: true,
  });

  const removeFile = (index: number) => {
    if (typeof window === 'undefined') return;
    
    setUploads(prev => {
      const newUploads = [...prev];
      if (newUploads[index]?.preview) {
        URL.revokeObjectURL(newUploads[index].preview);
      }
      newUploads.splice(index, 1);
      return newUploads;
    });
  };

  const uploadFile = async (upload: UploadPreview, index: number) => {
    if (upload.validationErrors.length > 0) {
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, [upload.file.name]: 0 }));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[upload.file.name] || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [upload.file.name]: current + 10 };
        });
      }, 200);

      // Create FormData
      const formData = new FormData();
      formData.append('file', upload.file);
      // userId is now retrieved from the session on the server side

      // Upload to API
      console.log('🚀 Starting upload for file:', upload.file.name);
      const result = await execute(async () => {
        const response = await fetch('/api/upload/dataset', {
          method: 'POST',
          body: formData,
        });

        console.log('📡 Upload response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Upload failed with error:', errorText);
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Upload successful:', result);
        return result;
      });

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [upload.file.name]: 100 }));

      // Refresh the uploaded files list
      await fetchUploadedFiles();
      
      // Remove file from pending uploads after successful upload
      setTimeout(() => {
        removeFile(index);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[upload.file.name];
          return newProgress;
        });
      }, 1500); // Reduced delay and show success briefly

      // Show success toast and notification
      showSuccess('File Uploaded', `${upload.file.name} has been uploaded successfully.`);
      addNotification({
        type: 'success',
        title: 'Upload Complete',
        message: `${upload.file.name} (${formatFileSize(upload.file.size)}) uploaded successfully.`,
        action: {
          label: 'View Files',
          onClick: () => showInfo('Recent Uploads', 'Check the Recent Uploads section below.')
        }
      });

      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[upload.file.name];
        return newProgress;
      });
      
      // Show error toast and notification
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      showError('Upload Failed', `Failed to upload ${upload.file.name}: ${errorMessage}`);
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: `${upload.file.name} could not be uploaded. ${errorMessage}`,
        action: {
          label: 'Retry',
          onClick: () => uploadFile(upload, index)
        }
      });
    }
  };

  const uploadAllFiles = async () => {
    const validUploads = uploads.filter(upload => upload.validationErrors.length === 0);
    
    for (let i = 0; i < validUploads.length; i++) {
      const uploadIndex = uploads.findIndex(u => u.file.name === validUploads[i].file.name);
      await uploadFile(validUploads[i], uploadIndex);
    }
  };

  const getDropzoneStyles = () => {
    let baseStyles = "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer";
    
    if (isDragAccept) {
      baseStyles += " border-green-500 bg-green-500/10";
    } else if (isDragReject) {
      baseStyles += " border-red-500 bg-red-500/10";
    } else if (isDragActive) {
      baseStyles += " border-blue-500 bg-blue-500/10";
    } else {
      baseStyles += " border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50";
    }
    
    return baseStyles;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!mounted) {
    return (
      <DashboardLayout title="Upload Dataset">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <DashboardLayout title="Upload Dataset">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Dataset</h1>
          <p className="text-gray-300">
            Upload your evaluation datasets in CSV, JSON, or JSONL format. Maximum file size: {formatFileSize(UPLOAD_CONSTRAINTS.maxFileSize)}.
          </p>
        </div>

        {/* Upload Guidelines */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">📋 Upload Guidelines</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>CSV files should include headers: <code className="bg-gray-700 px-1 rounded">prompt, expected_output, context</code></span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>JSON/JSONL files should follow the schema: <code className="bg-gray-700 px-1 rounded">{"{ prompt, expected_output, context }"}</code></span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Maximum {UPLOAD_CONSTRAINTS.maxSamples.toLocaleString()} samples per dataset</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Supported formats: {UPLOAD_CONSTRAINTS.allowedTypes.join(', ')}</span>
            </li>
          </ul>
        </Card>

        {/* Dropzone */}
        <Card className="p-6 mb-6">
          <div {...getRootProps()} className={getDropzoneStyles()}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-1">
                  {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
                </p>
                <p className="text-gray-400">
                  or <span className="text-blue-400">click to browse</span>
                </p>
              </div>
              <p className="text-sm text-gray-500">
                CSV, JSON, JSONL up to {formatFileSize(UPLOAD_CONSTRAINTS.maxFileSize)}
              </p>
            </div>
          </div>
        </Card>

        {/* File List */}
        {uploads.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Files to Upload ({uploads.length})</h3>
              <div className="space-x-2">
                <Button
                  onClick={uploadAllFiles}
                  disabled={loading || uploads.every(u => u.validationErrors.length > 0)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Upload All'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUploads([])}
                  disabled={loading}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {uploads.map((upload, index) => (
                <div
                  key={`${upload.file.name}-${index}`}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-sm font-medium">
                          {upload.file.name.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{upload.file.name}</p>
                      <p className="text-gray-400 text-sm">{formatFileSize(upload.file.size)}</p>
                      {upload.validationErrors.length > 0 && (
                        <div className="mt-1">
                          {upload.validationErrors.map((error, errorIndex) => (
                            <p key={errorIndex} className="text-red-400 text-xs">⚠️ {error}</p>
                          ))}
                        </div>
                      )}
                      {uploadProgress[upload.file.name] !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[upload.file.name]}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">
                              {uploadProgress[upload.file.name]}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {upload.validationErrors.length === 0 && uploadProgress[upload.file.name] === undefined && (
                      <Button
                        size="sm"
                        onClick={() => uploadFile(upload, index)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Upload
                      </Button>
                    )}
                    {uploadProgress[upload.file.name] === 100 && (
                      <span className="text-green-400 text-sm">✓ Complete</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={loading && uploadProgress[upload.file.name] !== undefined}
                      className="text-gray-400 hover:text-red-400"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="p-4 mb-6 bg-red-900/20 border-red-500/30">
            <div className="flex items-center space-x-2 text-red-400">
              <span>⚠️</span>
              <span className="font-medium">Upload Error:</span>
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Recent Uploads */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Uploads</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUploadedFiles}
              disabled={loadingFiles}
              className="text-gray-400 hover:text-white"
            >
              {loadingFiles ? <LoadingSpinner size="sm" /> : '🔄'} Refresh
            </Button>
          </div>
          
          {loadingFiles ? (
            <div className="text-center py-8">
              <LoadingSpinner size="md" />
              <p className="text-gray-400 mt-2">Loading uploaded files...</p>
            </div>
          ) : uploadedFiles.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-gray-500">📁</span>
              </div>
              <p>No recent uploads found.</p>
              <p className="text-sm mt-1">Upload your first dataset to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-sm font-medium">
                          {file.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        <span>{new Date(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.open(file.url, '_blank');
                        }
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      📥 Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
                          deleteUploadedFile(file.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-400"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}