'use client';

import { PlaceholderPlugin, UploadErrorCode } from '@platejs/media/react';
import { usePluginOption } from 'platejs/react';
import * as React from 'react';
import { toast } from 'sonner';

export function MediaUploadToast() {
  useUploadErrorToast();

  return null;
}

const useUploadErrorToast = () => {
  const uploadError = usePluginOption(PlaceholderPlugin, 'error');

  React.useEffect(() => {
    if (!uploadError) return;

    const { code, data } = uploadError;

    switch (code) {
      case UploadErrorCode.INVALID_FILE_SIZE: {
        toast.error(
          `文件大小无效: ${data.files.map((f) => f.name).join(', ')}`,
        );

        break;
      }
      case UploadErrorCode.INVALID_FILE_TYPE: {
        toast.error(
          `文件类型无效: ${data.files.map((f) => f.name).join(', ')}`,
        );

        break;
      }
      case UploadErrorCode.TOO_LARGE: {
        toast.error(
          `文件大小超过上限 ${data.maxFileSize}: ${data.files.map((f) => f.name).join(', ')}`,
        );

        break;
      }
      case UploadErrorCode.TOO_LESS_FILES: {
        toast.error(`${data.fileType} 文件数量至少为 ${data.minFileCount}`);

        break;
      }
      case UploadErrorCode.TOO_MANY_FILES: {
        toast.error(
          `${data.fileType ? `${data.fileType} ` : ''}文件数量最多为 ${data.maxFileCount}`,
        );

        break;
      }
    }
  }, [uploadError]);
};
