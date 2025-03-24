import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { useState } from 'react';

interface FileDropzoneCompressProps {
  files: File[];
  onDrop: (acceptedFiles: File[]) => void;
  onDelete: (index: number) => void;
  acceptedFileTypes: Record<string, string[]>;
  fileTypeDescription: string;
  message?: string;
}

export async function compressFiles(files: File[]): Promise<File> {
  const zip = new JSZip();
  files.forEach(file => {
    zip.file(file.name, file);
  });
  const content = await zip.generateAsync({ type: "blob" });
  return new File([content], "archivos.zip");
}

export function FileDropzoneCompress({
  files,
  onDrop,
  onDelete,
  acceptedFileTypes,
  fileTypeDescription,
  message = "Arrastra archivos aquí"
}: FileDropzoneCompressProps) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(file => {
          toast({
            title: "Se ha rechazado el archivo " + file.file.name,
            description: `Solo se permiten archivos ${fileTypeDescription}`,
            variant: "destructive",
          });
        });
      }
      onDrop(acceptedFiles);
    },
    accept: acceptedFileTypes,
    multiple: true,
    useFsAccessApi: false,
    noClick: files.length > 0
  });

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-4">
        {files.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {files.length > 6 ? (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-md">
                      <UploadCloud className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{files.length} archivos seleccionados</p>
                      <p className="text-xs text-gray-500">
                        {(files.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB en total
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-md">
                        <UploadCloud className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(index);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-6 w-6 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Agregar más archivos
                </p>
                <p className="text-xs text-gray-500">
                  Los archivos serán comprimidos al enviar
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <UploadCloud className="h-12 w-12 text-gray-400" />
              {isDragActive ? (
                <p className="text-sm text-gray-600">Suelta los archivos aquí...</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    {message}
                  </p>
                  <p className="text-xs uppercase text-gray-500 border p-2 rounded-md">
                    o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500">
                    Los archivos serán comprimidos al enviar
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {fileRejections.length > 0 && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
          Solo se permiten archivos {fileTypeDescription}. Los siguientes archivos fueron rechazados:
          <ul className="mt-1 list-disc list-inside">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name} - {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 