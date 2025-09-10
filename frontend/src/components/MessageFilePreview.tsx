import React from 'react';
import { File as FileIcon } from 'lucide-react';

interface MessageFile {
  filename: string;
}

interface MessageFilePreviewProps {
  files: MessageFile[];
}

const MessageFilePreview: React.FC<MessageFilePreviewProps> = ({ files }) => {
  return (
    <div className="mb-2 group">
      {/* Custom scrollbar styling for this specific component */}
      <style>
        {`
          .file-preview-scrollbar::-webkit-scrollbar {
            height: 4px;
          }
          .file-preview-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .file-preview-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
          }
          .file-preview-scrollbar:hover::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
          }
        `}
      </style>
      <div className="file-preview-scrollbar flex w-full items-center gap-2 overflow-x-auto p-2 -mx-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="
              flex-shrink-0 
              flex items-center gap-2 
              bg-white/20
              border border-white/30
              text-gray-200 
              text-xs font-medium 
              px-3 py-1.5 
              rounded-full 
            "
            title={file.filename}
          >
            <FileIcon className="w-4 h-4 text-white" />
            <span className="max-w-[200px] truncate">
              {file.filename}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageFilePreview;
