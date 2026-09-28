import { uploadCreate } from '@/api/gen/endpoints/upload/upload';
import type { UploadFileUrl } from '@/api/gen/models';
import { toastErrorMessage } from '@/lib/error-message';
import * as React from 'react';

export type UploadedFile = UploadFileUrl & { name: string };

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setUploadingFile(file);
    setProgress(0);

    try {
      const res = await uploadCreate(
        { file },
        {
          onUploadProgress: ({ progress }) =>
            setProgress(Math.min((progress ?? 0) * 100, 100)),
        },
      );
      const result = { ...res, name: file.name };
      setUploadedFile(result);
      onUploadComplete?.(result);
      return uploadedFile;
    } catch (error) {
      toastErrorMessage(error);
      onUploadError?.(error);
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile,
    uploadingFile,
  };
}
