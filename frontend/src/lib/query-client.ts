import { clearAuth } from '@/features/auth/lib/clear-auth';
import { toastErrorMessage } from '@/lib/error-message';
import { router } from '@/lib/router';
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        !(isAxiosError(error) && (error.response?.status ?? 0) < 500) &&
        failureCount < 3,
      throwOnError: (error) =>
        !(isAxiosError(error) && error.response?.status === 401),
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        toastErrorMessage('认证信息失效，请重新登录。');
        clearAuth();
        router.navigate({ to: '/account/login' });
        return;
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        mutation.options.onError = () => undefined;
        toastErrorMessage('认证信息失效，请重新登录。');
        clearAuth();
        router.navigate({ to: '/account/login' });
        return;
      }
      if (mutation.options.onError) return;
      toastErrorMessage(error);
    },
  }),
});
