import { isAxiosError } from 'axios';
import { getErrorMessage as getErrorMessage_ } from 'react-error-boundary';
import { toast } from 'sonner';

function getAxiosErrorMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return;
  let message: string = '';
  if (error.response) {
    if (typeof error.response.data === 'string') {
      message = error.response.data.trim();
    } else if (
      typeof error.response.data === 'object' &&
      error.response.data !== null
    ) {
      if (typeof error.response.data.message === 'string') {
        message = error.response.data.message.trim();
      } else if (typeof error.response.data.detail === 'string') {
        message = error.response.data.detail.trim();
      }
    }
    if (!message) {
      message = `[Response Error] ${error.message}`.trim();
    }
  } else if (error.request) {
    message = `[Request Error] ${error.message}`.trim();
  } else {
    message = `[Unknown Error] ${error.message}`.trim();
  }
  if (error.config?.url) {
    message = `${message} (${error.config.url})`.trim();
  }
  return message;
}

export function getErrorMessage(
  error: unknown,
  fallback: string = '未知错误',
): string {
  return (
    getAxiosErrorMessage(error)?.trim() ||
    getErrorMessage_(error)?.trim() ||
    fallback
  );
}

export function toastErrorMessage(error: unknown) {
  const message = getErrorMessage(error);
  toast.error(message, { id: `error: ${message}` });
}
