'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, AlertCircle, X } from 'lucide-react';

interface FileUploadProgress {
  fileName: string;
  progress: number;
  speed: number;
  timeRemaining: number;
  size: number;
  uploaded: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileUploadContextType {
  uploads: Record<string, FileUploadProgress>;
  startUpload: (fileId: string, fileName: string, size: number) => void;
  updateProgress: (fileId: string, progress: number, uploaded: number, speed: number, timeRemaining: number) => void;
  setError: (fileId: string, error: string) => void;
  completeUpload: (fileId: string) => void;
  removeUpload: (fileId: string) => void;
}

const FileUploadContext = createContext<FileUploadContextType | undefined>(undefined);

export const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error('useFileUpload debe usarse dentro de un FileUploadProvider');
  }
  return context;
};

export const FileUploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uploads, setUploads] = useState<Record<string, FileUploadProgress>>({});

  const startUpload = (fileId: string, fileName: string, size: number) => {
    setUploads(prev => ({
      ...prev,
      [fileId]: {
        fileName,
        progress: 0,
        speed: 0,
        timeRemaining: 0,
        size,
        uploaded: 0,
        status: 'uploading'
      }
    }));
  };

  const updateProgress = (fileId: string, progress: number, uploaded: number, speed: number, timeRemaining: number) => {
    setUploads(prev => {
      if (!prev[fileId]) return prev;
      return {
        ...prev,
        [fileId]: {
          ...prev[fileId],
          progress,
          speed,
          timeRemaining,
          uploaded
        }
      };
    });
  };

  const setError = (fileId: string, error: string) => {
    setUploads(prev => {
      if (!prev[fileId]) return prev;
      return {
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'error',
          error
        }
      };
    });
  };

  const completeUpload = (fileId: string) => {
    setUploads(prev => {
      if (!prev[fileId]) return prev;
      return {
        ...prev,
        [fileId]: {
          ...prev[fileId],
          progress: 100,
          status: 'completed'
        }
      };
    });

    // Remover la carga completada después de 3 segundos
    setTimeout(() => {
      removeUpload(fileId);
    }, 3000);
  };

  const removeUpload = (fileId: string) => {
    setUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[fileId];
      return newUploads;
    });
  };

  return (
    <FileUploadContext.Provider value={{ uploads, startUpload, updateProgress, setError, completeUpload, removeUpload }}>
      {children}
      <FileUploadStatusDisplay uploads={uploads} removeUpload={removeUpload} />
    </FileUploadContext.Provider>
  );
};

// Componente que muestra el estado de las cargas
const FileUploadStatusDisplay: React.FC<{ 
  uploads: Record<string, FileUploadProgress>,
  removeUpload: (fileId: string) => void
}> = ({ uploads, removeUpload }) => {
  const activeUploads = Object.keys(uploads).length;

  if (activeUploads === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-sm">Cargas activas ({activeUploads})</h3>
      </div>

      <div className="space-y-3">
        {Object.entries(uploads).map(([fileId, upload]) => (
          <div key={fileId} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 mb-2">
                <UploadCloud className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium truncate max-w-[180px]">{upload.fileName}</span>
              </div>
              <button 
                onClick={() => removeUpload(fileId)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {upload.status === 'error' ? (
              <Alert variant="destructive" className="p-2 mt-1">
                <AlertCircle className="h-3 w-3" />
                <AlertTitle className="text-xs">Error</AlertTitle>
                <AlertDescription className="text-xs">
                  {upload.error || 'Error al subir el archivo'}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Progress value={upload.progress} className="h-2 mb-1" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {upload.status === 'completed' ? 'Completado' : `${upload.progress}%`}
                  </span>
                  {upload.status === 'uploading' && (
                    <span>
                      {(upload.uploaded / (1024 * 1024)).toFixed(1)}/{(upload.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  )}
                </div>
                {upload.status === 'uploading' && upload.speed > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{upload.speed.toFixed(1)} MB/s</span>
                    <span>
                      {upload.timeRemaining > 60 
                        ? `${Math.ceil(upload.timeRemaining / 60)} min restantes`
                        : `${Math.ceil(upload.timeRemaining)} s restantes`}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploadProvider; 