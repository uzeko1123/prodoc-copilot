import { clearAuth } from '@/features/auth/lib/clear-auth';
import { toastErrorMessage } from '@/lib/error-message';
import { router } from '@/lib/router';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

let redirectingToLogin = false;

function redirectToLogin() {
  if (router.state.location.pathname === '/account/login') return;
  if (redirectingToLogin) return;
  redirectingToLogin = true;

  toastErrorMessage('认证信息失效，请重新登录。');
  router
    .navigate({
      to: '/account/login',
      search: { redirect: router.state.location.href },
      replace: true,
    })
    .finally(() => {
      clearAuth();
      redirectingToLogin = false;
    });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
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
        redirectToLogin();
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        mutation.options.onError = () => undefined;
        redirectToLogin();
        return;
      }
      if (mutation.options.onError) return;
      toastErrorMessage(error);
    },
  }),
});
