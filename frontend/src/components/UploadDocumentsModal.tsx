import React, { useState, useRef } from 'react';
import { X, Upload, File as FileIcon, Loader2, CheckCircle } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { useToast } from '../hooks/useToast';

interface UploadedFile {
  fileId: string;
  filename: string;
}

interface UploadDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUploaded: (files: UploadedFile[]) => void;
}

const UploadDocumentsModal: React.FC<UploadDocumentsModalProps> = ({
  isOpen,
  onClose,
  onFilesUploaded
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const MAX_FILES = 5;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (uploadedFiles.length + files.length > MAX_FILES) {
      addToast(`You can only upload up to ${MAX_FILES} files total.`, 'error');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data && response.data.files) {
        const newFiles = response.data.files;
        setUploadedFiles(prev => [...prev, ...newFiles]);
        addToast(`${newFiles.length} file(s) uploaded successfully!`, 'success');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response && axiosError.response.status === 413) {
        addToast('Upload failed: Total file size exceeds the 20MB limit.', 'error');
      } else {
        const message = axiosError.response?.data?.message || 'An unknown error occurred.';
        addToast(`Upload failed: ${message}`, 'error');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileIdToRemove: string) => {
    setUploadedFiles(prev => prev.filter(file => file.fileId !== fileIdToRemove));
  };

  const handleNext = () => {
    onFilesUploaded(uploadedFiles);
    onClose();
  };

  const handleClose = () => {
    setUploadedFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black">Upload Documents</h2>
              <p className="text-gray-600 mt-1">Upload up to 5 files to get started</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-black bg-gray-100'
                : uploadedFiles.length > 0
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              accept=".pdf,.txt,.md,.doc,.docx"
              disabled={isUploading || uploadedFiles.length >= MAX_FILES}
            />

            {isUploading ? (
              <div className="space-y-4">
                <Loader2 size={48} className="mx-auto text-black animate-spin" />
                <p className="text-gray-600 font-medium">Uploading files...</p>
              </div>
            ) : uploadedFiles.length > 0 ? (
              <div className="space-y-4">
                <CheckCircle size={48} className="mx-auto text-green-500" />
                <div>
                  <p className="text-green-600 font-semibold text-lg">
                    {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded successfully!
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    You can upload {MAX_FILES - uploadedFiles.length} more file{MAX_FILES - uploadedFiles.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload size={48} className="mx-auto text-gray-400" />
                <div>
                  <p className="text-black font-semibold text-lg">
                    Drop files here or click to browse
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Supports PDF, TXT, MD, DOC, DOCX files up to 20MB total
                  </p>
                </div>
              </div>
            )}

            {!isUploading && uploadedFiles.length < MAX_FILES && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
              >
                Choose Files
              </button>
            )}
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-black mb-4">Uploaded Files</h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.fileId}
                    className="flex items-center justify-between p-3 bg-gray-100 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <p className="font-medium text-black truncate max-w-xs" title={file.filename}>
                          {file.filename}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.fileId)}
                      className="p-1 hover:bg-red-100 rounded-lg transition-colors group"
                    >
                      <X size={16} className="text-gray-400 group-hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {uploadedFiles.length}/{MAX_FILES} files uploaded
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 text-gray-600 hover:text-black font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={uploadedFiles.length === 0}
                className="px-6 py-2 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentsModal;
