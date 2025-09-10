import React from 'react';
import { File as FileIcon, X } from 'lucide-react';

interface UploadedFile {
  fileId: string;
  filename: string;
}

interface FilePreviewProps {
  files: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemoveFile }) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="pb-2">
      <div className="flex items-center gap-2 overflow-x-auto p-2 bg-gray-100 rounded-lg">
        {files.map((file) => (
          <div
            key={file.fileId}
            className="flex-shrink-0 flex items-center gap-2 bg-gray-200 text-black text-sm font-medium px-3 py-2 rounded-full animate-in fade-in"
          >
            <FileIcon className="w-4 h-4 text-black" />
            <span className="max-w-xs truncate" title={file.filename}>
              {file.filename}
            </span>
            <button
              onClick={() => onRemoveFile(file.fileId)}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-300 rounded-full p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilePreview;
